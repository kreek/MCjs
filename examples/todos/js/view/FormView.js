(function($) {
	
	window.app.FormView = Trait({
		el: '#enter-form',
		initialize: function() {
			// dom events
			this.delegate('#new-todo', 'keypress', this.keyHandler);
		},
		keyHandler:function(e) {
			if ( e.keyCode !== ENTER_KEY ){
				return;
			}
			if ( !e.currentTarget.value.trim() ){
				return;
			}

			this.trigger('todos:add', e.currentTarget.value);
			e.currentTarget.value = "";
		},
	});
	
})(jQuery);