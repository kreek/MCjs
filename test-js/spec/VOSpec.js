describe("VO", function () {

    beforeEach(function () {
		this.mc = MC.Context();
    });

	it("has a unique id", function () {
		var vo = MC.VO({
			name: "foo"
		});
		
		expect(vo.id).not.toBeNull();
		expect(vo.id).not.toBeUndefined();
	});

});