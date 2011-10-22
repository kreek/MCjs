describe("TContext", function () {

    beforeEach(function () {
		this.context = Trait.create(Object.prototype, MC.TContext);
    });

	afterEach(function () {
		this.context = null;
	});

	it("exists", function () {
		expect(this.context).not.toBeNull();
		expect(this.context).not.toBeUndefined();
	});
	
	it("creates, maps, and retrieves an actor", function () {
		this.context.createActor('actor', {
			five: 5,
			isTrue: function() {
				return true;
			}
		});
		var actor = this.context._injector.get('actor');
		expect(actor.five).toBe(5);
		expect(actor.isTrue).toBeTruthy();
	});

});