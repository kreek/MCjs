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
		count: 0,
		put: function(key, value) {
			if (!this.key) {
				this.key = value;
				this.count++;
			} else {
				throw "key exists"
			}
		},
		get: function(key) {
			if (this.key) {
				return this.key;
			} else {
				throw "no value for that key"
			}
		},
		remove: function(key) {
			var obj = this.key;
			this.key = null;
			delete this.key;
			this.count--;
			return obj;
		},
		getValue: function(value) {
			for (obj in this) {
				if (this[obj] == v) {
					return obj;
				}
			}
		},
		size: function(){
			return this.count;
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
				return this._messenger.bind(ev, callback, context);
			},
			unbind: function(ev, callback) {
				return this._messenger.unbind(ev, callback);
			}
		});
	},
	
	MC.makeDispatcher = function(messenger) {
		return Trait({
			_messenger: messenger,
			trigger: function(eventName) {
				return this._messenger.trigger(eventName);
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
	// CONTROLLER
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeController = function(messenger) {
		return MC.makeDispatcher(messenger);
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTEXT
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeContext = function(messenger) {
		return Trait({
			_messenger: messenger,
			m: Object.create(Object.prototype, MC.TMap),
			Model: function(obj) {
				var actor = Object.create(
					Object.prototype,
					Trait.compose(
						MC.makeActor(this._messenger), 
						Trait(obj)));
				return actor;
			},
			View: function(obj) {
				var mediator = Object.create(
					Object.prototype, 
					Trait.compose(
						MC.makeMediator(this._messenger),
						Trait(obj)));
				return mediator;
			},
			Controller: function(obj) {
				var controller = Object.create(
					Object.prototype, 
					Trait.compose(
						MC.makeController(this._messenger),
						Trait(obj)));
				return controller;
			},
			bind: function(ev, callback) {
				return this._messenger.bind(ev, callback, this);
			},
			unbind: function(ev, callback) {
				return this._messenger.unbind(ev, callback);
			},
			trigger: function(ev) {
				return this._messenger.trigger(ev);
			}
		})
	};
	
	MC.Context = function(trait) {
		if (!trait) {
			trait = Trait({});
		}
		var messenger = Trait.create(Object.prototype, MC.TObservable);
		var context = Trait.create(
			Object.prototype,
			Trait.compose(
				MC.makeContext(messenger),
				trait
			)
		);
		return context;
	}
	
})();