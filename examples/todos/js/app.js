$(function(){
	
	this.mc = MC.Context(Trait({

		initialize: function() {

			// model, storing reference for access in commands
			this.m.put('todosProxy', MC.Proxy(window.app.TodosProxy));

			// view
			MC.View(window.app.TodosView);
			MC.View(window.app.FormView);

			// controller
			var appCommands = MC.Controller(window.app.AppCommands);

			// bind commands
			this.bind("startup", appCommands.startupCommand);
			this.bind("todos:add", appCommands.addCommand);
			this.bind("todos:remove", appCommands.removeCommand);

			// go!
			this.trigger('startup');

		}
		
	}));

});