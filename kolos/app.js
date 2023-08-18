kolos.app = {
    rootPath: '',
    /** @type {kolos.Hints} */
    hint: undefined,
    /** @type {kolos.Router} router */
    router: undefined,
    /** @type {kolos.ComponentManager} componentManager */
    componentManager: undefined,
    __currentPage: undefined,
    __currentComponent: undefined,

    __buildParamStr: function (params) {
        let arr = [];
        for (let key in params) {
            arr.push(key + ': ' + params[key] + ';');
        }
        return arr.join(' ');
    },

    /**
     * @param {kolos.Route} route
     * @returns {void|*}
     */
    __execRoute: function (route) {

        // изначально команда была только 'page', но теперь даём возможность запускать компоненты из разных директорий
        let dirComponent = route.cmd;

        // создаём элемент в который будет загружен компонент страницы
        let fullClassName = 'kolos.' + dirComponent + '.' + kolos.Utils.firstUp(route.component);

        // инициализируем компонет, если только он уже не был инициализирован
        if (
            kolos.app.__currentPage === undefined
            || kolos.app.__currentPage !== fullClassName
        ) {
            kolos.Utils.debug('Init page: ' + fullClassName);

            let elements = $(`<div component="` + fullClassName + `" param="` + this.__buildParamStr(route.params) + `"></div>`);

            $('body').html(elements);

            // поновой заталкиваем общий хинт в боди, т.к. мы его перетёрли
            $('body').prepend(kolos.app.hint.element);

            // удаляем все предыдущие компоненты
            this.componentManager.destroyAll();

            this.componentManager.initComponent(elements, undefined, function (component) {

                kolos.app.__currentPage = component.context.fullClassName;
                kolos.app.__currentComponent = component;

                if (route.method === undefined || route.method === '') {
                    route.method = 'onPage';
                }

                if (component[route.method] === undefined) {
                    kolos.Utils.error('Not found method ' + component.context.fullClassName + '.' + route.method + '()');
                    return;
                }

                component[route.method](route.args);
            });

        } else {

            let component = kolos.app.__currentComponent;

            if (component === undefined) {
                kolos.Utils.error('Not found component \'' + route.component + '\'');
                return;
            }

            // по умолчанию всегда берём метод index
            if (route.method === undefined || route.method === '') {
                route.method = 'onPage';
            }

            if (component[route.method] === undefined) {
                kolos.Utils.error('Not found method ' + component.context.fullClassName + '.' + route.method + '()');
                return;
            }

            // закидываем параметры в компонент
            component.param = route.params;

            component[route.method](route.args);
        }
    },

    initComponent: function (componentClass, tagId, callback) {
        this.componentManager.initComponentTo('<div component="' + componentClass + '"></div>', tagId, undefined, callback);
    },

    init: function (rootPath) {
        let Self = this;

        this.rootPath = rootPath;

        this.hint = new kolos.Hints(undefined, 5000);

        this.router = new kolos.Router();

        this.componentManager = new kolos.ComponentManager(this.rootPath);

        this.componentManager.initComponentsOnPage();

        // this.router.subscribe('page', function (route) {
        //     Self.__execRoute(route);
        // });

        this.router.subscribe('*', function (route) {
            Self.__execRoute(route);
        });

        // // пустой хзш редиректим на компонент kolos.page.Main
        // kolos.app.router.subscribe('', function (route) {
        //     // редиректим на main
        //     kolos.Utils.redirect('#/page/main');
        // });

        this.router.init();
    },

    addRedirect: function (command, toHash) {
        // пустой хзш редиректим на компонент kolos.page.Main
        kolos.app.router.subscribe(command, function (route) {
            // редиректим на main
            kolos.Utils.redirect(toHash);
        });
    },

    addRoute: function (route, callback) {
        this.router.subscribe(route, function (route) {
            callback(route);
        });
    }
};