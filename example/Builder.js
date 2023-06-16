if (kolos.example === undefined) kolos.example = {};
kolos.example.Builder = function() {
    let Self = this;

    // стандартные поля -->>
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
        code: undefined,
        result: undefined,
    };
    this.component = {
        /** @type {kolos.component.CodeEditor} */
        htmlEditor: undefined,
        /** @type {kolos.component.CodeEditor} */
        jsEditor: undefined,
        /** @type {kolos.component.Tabs} */
        tabs: undefined,
    }
    this.param = {};
    //--



    this.onReady = function() {

        this.component.htmlEditor.setCode(`<div component="kolos.component.Form">

    <div class="m-norm">
        <div component="kolos.component.Button">asdf</div>
        <div component="kolos.component.Button">asdf</div>
    </div>

    <div class="m-norm pb-norm">
        content
    </div>

</div>`);

        this.component.jsEditor.setCode(`kolos.custom.MyComponet = function () {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
    };
    this.component = {
    };
    
    this.param = {};
    this.attr = {};
    //--
    
    this.onReady = function() {
        //
    }

    this.onDestroy = function() {
        //
    }
}
`);

        this.component.tabs.onChange(function (index) {
            Self.component.jsEditor.refresh();
            Self.component.htmlEditor.refresh();
            if (index === 2) {
                Self.build();
            }
        })

    }

    this.onDestroy = function() {
        //
    }

    this.build = function () {

        let htmlCode = this.component.htmlEditor.getCode();

        $(this.element.result).html(htmlCode);

        kolos.app.componentManager.initComponentsFromTag(this.element.result);

        this.component.tabs.changeTab(2);

    }

}

