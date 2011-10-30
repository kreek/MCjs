describe("Context", function () {

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
	
	it("creates a model", function () {
		var model = this.mc.Model(Trait({
			five: 5
		}));
		expect(model).not.toBeUndefined();
		expect(model).not.toBeNull();
		expect(model.five).toBe(5);
	});
	
	it("creates a controller", function () {
		var controller = this.mc.Controller(Trait({
			a: function() {
				return true;
			}
		}));

		expect(controller).not.toBeUndefined();
		expect(controller).not.toBeNull();
		expect(controller.a()).toBeTruthy();
	});
	
	it("binds a function to an event", function () {
		var model = this.mc.Model(Trait({
			i: 0
		}));

		var controller = this.mc.Controller(Trait({
			execute: function() {
				var model = this.m.get('model');
				model.i++;
			}
		}));
		
		this.mc.m.put('model', model);
		this.mc.bind('execute', controller.execute);
		this.mc.trigger('execute');

		expect(model.i).toBe(1);
	});

});