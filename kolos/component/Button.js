kolos.component.Button = function () {
    // стандартные поля -->>
    this.context = undefined;
    this.element = {};
    this.param = {};
    //--||


    this.onReady = function () {
        //
    };

    this.template = function () {
        return `
            <a class="button [[type]] [[color]]" href="javascript: void(0);">[[content]]</a>
        `;
    };
};

