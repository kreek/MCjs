var dependant = function(dependencies, func) {
    func.dependencies = dependencies;
    return func;
}

var Container = function() {
    var namespaces;
    var instances;
    var constructors;

    return {
        _init: function() {
            namespaces = [];
            instances = {};
            constructors = {};

            return this;
        },
        addNamespace: function(namespace) {
            namespaces.push(namespace);
        },
        get: function(klass) {
            if(!instances[klass]) {
                if(constructors[klass]) {
                    instances[klass] = constructors[klass]();
                } else {
                    instances[klass] = this.create(klass);
                };
            };
            return instances[klass];
        },
        create: function(klass) {
            for(var i = 0; i < namespaces.length; i++) {
                if(namespaces[i][klass] && typeof namespaces[i][klass] == "function") {
                    var constr = namespaces[i][klass];
                    if(constr.dependencies) {
                        var args = [];
                        for(var j = 0; j < constr.dependencies.length; j++) {
                            args.push(this.get(constr.dependencies[j]));
                        };
                        return constr.apply(namespaces[i], args);
                    } else if(constr.length == 0) {
                        return constr();
                    };
                };
            };
            throw "Cannot create '"+ klass +"' because there isn't a registered instance or \
                   constructor, and there was no way to auto wire it.";
        },
        registerConstructor: function(klass, creator) {
            constructors[klass] = creator;
        },
        registerInstance: function(klass, instance) {
            instances[klass] = instance;
        }
    }._init();
};

var ns = {};
ns.Alerter = function() {
    return {
        alert: function(message) {
            alert(message);
        },
		log: function(message) {
			console.log(message);
		}
    }
}

ns.MyObject = dependant(
    ["Alerter"],
    function(alerter) {
        return {
            doStuff: function() {
                alerter.log("Mjello!");
            },
			moreStuff: function() {
				alerter.log("yaya");
			}
        }
    }
);

var cn = Container();
cn.addNamespace(ns);

var o = cn.get("MyObject");
o.doStuff();
o.moreStuff();