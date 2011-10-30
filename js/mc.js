(function(){
	
	///////////////////////////////////////////////////////////////////////////
	//
	// SETUP
	//
	///////////////////////////////////////////////////////////////////////////
	
	var MC;

	// namespace
	if (typeof exports !== "undefined") {
		MC = exports;
	} else {
		MC = this.MC = {};
	}
	
	// version
	MC.version = "0.0.1";
	
	// jQuery or Zepto own the `$` variable
	var $ = this.jQuery || this.Zepto;
	
	MC.guid = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}).toUpperCase();      
	};
	
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
		dictionary: {},
		put: function(key, value) {
			if (!this.dictionary.key) {
				this.dictionary.key = value;
				this.count++;
			} else {
				throw "key exists"
			}
		},
		get: function(key) {
			if (this.dictionary.key) {
				return this.dictionary.key;
			} else {
				throw "no value for that key"
			}
		},
		remove: function(key) {
			var obj = this.dictionary.key;
			this.dictionary.key = null;
			delete this.dictionary.key;
			this.count--;
			return obj;
		},
		getValue: function(value) {
			for (obj in this.dictionary) {
				if (this.dictionary[obj] == v) {
					return obj;
				}
			}
		},
		size: function(){
			return this.count;
		},
		load: function(data) {
			this.dictionary = data;
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	//
	// OBSERVABLE
	//
	///////////////////////////////////////////////////////////////////////////

	MC.TObservable = Trait({
		_fns: {},
		bind: function(e, fn, context) {
			var calls = this._fns;
			var list  = calls[e] || (calls[e] = []);
			list.push([fn, context]);
			return this;
		},
		unbind: function(e, fn) {
			var calls;
			if (!e) {
				this._fns = {};
			} else if (calls = this._fns) {
				if (!fn) {
					calls[e] = [];
				} else {
					var list = calls[e];
					if (!list) return this;
					for (var i = 0, l = list.length; i < l; i++) {
						if (list[i] && fn === list[i][0]) {
							list[i] = null;
							break;
						}
					}
				}
			}
		return this;
		},
		trigger: function(eventName, body) {
			var list, calls, e, fn, args;
			var both = 2;
			if (!(calls = this._fns)) return this;
			while (both--) {
				e = both ? eventName : 'all';
				if (list = calls[e]) {
					for (var i = 0, l = list.length; i < l; i++) {
						if (!(fn = list[i])) {
							list.splice(i, 1); i--; l--;
						} else {
							fn[0].apply(fn[1] || this, [body]);
						}
					}
				}
			}
			return this;
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	//
	// EVENTS
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeBindable = function(messenger) {
		return Trait({
			_messenger: messenger,
			bind: function(e, fn, context) {
				return this._messenger.bind(e, fn, context);
			},
			unbind: function(e, fn) {
				return this._messenger.unbind(e, fn);
			}
		});
	},
	
	MC.makeTriggerable = function(messenger) {
		return Trait({
			_messenger: messenger,
			trigger: function(eventName, body) {
				return this._messenger.trigger(eventName, body);
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
			MC.makeTriggerable(messenger),
			Trait({
				initialize: function() {}
			})
		);
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// SERVICE
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.TPersistable = Trait({
		resource: Trait.required,
		data: Trait.required,
		save: Trait.required,
		get: Trait.required,
		destroy: Trait.required,
	});
	
	MC.makeLocalService = function(messenger) {
		return Trait.override(
			Trait({
				data: null,
				initialize: function() {
					this.data = JSON.parse(localStorage.getItem(this.RL)) || {};
					this.set();
				},
				set: function() {
					localStorage.setItem(this.resource, JSON.stringify(this.data));
				},
				save: function(d) {
					var array = [];
					if (!d.length) {
						array.push(d);
					} else {
						array = d;
					}
					for (i in array) {
						var vo = array[i];
						this.data[vo.id] = vo;
					}
					return this.set();
				},
				get: function(id) {
					var vo = this.data[id];
					return vo;
				},
				destroy: function(id) {
					delete this.data[id];
					return this.set();
				}
			}),
			MC.TPersistable,
			MC.makeActor(messenger)
		);
	}

	///////////////////////////////////////////////////////////////////////////
	//
	// VIEW
	//
	///////////////////////////////////////////////////////////////////////////

	MC.makeView = function(messenger, el) {
		return Trait.compose( 
			MC.makeActor(messenger), 
			MC.makeBindable(messenger),
			Trait({
				el: Trait.required,
				eventSplitter: /^(\w+)\s*(.*)$/,
				delegateEvents: function() {
					var eventName, key, match, fn, selector, results;
					results = [];
					for (key in this.events) {
						fn = this[this.events[key]];
						if (typeof fn !== 'function') {
							throw "events must be bound to a function";
						}
						match = key.match(this.eventSplitter);
						eventName = match[1];
						selector = match[2];
						results.push(this.el.bind(eventName, $.proxy(fn, this)));
					}
					return results;
			    }
			})
		);
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTROLLER
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeController = function(messenger) {
		return MC.makeTriggerable(messenger);
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTEXT
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeContext = function(messenger) {
		var context = Trait.override(
			Trait({
				// the system messenger, injected into all actors
				_messenger: messenger,
				// model dictionary 
				m: Object.create(Object.prototype, MC.TMap),
				Model: function(trait) {
					var actor = Object.create(
						Object.prototype,
						Trait.override(
							trait,
							MC.makeActor(this._messenger)
						));
					actor.initialize();
					return actor;
				},
				View: function(trait) {
					var view = Object.create(
						Object.prototype, 
						Trait.compose(
							MC.makeView(this._messenger),
							trait));
					// bind any $ events to view functions
					view.delegateEvents();
					view.initialize();
					return view;
				},
				Controller: function(trait) {
					var controller = Object.create(
						Object.prototype, 
						trait);
					return controller;
				},
				Service: function(trait) {
					var serviceTrait;
					switch(trait.type.value) {
						case "local":
							serviceTrait = MC.makeLocalService();
							break;
						case "remote":
							break;
						default:
							throw "No such service type";
					}
					var service = Object.create(
						Object.prototype,
						Trait.compose(
							serviceTrait,
							trait
						)
					);
					service.initialize();
					return service;
				},
				VO: function(obj) {
					var vo = Object.create(
						Object.prototype,
						Trait.compose(
							MC.makeUnique(),
							Trait(obj)
						)
					);
					return vo;
				},
				// overrides listener bind so that commands have context scope
				// i.e. the fn has access to this.m and this.trigger
				bind: function(e, fn) {
					return this._messenger.bind(e, fn, this);
				}
			}),
			MC.makeActor(messenger),
			MC.makeBindable(messenger)
		);
		return context;
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