$(function(){
	
	this.mc = MC.Context();
	
	var model = this.mc.Model(Trait({
		message: null,
		initialize: function() {
			this.message = "Hi!"
		},
		updateMessage: function(message) {
			this.message = message;
			console.log("model updated", message);
			this.trigger("model:updated");
		}
	}));

	var commands = this.mc.Controller(Trait({
		
		updateMessage: function(message) {
			var model = this.m.get('model');
			model.updateMessage(message);
		}
		
	}));
	
	var view = this.mc.View(Trait({
		el: $('#link'),
		events: {
			'click #link': 'clickHandler',
        },
		clickHandler: function() {
			this.trigger("model:update", "Hello World!");
		}
	}));
	
	this.mc.m.put('model', model);
	this.mc.bind('model:update', commands.updateMessage);
	
});