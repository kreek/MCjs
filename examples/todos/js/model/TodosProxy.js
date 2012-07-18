(function($) {

	window.app.TodosProxy = Trait({
		todos: {},
		addTodo: function(title) {
			var id = MC.guid();
			this.todos[id] = {
				id: id, 
				title: title, 
				completed: false
			};
		},
		removeTodo: function(id) {
			delete this.todos[id];
		},
		todosArray: function() {
			// convert object to array for template
			var a = [];
			for (var key in this.todos) {
    		a.push(this.todos[key]);
			}
			return a;
		},
	});

})(jQuery);