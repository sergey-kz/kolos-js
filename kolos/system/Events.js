kolos.Events = {};

kolos.Events.Event = function (action) {
    let Self = this;
    this.__action = action;
    this.__listeners = {};

    this.addListener = function (key, callback) {
        if (this.__listeners[key] !== undefined) {
            kolos.Utils.error('Listener ' + key + ' exists');
        }
        this.__listeners[key] = callback;
    }

    this.removeListener = function (key) {
        delete this.__listeners[key];
    }

    this.execute = function () {
        if (this.__action !== undefined) {
            this.__action(this.__callbackAction);
        }
    }

    this.send = function (data) {
        for (let key in Self.__listeners) {
            let listenerCallback = Self.__listeners[key];
            try {
                listenerCallback(data);
            } catch (e) {
                kolos.Utils.error('Failed execute listener key=' + key + ', err=' + e);
                kolos.Utils.error(e);
            }
        }
    }

    this.__callbackAction = function (data) {
        Self.send(data);
    }
}
