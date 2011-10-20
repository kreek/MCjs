(function(){
	var MC;
	if (typeof exports !== "undefined") {
		MC = exports;
	} else {
		MC = this.MC = {};
	}
	
	MC.version = "0.0.4";
	
	// Classes (or prototypial inheritors)
	
	if (typeof Object.create !== "function") {
		Object.create = function(o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
	
	var moduleKeywords = ["included", "extended"];
	
	var Class = MC.Class = {
		
		inherited: function(){},
		created: function(){},
			
		prototype: {
			initialize: function(){},
			init: function(){}
		},
		
		create: function(include, extend){
			var object = Object.create(this);
			object.parent = this;
			object.prototype = object.fn = Object.create(this.prototype);
			
			if (include) object.include(include);
			if (extend)  object.extend(extend);
			
			object.created();
			this.inherited(object);
			return object;
		},
		
		init: function(){
			var instance = Object.create(this.prototype);
			instance.parent = this;

			instance.initialize.apply(instance, arguments);
			instance.init.apply(instance, arguments);
			return instance;	
		},
		
		proxy: function(func) {
			var thisObject = this;
			return(function() { 
				return func.apply(thisObject, arguments); 
			});
		},
		
		proxyAll: function() {
			var functions = makeArray(arguments);
			for (var i=0; i < functions.length; i++)
			this[functions[i]] = this.proxy(this[functions[i]]);
		},
		
		include: function(obj) {
			for(var key in obj)
				if (moduleKeywords.indexOf(key) == -1)
          			this.fn[key] = obj[key];
			
			var included = obj.included;
			if (included) included.apply(this);
			return this;
		},
		
		extend: function(obj) {
			for(var key in obj)
				if (moduleKeywords.indexOf(key) == -1)
          			this[key] = obj[key];

			var extended = obj.extended;
			if (extended) extended.apply(this);
			return this;
		}
	};
	
	Class.prototype.proxy    = Class.proxy;
	Class.prototype.proxyAll = Class.proxyAll;
	Class.inst               = Class.init;
	Class.sub                = Class.create;
	
	var EventDispatcher = 

})();