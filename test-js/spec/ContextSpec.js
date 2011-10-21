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
	
	it("creates an actor", function () {
		var actor = this.context.createActor();
		expect(actor).not.toBeNull();
		expect(actor).not.toBeUndefined();
	});
	
	it("creates a mediator", function () {
		var mediator = this.context.createMediator();
		expect(mediator).not.toBeNull();
		expect(mediator).not.toBeUndefined();
		console.log(mediator);
	});

});