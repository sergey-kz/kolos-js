JSON.safeStringify = (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
            typeof value === "object" && value !== null
                ? cache.includes(value)
                    ? undefined
                    : cache.push(value) && value
                : value,
        indent
    );
    cache = null;
    return retVal;
};

kolos.Utils = {

    __debug: false,
    __delayRequest: false,
    __verRand: false,
    __ver: '',
    __verCore: '1.1',
    __loadJs: {},
    __loadCss: {},

    val: function (arr, key, def = undefined) {
        if (arr === undefined || arr[key] === undefined) {
            return def;
        }
        return arr[key];
    },

    setDebugMode: function (val) {
        if (val === undefined) {
            val = true;
        }
        kolos.Utils.__debug = val;
        kolos.Utils.__verRand = val
    },

    setVersion: function (ver) {
        kolos.Utils.__ver = '-' + ver;
    },

    getVer: function () {
        if (kolos.Utils.__verRand) {
            return kolos.Utils.random(0, 99999);
        }
        return kolos.Utils.__verCore + kolos.Utils.__ver;
    },

    /**
     * Load script and call executor after loading
     * @param src
     * @param executor
     */
    loadScriptAndExec: function(src, executor) {

        /**
         * Контекст загрузки скрипта
         * @param src
         */
        let ScriptContext = function (src) {
            let Self = this;
            this.callbackList = [];
            this.isAdd = false;
            this.isLoad = false;

            this.addExecutor = function (callback) {
                this.callbackList.push(callback);
            }

            this.execute = function() {
                // создаём загрузчик скрипт, если не был создан
                this.__createLoader();
                // выполняем колбэки, если скрипт уже загружен
                this.__executeCallback();
            }

            this.__createLoader = function () {
                if (!this.isAdd) {
                    this.isAdd = true;
                    // добавляем скрипт на загрузку
                    let script = document.createElement('script');
                    let head = document.getElementsByTagName('head')[0];
                    script.type = 'text/javascript';
                    script.src  = src + '?v=' + kolos.Utils.getVer();
                    script.onload = function() {
                        Self.isLoad = true;
                        kolos.Utils.debug('Script loaded: ' + src);
                        // выполняем колбэки
                        Self.__executeCallback();
                    }
                    head.appendChild(script);
                }
            }

            this.__executeCallback = function () {
                if (this.isLoad) {
                    let list = Self.callbackList;
                    // затираем колбэки, и считаем их выполнеными
                    Self.callbackList = [];
                    // выполняем каждый колбэки
                    for (let i in list) {
                        let callback = list[i];
                        try {
                            callback();
                        } catch (e) {
                            kolos.Utils.error(e);
                        }
                    }
                }
            }
        }

        if (this.__loadJs[src] === undefined) {
            this.__loadJs[src] = new ScriptContext(src);
        }

        let context = this.__loadJs[src];
        if (executor !== undefined) {
            context.addExecutor(executor);
        }
        context.execute();
    },

    loadScripts: function (urlArr, callback) {
        let Self = kolos.Utils;

        let ScriptBatch = function (urlArr, callback) {
            this.callback = callback;
            this.count = urlArr.length;
            this.counter = 0;

            this.handlerLoad = function() {
                this.counter++;
                if (this.counter >= this.count) {
                    this.callback(urlArr);
                }
            }
        }

        let batch = new ScriptBatch(urlArr, callback);

        for (let i in urlArr) {
            let url = urlArr[i];
            Self.loadScriptAndExec(url, () => {
                batch.handlerLoad();
            });
        }
    },

    loadCss: function (src) {
        if (this.__loadCss[src] !== undefined) {
            return;
        }
        this.__loadCss[src] = true;
        //--
        let link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = src + '?v=' + kolos.Utils.getVer();
        link.media = 'all';
        //link.setAttribute('onload', 'alert("asdfsf")');
        document.getElementsByTagName('HEAD')[0].appendChild(link);
    },

    rawurlencode: function(str){
        str = (str + '').toString();
        return escape(encodeURIComponent(str));
    },

    rawurldecode: function(str){
        str = (str + '').toString();
        return decodeURIComponent(unescape(str));
    },

    objToParams: function(params) {
        var arrTmp = [];
        for (var key in params) {
            arrTmp.push(key + '=' + rawurlencode(params[key]));
        }
        return arrTmp.join('&');
    },

    setCookie: function(name, value, expires, path, domain, secure) {
        // name, value - обязательные параметры
        document.cookie = name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
    },

    getCookie: function(name) {
        var cookie = " " + document.cookie;
        var search = " " + name + "=";
        var setStr = null;
        var offset = 0;
        var end = 0;
        if (cookie.length > 0) {
            offset = cookie.indexOf(search);
            if (offset != -1) {
                offset += search.length;
                end = cookie.indexOf(";", offset)
                if (end == -1) {
                    end = cookie.length;
                }
                setStr = unescape(cookie.substring(offset, end));
            }
        }
        return(setStr);
    },

    getBrowser: function(){
        var ua = navigator.userAgent;
        if (ua.match(/MSIE/)) return 'IE';
        if (ua.match(/Firefox/)) return 'Firefox';
        if (ua.match(/Opera/)) return 'Opera';
        if (ua.match(/Chrome/)) return 'Chrome';
        if (ua.match(/Safari/)) return 'Safari';
    },

    varDump: function(object) {
        var out = "";
        if(object && typeof(object) === "object"){
            for (var i in object) {
                out += i + ": " + object[i] + "\n";
            }
        } else {
            out = object;
        }
        /*if (console !== undefined) {
            console.log("varDump: " + out);
        }*/
        return out;
    },

    isEmpty: function(obj) {
        if (obj === undefined) {
            return false;
        }
        if (typeof(obj) === "object") {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        } else {
            return obj.length === 0;
        }
    },

    //отложенный запуск по условию
    checkExec: function(funcCheck, funcExec, timeout, funcTimeout) {
        if (timeout === undefined) {
            timeout = 10000; //таймаут по умолчанию
        }
        //задаём таймаут
        var timeoutVar = kolos.DateTool.setTimeout(timeout);
        //запускаем таймер
        var timerInterval = setInterval(function() {
            //если проверка прошла успешно
            if (funcCheck()) {
                clearInterval(timerInterval);
                funcExec();
            }
            //если вышел таймаут
            if (kolos.DateTool.checkTimeout(timeoutVar)) {
                clearInterval(timerInterval);
                if (funcTimeout !== undefined) {
                    funcTimeout();
                }
            }
        }, 200);
    },

    toCenter: function(tagId) {
        var elementJQ = $(tagId);
        var windowJQ = $(window);
        elementJQ.css("position","absolute");
        elementJQ.css("top", Math.max(0, ((windowJQ.height() - $(elementJQ).outerHeight()) / 3) +
            windowJQ.scrollTop()) + "px");
        elementJQ.css("left", Math.max(0, ((windowJQ.width() - $(elementJQ).outerWidth()) / 2) +
            windowJQ.scrollLeft()) + "px");
    },

    toCenterTop: function(tagId, percent) {
        if (percent === undefined) {
            percent = 30;
        }
        var elementJQ = $(tagId);
        var windowJQ = $(window);
        elementJQ.css("position","absolute");
        elementJQ.css("top", Math.max(0, ((windowJQ.height() - $(elementJQ).outerHeight()) / (100 / percent)) +
            windowJQ.scrollTop()) + "px");
        elementJQ.css("left", Math.max(0, ((windowJQ.width() - $(elementJQ).outerWidth()) / 2) +
            windowJQ.scrollLeft()) + "px");
    },

    toCenterTopMargin: function(tagId, percent) {
        if (percent === undefined) {
            percent = 30;
        }
        var elementJQ = $(tagId);
        var windowJQ = $(window);
        elementJQ.css(
            "margin-top",
            Math.max(0, ((windowJQ.height() - $(elementJQ).outerHeight()) / (100 / percent)) + windowJQ.scrollTop()) + "px"
        );
    },

    firstUp: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    firstLow: function(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    },

    redirect: function (url) {
        document.location.href = url;
    },

    /**
     *
     * @param url
     * @returns {kolos.Request}
     */
    request: function (url) {
        return new kolos.Request(url);
    },

    /**
     * Используется для глобальной локализации
     * @param text
     * @returns string
     */
    text: function (text) {
        return text;
    },

    error: function (msg) {
        console.error('Error: ' + msg);
        if (this.isObject(msg)) {
            console.error(msg);
        }
        if (kolos.app.hint !== undefined) {
            kolos.app.hint.error(msg);
        }
    },

    debug: function (msg) {
        if (this.__debug) {
            console.log(msg);
        }
    },

    isObject: function (value) {
        return value && (typeof value === 'object');
    },

    random: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },

    merge: function (obj1, obj2) {
        let result = {};
        for (let key in obj1) {
            result[key] = obj1[key];
        }
        for (let key in obj2) {
            result[key] = obj2[key];
        }
        return result;
    }

};