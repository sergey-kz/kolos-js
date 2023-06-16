kolos.Route = function () {
    this.cmd = '';
    this.component = '';
    this.method = '';
    this.params = {};
    this.args = [];
}

kolos.Router = function () {
    let Self = this;
    /** @type {kolos.Route} */
    this.route = undefined;
    this.timer = undefined;
    this.hash = undefined;
    this._interval = 500;
    this._subscribers = {};

    this.subscribe = function (command, callback) {
        if (this._subscribers[command] === undefined) {
            this._subscribers[command] = [];
        }
        this._subscribers[command].push(callback);
    }

    /**
     * @returns {kolos.Route}
     */
    this.parseRoute = function () {
        let route = new kolos.Route();

        // запоминаем текущий маршрут
        Self.route = route;

        let hash = Self.hash;

        if (hash.length < 2) {
            return route;
        }

        // обрезаем '#/' либо '#'
        if (hash[1] === '/') {
            hash = hash.substring(2);
        } else {
            hash = hash.substring(1);
        }

        // разделяем на действие и параметры
        let splitActionParams = hash.split('?');
        let action = kolos.Utils.val(splitActionParams, 0, '');
        let paramStr = kolos.Utils.val(splitActionParams, 1, '');

        // парсим действие -->>

        let arr = action.split('/');

        route.cmd = kolos.Utils.val(arr, 0, '');
        route.component = kolos.Utils.val(arr, 1, '');
        route.method = kolos.Utils.val(arr, 2, '');

        // забираем оставшиеся аргументы из пути /cmd/app/method/arg1/arg2/...
        let args = [];
        if (arr.length > 3) {
            for (let i = 3; i < arr.length; i++) {
                args.push(arr[i]);
            }
        }
        route.args = args;

        // парсим параметры -->>

        let params = {};
        let splitPairs = paramStr.split('&');
        for (let i in splitPairs) {
            let pairStr = splitPairs[i];
            let splitPair = pairStr.split('=');
            let key = kolos.Utils.val(splitPair, 0, undefined);
            let value = kolos.Utils.val(splitPair, 1, '');
            if (key !== undefined && key !== '') {
                params[key] = value;
            }
        }
        route.params = params;

        return route;
    }

    this.checkHash = function () {
        if (document.location.hash !== Self.hash) {
            Self.hash = document.location.hash;

            let route = Self.parseRoute();

            kolos.Utils.debug('Route: ' + document.location.hash + ' => ' + JSON.stringify(route));

            // передаём маршрут всем подписчикам
            let subscribers = Self._subscribers[route.cmd];
            if (subscribers !== undefined) {
                for (let i in subscribers) {
                    let callback = subscribers[i];
                    callback(route);
                }
            }

            let subscribersAll = Self._subscribers['*'];
            if (subscribersAll !== undefined) {
                for (let i in subscribersAll) {
                    let callback = subscribersAll[i];
                    callback(route);
                }
            }

        }
    }

    this.destroy = function () {
        clearTimeout(Self.timer);
        window.removeEventListener('hashchange', Self.checkHash);
    }

    this.init = function () {
        Self.timer = setInterval(Self.checkHash, Self._interval);
        window.addEventListener('hashchange', Self.checkHash);
    }
}
