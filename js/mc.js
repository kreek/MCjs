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
	
	// jQuery owns the `$` variable
	var $ = this.jQuery;
	
	MC.guid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}).toUpperCase();      
	};
	
	MC.requireTrait = function(trait, type) {
		if (!trait) {
			throw "0 for 1 required arguments, pass in a trait to create a " + type;
		}
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
		dictionary: Trait.required,
		put: function(key, value) {
			if (!this.dictionary[key]) {
				this.dictionary[key] = value;
				this.count++;
			} else {
				throw "key exists"
			}
		},
		get: function(key) {
			if (this.dictionary[key]) {
				return this.dictionary[key];
			} else {
				throw "no value for that key"
			}
		},
		remove: function(key) {
			var obj = this.dictionary[key];
			this.dictionary[key] = null;
			delete this.dictionary[key];
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
	
	MC.makeMap = function() {
		var map = Object.create(
			Object.prototype,
			Trait.compose(
				MC.TMap,
				Trait({
					dictionary: {}
				})
			)
		);
		return map;
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// OBSERVABLE
	//
	///////////////////////////////////////////////////////////////////////////
	
	// TODO: helpful error message if binding fails
	
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
	
	MC.makeBindable = function() {
		return Trait({
			bind: function(e, fn, context) {
				return this._messenger.bind(e, fn, context);
			},
			unbind: function(e, fn) {
				return this._messenger.unbind(e, fn);
			}
		});
	},
	
	MC.makeTriggerable = function() {
		return Trait({
			trigger: function(eventName, body) {
				return this._messenger.trigger(eventName, body);
			}
		});
	}
	
	///////////////////////////////////////////////////////////////////////////
	//
	// VALUE OBJECT
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.VO = function(obj) {
		var vo = Object.create(
			Object.prototype,
			Trait.compose(
				MC.makeUnique(),
				Trait(obj)
			)
		);
		return vo;
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// ACTOR
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeActor = function() {
		return Trait.compose(
			MC.makeTriggerable(),
			Trait({
				_messenger: Trait.create(Object.prototype, MC.TObservable),
				initialize: function() {}
			})
		);
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// PROXY
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.Proxy = function(trait) {
		MC.requireTrait(trait, "proxy");
		var actor = Object.create(
			Object.prototype,
			Trait.override(
				trait,
				MC.makeActor()
			));
		actor.initialize();
		return actor;
	}
	
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
	
	MC.makeLocalService = function() {
		return Trait.override(
			Trait({
				data: null,
				initialize: function() {
					this.data = JSON.parse(localStorage.getItem(this.resource)) || {};
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
				all: function() {
					return this.data;
				},
				destroy: function(id) {
					delete this.data[id];
					return this.set();
				}
			}),
			MC.TPersistable,
			MC.makeActor()
		);
	};
	
	// remote or local service
	MC.Service = function(trait) {
		MC.requireTrait(trait, "service");
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

	///////////////////////////////////////////////////////////////////////////
	//
	// VIEW
	//
	///////////////////////////////////////////////////////////////////////////

	MC.makeView = function(el) {
		var view = Trait.override( 
			Trait({
				//selector: selector,
				el: el,
				// bind in views is either binding to a system event (2 arguments)
				// or binding to an element's event (3 arguments)
				// this.el works as jquery element because it was set in MC.View
				bind: function(a, b, c) {
					if (arguments.length == 3) {
						// a:event, b: element, c: function
						// delegate binds future elements
						this.el.delegate(b, a, $.proxy(c, this));
					} else if (arguments.length == 2) {
						// a:event, b:function
						// bind to system event
						return this._messenger.bind(a, b, this);
					}
				}
			}),
			MC.makeActor(), 
			MC.makeBindable()
		);
		return view;
	}

	MC.View = function(trait) {
		MC.requireTrait(trait, "view");
		// ensure the elements exists
		if ($(trait.el.value) === 0) {
			throw "View binding error: element with selector '"+ selector +"' does not exist";
		}
		var view = Object.create(
			Object.prototype, 
			Trait.override(
				trait,
				MC.makeView(trait.el.value)
			)
		);
		view.el = $(view.el);
		view.initialize();
		return view;
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTROLLER
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeController = function() {
		return MC.makeTriggerable();
	}
	
	MC.Controller = function(trait) {
		MC.requireTrait(trait, "controller");
		var controller = Object.create(
			Object.prototype, 
			trait);
		return controller;
	};
	
	///////////////////////////////////////////////////////////////////////////
	//
	// CONTEXT
	//
	///////////////////////////////////////////////////////////////////////////
	
	MC.makeContext = function() {
		var context = Trait.override(
			Trait({
				// model dictionary 
				m: MC.makeMap(),
				// service dictionary
				s: MC.makeMap(),
				// overrides listener bind so that commands have context scope
				// i.e. the fn has access to models, services and this.trigger
				bind: function(e, fn) {
					return this._messenger.bind(e, fn, this);
				}
			}),
			MC.makeActor(),
			MC.makeBindable()
		);
		return context;
	};
	
	MC.Context = function(trait) {
		if (!trait) {
			trait = Trait({});
		}
		var context = Trait.create(
			Object.prototype,
			Trait.override(
				trait,
				MC.makeContext()
			)
		);
		context.initialize();
		return context;
	}
	
})();