describe("TObservable", function () {

    beforeEach(function () {
		this._messenger = Trait.create(Object.prototype, MC.TObservable);
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
		this._messenger.unbind("event:test", this.obj.increment);
	});

	it("bind and trigger", function () {
		this._messenger.bind("event:test", this.obj.increment, this);
		this._messenger.trigger("event:test");
		this._messenger.trigger("event:test");
		this._messenger.trigger("event:test");
		this._messenger.trigger("event:test");
		this._messenger.trigger("event:test");
		expect(this.i).toBe(5);
	});
	
	it("bind then unbind", function () {
		this._messenger.bind("event:test", this.obj.increment, this);
		this._messenger.trigger("event:test");
		this._messenger.unbind("event:test", this.obj.increment, this);
		this._messenger.trigger("event:test");
		expect(this.i).toBe(1);
	});
	
	it("bind two functions to same event, unbind one", function () {
		this._messenger.bind("event:test", this.obj.increment, this);
		this._messenger.bind("event:test", this.obj.increment2, this);
		this._messenger.trigger("event:test");
		this._messenger.unbind("event:test", this.obj.increment, this);
		this._messenger.trigger("event:test");
		expect(this.i).toBe(1);
		expect(this.j).toBe(2);
	});

});