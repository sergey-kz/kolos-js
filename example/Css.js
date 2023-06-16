if (kolos.example === undefined) kolos.example = {};
kolos.example.Css = function() {
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
        Self.loadFile('CssExample.html', (data) => {
            $(Self.context.element).html(data);
        });
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `<div></div>`;
    }

}

