kolos.component.ComponentTemplate = function() {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
        link: undefined,
    };
    this.component = {
        /** @type {kolos.component.Hint} */
        hint: undefined,
    }
    this.param = {};
    this.attr = {};
    //--


    this.exampleMethod = function() {
        alert('123');
    }

    this.onReady = function() {
        //
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `
            <div>
                <div component="kolos.component.Hint"></div>
                <div id="link">
                    <a href="javascript: kolos.component.ComponentTemplate.exampleMethod();">Test exampleMethod</a>
                </div>
                <div>[[content]]</div>
            </div>
        `;
    }
}

