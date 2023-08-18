kolos.example.Main = function() {
    // стандартные поля -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
        content: undefined,
    };
    this.component = {
        /** @type {kolos.component.MenuLeft} */
        menuLeft: undefined,
    }
    this.param = {};
    this.attr = {};
    //--

    this.onPage = function() {
        let page = kolos.Utils.val(this.param, 'page');

        if (page === undefined) {
            $(this.element.content).html(' ');
            return;
        }

        let className = kolos.Utils.firstUp(page);

        kolos.app.componentManager.initComponentTo(
            '<div component="kolos.example.' + className + '"></div>',
            Self.element.content,
            Self,
            () => {
                //
            }
        );
    }

    this.builder = function() {
        kolos.app.initComponent(
            'kolos.example.Builder',
            this.element.content,
            (cmp) => {
                //
            }
        );
    }

    this.css = function() {
        kolos.app.initComponent(
            'kolos.example.Css',
            this.element.content,
            (cmp) => {
                //
            }
        );
    }

    this.components = function() {
        kolos.app.initComponent(
            'kolos.example.Components',
            this.element.content,
            (cmp) => {
                //
            }
        );
    }


    this.onReady = function() {
        // this.component.menuLeft.create()
        //     .caption('Главная')
        //     .url('#/example/main');
        // this.component.menuLeft.create()
        //     .caption('Конструктор интерфейса')
        //     .url('#/example/main/builder');
        // this.component.menuLeft.create()
        //     .caption('Компоненты')
        //     .url('#/example/main/components');
        // this.component.menuLeft.create()
        //     .caption('CSS')
        //     .url('#/example/main/css');
        // this.component.menuLeft.update();
    }

    this.onDestroy = function() {
        //
    }

}

