describe("Observable", function () {

    beforeEach(function () {
		this.messenger = Trait.create(Object.prototype, MC.TObservable);
		this.i = 0;
		this.j = 0;
		this.obj = {
			increment: function() {
				this.i += 1;
			},
			increment2: function() {
				this.j += 1;
			}
		}
    });

	afterEach(function () {
		this.i = 0;
		this.j = 0;
		this.messenger.unbind("event:test", this.obj.increment);
	});

	it("bind and trigger", function () {
		this.messenger.bind("event:test", this.obj.increment, this);
		this.messenger.trigger("event:test");
		this.messenger.trigger("event:test");
		this.messenger.trigger("event:test");
		this.messenger.trigger("event:test");
		this.messenger.trigger("event:test");
		expect(this.i).toBe(5);
	});
	
	it("bind then unbind", function () {
		this.messenger.bind("event:test", this.obj.increment, this);
		this.messenger.trigger("event:test");
		this.messenger.unbind("event:test", this.obj.increment, this);
		this.messenger.trigger("event:test");
		expect(this.i).toBe(1);
	});
	
	it("bind two functions to same event, unbind one", function () {
		this.messenger.bind("event:test", this.obj.increment, this);
		this.messenger.bind("event:test", this.obj.increment2, this);
		this.messenger.trigger("event:test");
		this.messenger.unbind("event:test", this.obj.increment, this);
		this.messenger.trigger("event:test");
		expect(this.i).toBe(1);
		expect(this.j).toBe(2);
	});

});