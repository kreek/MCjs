describe("Service", function () {
	
	describe("Local", function () {

		beforeEach(function () {
			this.mc = MC.Context();
	    });

		it("persists a value object", function () {
			
			localStorage.clear();
			
			var service = MC.Service(Trait({
				type: "local",
				resource: "Tests"
			}));

			var vo = MC.VO({name: "foo"});
			var id = vo.id;
			service.save(vo);
			var store = JSON.parse(localStorage.getItem("Tests"));
			
			expect(store[id].id).toBe(id);
			
		});
		
		it("retrieves a value object", function () {
			
			localStorage.clear();
			
			var service = MC.Service(Trait({
				type: "local",
				resource: "Tests"
			}));

			var vo = MC.VO({name: "foo"});
			var id = vo.id;
			service.save(vo);
			var savedVO = service.get(id);

			expect(vo.id).toBe(savedVO.id);
			
		});
		
		it("destroys a value object", function () {
			
			localStorage.clear();
			
			var service = MC.Service(Trait({
				type: "local",
				resource: "Tests"
			}));

			var vo = MC.VO({name: "foo"});
			var id = vo.id;
			service.save(vo);
			var savedVO = service.get(id);
			
			expect(vo.id).toBe(savedVO.id);

			service.destroy(id);
			var destroyedVO = service.get(id);
			
			expect(destroyedVO).toBeFalsy();
			
		});
		
		it("persists many value objects", function () {
			
			localStorage.clear();
			
			var service = MC.Service(Trait({
				type: "local",
				resource: "Tests"
			}));

			var vos = [
				MC.VO({name: "a"}),
				MC.VO({name: "b"}),
				MC.VO({name: "c"})
			];
	
			var ids = {
				a: vos[0].id, 
				b: vos[1].id, 
				c: vos[2].id
			};
			
			service.save(vos);
			
			var a = service.get(ids.a);
			var b = service.get(ids.b);
			var c = service.get(ids.c);
			
			expect(a.id).toBe(a.id);
			expect(b.id).toBe(b.id);
			expect(c.id).toBe(c.id);
			
		});

	});

});