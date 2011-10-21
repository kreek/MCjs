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
		retrieve: function(key) {
			if (this.dictionary[key]) {
				this.dictionary[key] = value;
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
	
	MC.makeEventDispatcher = function(messenger) {
		return Trait({
			_messenger: messenger,
			bind: function(ev, callback, context) {
				this._messenger.bind(ev, callback);
				return this;
			},
			unbind: function(ev, callback) {
				this._messenger.unbind(ev, callback);
				return this;
			},
			trigger: function(eventName) {
				this._messenger.trigger(eventName);
				return this;
			}
		});
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// ACTOR
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeActor = function(messenger) {
		return Trait.compose(
			MC.makeUnique(),
			MC.makeEventDispatcher(messenger)
		);
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// MEDIATOR
	//
	///////////////////////////////////////////////////////////////////////////

	MC.makeMediator = function(messenger) {
		return Trait.compose( 
			MC.makeEventDispatcher(messenger), 
			Trait({

			}));
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTROLLER
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeController = function(messenger, injector) {
		return Trait.compose(
				MC.makeMediator(messenger),
				Trait({
					_injector: injector,
					get: function(key) {
						_injector.retrieve(key);
					}
				})
			);
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTEXT
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.TContext = Trait({
		_messenger: Trait.create(Object.prototype, MC.TObservable),
		_injector: Trait.create(Object.prototype, MC.TMap),
		createActor: function() {
			return Trait.create(Object.prototype, MC.makeActor(this._messenger));
		},
		createMediator: function() {
			return Trait.create(Object.prototype, MC.makeMediator(this._messenger));
		},
		createController: function() {
			return Trait.create(Object.prototype, MC.makeController(
				this._messenger, this._injector));
		}
	});
	
})();