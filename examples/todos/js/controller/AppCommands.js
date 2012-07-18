(function($) {
	
	window.app.AppCommands = Trait({

		//  STARTUP  //////////////////////////////////////////////////////////////

		startupCommand: function() {
			var todosProxy = this.m.get('todosProxy');
			todosProxy.addTodo("Learn MCjs");
			todosProxy.addTodo("Buy milk");
			todosProxy.addTodo("Walk the dog");
			this.trigger("todos:update", todosProxy.todosArray());
		},

		//  ADD  //////////////////////////////////////////////////////////////////

		addCommand: function(title) {
			var todosProxy = this.m.get('todosProxy');
			todosProxy.addTodo(title);
			this.trigger("todos:update", todosProxy.todosArray());
		},

		//  REMOVE  ///////////////////////////////////////////////////////////////

		removeCommand: function(id) {
			var todosProxy = this.m.get('todosProxy');
			todosProxy.removeTodo(id);
			this.trigger("todos:update", todosProxy.todosArray());
		},
		
	});
	
})(jQuery);