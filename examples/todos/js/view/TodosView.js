(function($) {
	
	window.app.TodosView = Trait({
		el: '#todos-list',
		initialize: function() {
			// system events
			this.bind('todos:update', this.render);
			// dom events
			this.delegate('li', 'click', this.clickHandler);
		},
		render: function(todos) {
			var todosTemplate = $("#todos-template").tmpl(todos);
			this.el.html(todosTemplate);
		},
		clickHandler:function(e) {
			this.trigger("todos:remove", e.currentTarget.id);
		},
	});
	
})(jQuery);