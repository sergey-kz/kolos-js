/*
ЭКСПЕРЕМЕНТАЛЬНАЯ ЛИБА!!! НУЖНО ПЕРЕДЕЛАТЬ В НОРМАЛЬНЫЙ ВИД!!!
 */


if (kolos === undefined) var kolos = {};

//заглушка, чтобы не сломалось в других браузерах
if (console === undefined) {
    var console = {
        log: function(text) {}
    }
}

/**
 * Загрузчик скриптов
 */
kolos.Loader = {
    __version: '0.0.1', //версия скриптов
    __scripts: {}, //список скриптов
    __items: {}, //активные загрузчики
    __index: 0, //индекс загрузчиков
    //путь для получения объединённого скрипта в один
    __endPoint: undefined,
    //пути по умолчанию
    __paths: {
        s: '/',
        l: '/js/lib',
        c: '/js/controllers',
        core: '/js/root/core',
        t: '/',
        m: '/modules',
        css: '/',
    },
    //расширения для некоторых типов скриптов
    __extensions: {
        t: '.tpl',
        css: '.css',
    },
    //кастомные обработчики загрузки
    __handlersLoaded: {
        c: function(){
            //передаём название модуля в инициализацию (там настроится путь и название контроллера)
            kolos.controllers[name].init(name);
        },
        m: function(name) {
            //передаём название модуля в инициализацию (там настроится путь и название модуля)
            // kolos.modules[name].init(name);
            try {
                kolos.modules[name].init(name);
            } catch (e) {
                console.log('ERROR: ' + e);
                console.log(name);
                console.log(kolos.modules[name]);
                if (kolos.Kolos !== undefined) {
                    kolos.Utils.error('Ошибка ининциализации модуля: ' + name + ', error: ' + e, true);
                }
            }
        }
    },

    __firstLoaded: false, //флаг означающий, что первый лоадер загружен
    __delayedStart: [], //спислок лоадеров для отложенного запуска

    mergeEndPoint(path) {
        this.__endPoint = path;
        return this;
    },

    version: function(version) {
        this.__version = version;
        return this;
    },

    /**
     * Загрузка скрипта
     * @param name название или путь до скрипта исключая расширение (по умолчанию путь начинается /)
     * @returns kolos.Loader
     */
    script: function(name) {
        this.__add('s', name);
        return this;
    },

    /**
     * Загрузка библиотеки
     * @param name название или путь до библиотеки исключая расширение (по умолчанию путь начинается /js/lib)
     * @returns kolos.Loader
     */
    lib: function(name) {
        this.__add('l', name);
        return this;
    },

    /**
     * Загрузка контроллера
     * @param name название или путь до контроллера исключая расширение (по умолчанию путь начинается /js/controllers)
     * @returns kolos.Loader
     */
    controller: function(name) {
        this.__add('c', name);
        return this;
    },

    /**
     * Загрузка скриптов ядра
     * @param name название или путь до скрипта исключая расширение (по умолчанию путь начинается /js/root/core)
     * @returns kolos.Loader
     */
    core: function(name) {
        this.__add('core', name);
        return this;
    },


    /**
     * Загрузка модуля, специфично для root-engine php
     * @param name название модуля
     * @returns kolos.Loader
     */
    module: function(name) {
        this.__add('m', name);
        return this;
    },

    /**
     * Загрузка css
     * @param name название или путь до стиля исключая расширение (по умолчанию путь начинаетс с корня /)
     * @returns kolos.Loader
     */
    css: function(name) {
        this.__add('css', name);
        return this;
    },

    /**
     * Загрузка шаблона
     * @param name название или путь до шаблона исключая расширение (tpl)
     * @returns kolos.Loader
     */
    template: function(name) {
        this.__add('t', name);
        return this;
    },

    /**
     * Запуск загрузки скриптов и обратный вызов при загрузке всех скриптов
     * @param callback функация обратного вызова
     */
    ready: function(callback) {
        //получаем текущий лоадер
        var loaderItem = this.__getItemCurrent();
        //увеличиваем индекс, чтобы создался новый загрузчик
        this.__index++;
        //добавляем callback в текущий загрузчик
        loaderItem.callbacks.push(callback);
        //задаём путь для получения объединённого скрипта в один
        loaderItem.endPoint = this.__endPoint;

        //если первый загрузчик уже загрузился, то сразу выполняем следующие (хороши бы переделать на очередь)
        if (this.__firstLoaded || loaderItem.index == 0) {
            //запускаем загрузчик
            loaderItem.start();
            //сразу проверяем на загрузку всех скриптов (на случай, если все скрипты загружены ранее)
            this.__loaded(loaderItem.index);
        } else {
            var Self = this;
            this.__delayedStart.push(function() {
                //запускаем загрузчик
                loaderItem.start();
                //сразу проверяем на загрузку всех скриптов (на случай, если все скрипты загружены ранее)
                Self.__loaded(loaderItem.index);
            });
        }


    },

    /**
     * Вернуть текущий загрузчик
     * @returns kolos.LoaderItem
     * @private
     */
    __getItemCurrent: function() {
        //если нет актвного загрузчика, то создаём его
        if (this.__items[this.__index] === undefined) {
            this.__items[this.__index] = new kolos.LoaderItem(this.__index);
        }
        //возвращаем текущий загрузчик
        return this.__items[this.__index];
    },

    /**
     * Добавить элемент на загрузку
     * @param type тип элемента (скрипт, контроллер, шаблон, стиль и т.д.)
     * @param name название, или путь до скрипта (расширение исключается)
     * @private
     */
    __add: function(type, name) {

        //console.log('ADD: ' + type + '|' + name);

        if (name[0] === '/') name = name.substr(1);

        //получаем текущий лоадер
        var loaderItem = this.__getItemCurrent();

        //формируем ключ на загрузку
        var key = type + '|' + name;

        // если не загружен, то добавляем его на загрузку
        if(!this.__scripts[key]) {
            //создаём объект загрузки
            this.__scripts[key] = {
                'type': type,
                'name': name,
                'add': false,    //добавлен на загрузку
                'loaded': false  //загружен
            };
        }

        //присваиваем информация о скрипте в загрузчик
        loaderItem.scripts[key] = this.__scripts[key];
    },

    __loaded: function(index, type, name) {

        //console.log('LOADED: [' + index +  '] ' + type + '|' + name);

        if (type !== '' && name !== '') {
            //если это одиночная загрузка скрипта, то просто обрабатываем азгрузку одного скрипта
            this.__loadedScript(index, type, name)
        } else {
            //если тип и скрипт не указаны, то обрабатываем групповую загрузку всех скриптов загрузчика
            var loaderItem = this.__items[index];

            // заглушка от неизвестной ошибки
            if (loaderItem === undefined) {
                return;
            }

            for (var key in loaderItem.scripts) {
                var scriptInfo = loaderItem.scripts[key];
                this.__loadedScript(index, scriptInfo.type, scriptInfo.name)
            }
        }
    },

    __loadedScript: function(index, type, name) {
        //формируем ключ
        var keyScript = type + '|' + name;

        //console.log('LOADED_SCRIPT: [' + index +  '] ' + type + '|' + name);

        //отмечаем что сприпт загружен
        if (this.__scripts[keyScript] !== undefined) {
            this.__scripts[keyScript].loaded = true;
        }

        //если есть кастомный обработчик загрузки для данного типа, выполянем его
        if (this.__handlersLoaded[type] !== undefined) {
            this.__handlersLoaded[type](name);
        }

        //всем активным загрузчикм вызываем метот проверки скриптов на загруженность
        for (var indexLoader in this.__items) {
            //текущий обработчик не обрабатываем
            if (indexLoader !== this.__index) {
                //вызываем проверку загрузчика на загрузку всех его скриптов
                var loadedAll = this.__items[indexLoader].__checkLoaded();
                //если все его скрипты загружены, то удаляем его из обработки
                if (loadedAll) delete this.__items[indexLoader];

                //обрабатываем первый загрузичк
                if (indexLoader == 0) {
                    //если первый загрузчик загрузился полностью, что выполняем все отложенные загрузчики
                    if (loadedAll) {
                        //выставляем флаг, что первый загрузчик загрузился
                        this.__firstLoaded = true;
                        //выполняем все отложенные загрузчики
                        for (var i in this.__delayedStart) {
                            this.__delayedStart[i]();
                        }
                    } else {
                        //иначе первый загрузчик ещё не загрузился, прерываем цикл
                        break;
                    }
                }
            }
        }
    }

};


kolos.LoaderItem = function(index) {
    this.index = index;
    this.scripts = {}; //скрипты на загрузку
    this.callbacks = []; //обратные вызовы на загрузку скриптов
    this.endPoint = undefined; //путь до скрипта для объединения всех скриптов в один

    this.start = function () {

        var pathArr = [];
        for (var key in this.scripts) {
            var scriptInfo = this.scripts[key];
            //если скрипт ещё не добавлен на загрузку
            if (!scriptInfo.add) {
                //отмечаем, что скрипт добавлен на страницу
                scriptInfo.add = true;

                pathArr.push(scriptInfo.type + '|' + scriptInfo.name);
            }
        }

        var path = kolos.Loader.__endPoint + pathArr.join(';') + '&v=' + kolos.Loader.__version;

        //строим элемент скрипта на странице
        this.__buildScriptElement(path, '', '');


    };

    /**
     * Запуск загрузчика
     */
    this.start__old = function() {
        for (var key in this.scripts) {
            var scriptInfo = this.scripts[key];
            //если скрипт ещё не добавлен на загрузку
            if (!scriptInfo.add) {
                //отмечаем, что скрипт добавлен на страницу
                scriptInfo.add = true;
                //получаем путь для данного типа скрипта
                var path = kolos.Loader.__paths[scriptInfo.type];
                //если нет пути, то делаем корень
                if (path === undefined) path = '/';
                //в конце пути добавляем слэш
                if (path[path.length-1] !== '/') {
                    path += '/';
                }
                //формируем расширение в зависимости от типа (по умолчанию js)
                var extension = '.js';
                if (kolos.Loader.__extensions[scriptInfo.type] !== undefined) {
                    extension = kolos.Loader.__extensions[scriptInfo.type];
                }
                //для css другой способ загрузки
                if (scriptInfo.type === 'css') {
                    this.__buildCssElement(path + scriptInfo.name + extension + '?v=' + kolos.Loader.__version, scriptInfo.type, scriptInfo.name);
                } else if (scriptInfo.type === 'c') {
                    var nameCtrlScr = scriptInfo.name;
                    nameCtrlScr = nameCtrlScr.charAt(0).toUpperCase() + nameCtrlScr.slice(1) + 'Controller';
                    this.__buildScriptElement(path + nameCtrlScr + extension + '?v=' + kolos.Loader.__version, scriptInfo.type, scriptInfo.name);
                } else if (scriptInfo.type === 'm') {
                    var nameModuleScr = scriptInfo.name;
                    nameModuleScr = nameModuleScr + '/js/' + nameModuleScr.charAt(0).toUpperCase() + nameModuleScr.slice(1) + 'Module';
                    this.__buildScriptElement(path + nameModuleScr + extension + '?v=' + kolos.Loader.__version, scriptInfo.type, scriptInfo.name);
                } else {
                    //строим элемент скрипта на странице
                    this.__buildScriptElement(path + scriptInfo.name + extension + '?v=' + kolos.Loader.__version, scriptInfo.type, scriptInfo.name);
                }
            }
        }
    };

    this.__buildScriptElement = function(src, type, name) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', src);
        //js.setAttribute('defer', 'defer'); /// не выполнять пока вся страница не загрузится
        script.setAttribute('onload', 'kolos.Loader.__loaded(' + this.index + ',\'' + type + '\',\'' + name + '\');');
        document.getElementsByTagName('HEAD')[0].appendChild(script);
    };

    this.__buildCssElement = function(src, type, name) {
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = src;
        link.media = 'all';
        //link.setAttribute('onload', 'kolos.Loader.__loaded(' + this.index + ',\'' + type + '\',\'' + name + '\');');
        document.getElementsByTagName('HEAD')[0].appendChild(link);
    };

    /**
     * Проверка скриптов на загрузку
     * @returns {boolean}
     * @private
     */
    this.__checkLoaded = function() {
        var Self = this;
        var loadedAll = true;
        for (var key in this.scripts) {
            if (!this.scripts[key].loaded) {
                loadedAll = false;
                break;
            }
        }
        //если все скрипты загружены, вызываем колбэки
        if (loadedAll) {
            $(document).ready(function() {
                for (var i in Self.callbacks) {
                    Self.callbacks[i]();
                }
            });
        }
        return loadedAll;
    };

};