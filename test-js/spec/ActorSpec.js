describe("Actor", function () {

    beforeEach(function () {
		this.actor = Trait.create(Object.prototype, MC.TActor);

    });

	afterEach(function () {

	});

	it("Observable: bind and trigger", function () {
		this.EventDispatcher.bind("event:test", this.obj.increment, this);
		this.EventDispatcher.trigger("event:test");
		expect(this.i).toBe(5);
	});


});