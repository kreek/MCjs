describe("TContext", function () {

    beforeEach(function () {
		this.mc = MC.Context();
    });

	afterEach(function () {
		this.mc = null;
	});

	it("exists", function () {
		expect(this.mc).not.toBeNull();
		expect(this.mc).not.toBeUndefined();
	});
	
	it("creates an actor", function () {
		var actor = this.mc.Actor(Trait({
			five: 5
		}));
		expect(actor).not.toBeUndefined();
		expect(actor).not.toBeNull();
		expect(actor.five).toBe(5);
	});
	
	it("creates a command", function () {
		var command = this.mc.Command(Trait({
			execute: function() {
				return true;
			}
		}));
		expect(command).not.toBeUndefined();
		expect(command).not.toBeNull();
		expect(command.execute()).toBeTruthy();
	});
	
	it("maps a command to an event", function () {
		var actor = this.mc.Actor(Trait({
			five: 5
		}));
		var command = this.mc.Command(Trait({
			execute: function() {
				var i = 5;
				i += 1;
				console.log(i);
			}
		}));
		console.log(command);
		this.mc.mapCommand("command:test", command);
		this.mc.trigger("command:test");
		expect(command).not.toBeUndefined();
		expect(command).not.toBeNull();
	});

});