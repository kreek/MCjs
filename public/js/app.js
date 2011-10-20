jQuery(function($){
	var app = window.app = MC.App();
	var LoadEvent = app.composeEvent(Trait({LOADED: "loaded"}));

	$('#target').click(function(event) {
		console.log(event);
		console.log(window.app.version);
	});
	
	//var myMessage = app.create.Message("EVENT_TYPE", false);
	app.createProxy("funk", Trait({
		sayHello: function() {
			var e = Trait.create(
				Object.prototype,
				LoadEvent
			);
		},
		sayGoodbye: function() {
			console.log("bye");
		}
	}));
	
	var c = app.createCommand(function() {
		console.log("command fired!");
	});
	
	var p = app.fetchProxy("funk");
	p.sayHello();

});