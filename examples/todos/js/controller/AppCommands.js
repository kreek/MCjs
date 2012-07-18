(function($) {
	
	window.app.AppCommands = Trait({

		//  STARTUP  //////////////////////////////////////////////////////////////

		startupCommand: function() {
			var todosProxy = this.m.get('todosProxy');
			todosProxy.addTodo("Learn MCjs");
			todosProxy.addTodo("Buy milk");
			todosProxy.addTodo("Walk the dog");
		},

		//  ADD  //////////////////////////////////////////////////////////////////

		addCommand: function(title) {
			var todosProxy = this.m.get('todosProxy');
			todosProxy.addTodo(title);
		},

		//  REMOVE  ///////////////////////////////////////////////////////////////

		removeCommand: function(id) {
			var todosProxy = this.m.get('todosProxy');
			todosProxy.removeTodo(id);
		},
		
	});
	
})(jQuery);