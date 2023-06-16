if (kolos.example === undefined) kolos.example = {};
kolos.example.Components = function() {
    let Self = this;

    // стандартные поля -->>
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {
        // link: {},
        table: {},
    };
    this.component = {
        /** @type {kolos.component.Table} */
        table: {},
    }
    this.param = {};
    //--

    this.onReady = function() {
        // грузим файл с примерами
        Self.loadFile('ComponentExample.html', (data) => {
            $(Self.context.element).html(data);
            kolos.app.componentManager.initComponentsFromTag(Self.context.element, Self, (cmp) => {
                console.log(cmp);
            });
        });
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `<div></div>`;
    }

}

