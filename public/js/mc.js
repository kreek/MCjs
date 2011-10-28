(function(){
	
	///////////////////////////////////////////////////////////////////////////
	//
	// SETUP
	//
	///////////////////////////////////////////////////////////////////////////
	
	// Save a reference to the global object.
	var root = this;
	var MC;

	// namespace
	if (typeof exports !== "undefined") {
		MC = exports;
	} else {
		MC = root.MC = {};
	}
	
	// version
	MC.version = "0.0.1";
	
	// jQuery, Zepto, or Ender owns the `$` variable
	var $ = root.jQuery || root.Zepto || root.ender;
	
	MC.guid = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}).toUpperCase();      
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// OBSERVABLE
	//
	///////////////////////////////////////////////////////////////////////////

	MC.TObservable = Trait({
		_callbacks: {},
		bind: function(ev, callback, context) {
			var calls = this._callbacks;
			var list  = calls[ev] || (calls[ev] = []);
			list.push([callback, context]);
			return this;
		},
		unbind: function(ev, callback) {
			var calls;
			if (!ev) {
				this._callbacks = {};
			} else if (calls = this._callbacks) {
				if (!callback) {
					calls[ev] = [];
				} else {
					var list = calls[ev];
					if (!list) return this;
					for (var i = 0, l = list.length; i < l; i++) {
						if (list[i] && callback === list[i][0]) {
							list[i] = null;
							break;
						}
					}
				}
			}
		return this;
		},
		trigger: function(eventName) {
			var list, calls, ev, callback, args;
			var both = 2;
			if (!(calls = this._callbacks)) return this;
			while (both--) {
				ev = both ? eventName : 'all';
				if (list = calls[ev]) {
					for (var i = 0, l = list.length; i < l; i++) {
						if (!(callback = list[i])) {
							list.splice(i, 1); i--; l--;
						} else {
							args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
							callback[0].apply(callback[1] || this, args);
						}
					}
				}
			}
			return this;
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	//
	// UNIQUE
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeUnique = function() {
		var guid = MC.guid();
		return Trait({
			id: guid
		});
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// MAP
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.TMap = Trait({
		dictionary: {},
		map: function(key, value) {
			if (!this.dictionary[key]) {
				this.dictionary[key] = value;
			} else {
				throw "key exists!"
			}
		},
		get: function(key) {
			if (this.dictionary[key]) {
				return this.dictionary[key];
			} else {
				throw "no value for that key!"
			}
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	//
	// EVENTDISPATCHER
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeListener = function(messenger) {
		return Trait({
			_messenger: messenger,
			bind: function(ev, callback, context) {
				this._messenger.bind(ev, callback);
				return this;
			},
			unbind: function(ev, callback) {
				this._messenger.unbind(ev, callback);
				return this;
			}
		});
	},
	
	MC.makeDispatcher = function(messenger) {
		return Trait({
			_messenger: messenger,
			trigger: function(eventName) {
				this._messenger.trigger(eventName);
				return this;
			}
		});
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// ACTOR
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeActor = function(messenger) {
		return Trait.compose(
			MC.makeUnique(),
			MC.makeDispatcher(messenger)
		);
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// MEDIATOR
	//
	///////////////////////////////////////////////////////////////////////////

	MC.makeMediator = function(messenger) {
		return Trait.compose( 
			MC.makeActor(messenger), 
			MC.makeDispatcher(messenger)
		);
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// COMMAND
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeCommand = function(messenger, injector) {
		return Trait.compose(
			MC.makeDispatcher(messenger),
			MC.makeUnique(),
			Trait({
				_injector: injector,
				execute: Trait.required
			})
		);
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTEXT
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeContext = function(injector) {
		return Trait({
			_injector: injector,
			Actor: function(trait) {
				var actor = Object.create(
					Object.prototype,
					Trait.compose(
						MC.makeActor(this._messenger), 
						trait));
				return actor;
			},
			Mediator: function(key, el, obj) {
				var mediator = Trait.create(
					Object.prototype, 
					Trait.compose(
						MC.makeMediator(this._messenger),
						Trait(obj)));
				this._injector.map(key, mediator);
				return this;
			},
			Controller: function(trait) {
				var controller = Trait.create(
					Object.prototype, 
					Trait.compose(
						MC.makeController(this._messenger, this._injector),
						trait));
				return controller;
			},
			map: function(key, value) {
				this._injector.map(key, value);
			}
		})
	};
	
	MC.Context = function(trait) {
		if (!trait) {
			trait = Trait({});
		}
		var messenger = Trait.create(Object.prototype, MC.TObservable);
		var injector = Trait.create(Object.prototype, MC.TMap);
		var context = Trait.create(
			Object.prototype,
			Trait.compose(
				MC.makeListener(messenger),
				MC.makeDispatcher(messenger),
				MC.makeContext(injector),
				trait
			)
		);
		return context;
	}
	
	MC.TContext = Trait({
		_messenger: Trait.create(Object.prototype, MC.TObservable),
		_injector: Trait.create(Object.prototype, MC.TMap),
		Actor: function(trait) {
			var actor = Trait.create(
				Object.prototype,
				Trait.compose(
					MC.makeActor(this._messenger), 
					trait));
			return actor;
		},
		Mediator: function(key, el, obj) {
			var mediator = Trait.create(
				Object.prototype, 
				Trait.compose(
					MC.makeMediator(this._messenger),
					Trait(obj)));
			this._injector.map(key, mediator);
			return this;
		},
		Command: function(trait) {
			var command = Object.create(
				Object.prototype, 
				Trait.compose(
					MC.makeCommand(this._messenger, this._injector),
					trait));
			return command;
		},
		mapCommand: function(ev, command) {
			this._messenger.bind(ev, command.execute);
			return this;
		},
		map: function(key, value) {
			this._injector.map(key, actor);
		}
	});
	
})();