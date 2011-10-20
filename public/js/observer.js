var EventDispatcher = {
    listeners: {
        any: [] // event type: listeners
    },
    addEventListener: function (fn, type) {
        type = type || 'any';
        if (typeof this.listeners[type] === "undefined") {
            this.listeners[type] = [];
        }
        this.listeners[type].push(fn);
    },
    removeEventListener: function (fn, type) {
        this.visitSubscribers('removeEventListener', fn, type);
    },
    dispatchEvent: function (publication, type) {
        this.visitSubscribers('dispatchEvent', publication, type);
    },
    visitSubscribers: function (action, arg, type) {
        var pubtype = type || 'any',
            listeners = this.listeners[pubtype],
            i,
            max = listeners.length;

        for (i = 0; i < max; i += 1) {
            if (action === 'dispatchEvent') {
                listeners[i](arg);
            } else {
                if (listeners[i] === arg) {
                    listeners.splice(i, 1);
                }
            }
        }
    }
};

function makePublisher(o) {
    var i;
    for (i in EventDispatcher) {
        if (EventDispatcher.hasOwnProperty(i) && typeof EventDispatcher[i] === "function") {
            o[i] = EventDispatcher[i];
        }
    }
    o.listeners = {any: []};
}

var paper = {
    daily: function () {
        this.dispatchEvent("big news today");
    },
    monthly: function () {
        this.dispatchEvent("interesting analysis", "monthly");
    }
};

makePublisher(paper);

var joe = {
    drinkCoffee: function (paper) {
        console.log('Just read ' + paper);
    },
    sundayPreNap: function (monthly) {
        console.log('About to fall asleep reading this ' + monthly);
    }
};

paper.addEventListener(joe.drinkCoffee);
paper.addEventListener(joe.sundayPreNap, 'monthly');

paper.daily();
paper.daily();
paper.daily();
paper.monthly();