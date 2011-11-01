$(function(){
	
	this.mc = MC.Context(Trait({
		
		initialize: function() {
			
			// model
			var greetingProxy = MC.Proxy(Trait({
				greeting: "Hello, ",
				sayHello: function(greeting) {
					this.greeting += greeting;
					this.trigger("model:updated", this.greeting);
				}
			}));
			
			// view
			var view = MC.View(Trait({
				el: "#app",
				initialize: function() {
					this.bind("click", "#greetLink", this.update);
					this.bind("model:updated", this.render);
				},
				update: function() {
					this.trigger("update:greeting", "World!");
				},
				render: function(greeting) {
					$("#label").html(greeting);
				}
			}));
			
			// controller
			var commands = MC.Controller(Trait({
				sayHello: function(greeting) {
					var greetingProxy = this.m.get('greetingProxy');
					greetingProxy.sayHello(greeting);
				}
			}));
			
			// map model
			this.m.put('greetingProxy', greetingProxy);
			// map event to command
			this.bind("update:greeting", commands.sayHello);
		}
		
	}));
	
});