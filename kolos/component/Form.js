kolos.component.Form = function () {
    // стандартные поля -->>
    this.context = undefined;
    this.element = {
        header: undefined,
        content: undefined
    };
    this.component = {
    };
    this.param = {
        title: 'title'
    };
    this.attr = {};
    //--||


    this.onReady = function () {
        if (this.attr['title'] !== undefined) {
            $(this.element.header).html(this.attr['title']);
        }
    };

    this.template = function () {
        return `
            <div class="form">
                <div id="header" class="form-header">
                    [[title]]
                    <!-- <a class="link fr c-white-i" href="javascript: kolos.Modal.close();"><i class="icon-m">close</i></a>-->
                </div>
                
                <div id="content" class="form-content" title="Заголовок">[[content]]</div>
            </div>
        `;
    };
};

