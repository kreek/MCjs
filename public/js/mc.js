(function(){
	
	var MC;
	
	if (typeof exports !== "undefined") {
		MC = exports;
	} else {
		MC = this.MC = {};
	}
	
	MC.version = "0.0.1";
	
	MC.TMessage = Trait({
		type: "",
		body: null
	});

	MC.TListenable = Trait({
		eventMap: {},
		addEventListener: function(type, fn) {
			this.eventMap[type] = fn;
		},
		removeEventListener: function(type) {
			delete this.eventMap[type];
		},
		dispatchEvent: function(e) {
			this.eventMap[e.type].call(this, e);
		}
	});
	
	MC.TPersistable = Trait({
		save: function() {
			console.log("save!");
		}
	});
	
	MC.App = function() {
		return Trait.create(Object.prototype,
			Trait.compose(
				MC.TListenable,
				Trait({
					name: "MCjs",
					version: "0.0.1",
					commandMap: {},
					proxyMap: {},
					createCommand: function(fn) {
						return Trait.create(
							Object.prototype,
							Trait({
								execute: fn
							})
						);
					},
					composeEvent: function(Event) {
						return Trait.compose(
							MC.TMessage,
							Trait({
								dispatch: this.dispatchEvent
							}),
							Event);
					},
					mapEvent: function(e, c) {
						this.addEventListener(e.type, c.execute);
					},
					unmapEvent: function(e, c) {
						this.removeEventListener(e.type, c.execute);
					},
					createProxy: function(name, Proxy) {
						if (this.proxyMap[name] == null) {
							this.proxyMap[name] = Trait.create(
								Object.prototype,
								Trait.compose(
									MC.TListenable,
									MC.TPersistable,
									Trait({
										dispatch: this.dispatchEvent
									}),
									Proxy));
						}
						else {
							throw "Proxy " + name + " already exists!";
						}
					},
					fetchProxy: function(name) {
						if (this.proxyMap[name] != null) {
							return this.proxyMap[name];
						}
						else {
							throw "Proxy " + name + " does not exists";
						}
					}
				})
			)
		);
	}
	
})();