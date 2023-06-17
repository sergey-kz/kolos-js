kolos.component.Form = function () {
    // стандартные поля -->>
    let Self = this;
    this.context = undefined;
    this.element = {
        header: undefined,
        title: undefined,
        content: undefined,
        btnClose: undefined

    };
    this.component = {
    };
    this.param = {
        title: 'title'
    };
    this.attr = {
        icon: undefined,
        title: undefined,
        onclickclose: undefined
    };
    //--||

    this.__clickClose = function () {
        if (Self.attr.onclickclose !== undefined) {
            // alert(Self.attr.onclickclose);
            eval(Self.attr.onclickclose);
            // Self.attr.onclickclose();
        }
    }

    this.onReady = function () {
        let title = '';

        if (this.param.title !== undefined) {
            title = this.attr.title;
        }

        if (this.attr.title !== undefined) {
            title = this.attr.title;
        }

        if (this.attr.icon !== undefined) {
            title = '<i class="icon-m">' + this.attr.icon + '</i> ' + title;
        }

        $(this.element.title).html(title);

        if (Self.attr.onclickclose !== undefined) {
            // alert(Self.attr.onclickclose);
            // eval(Self.attr.onclickclose);
            // Self.attr.onclickclose();
            $(this.element.btnClose).attr('href', 'javascript: ' + this.attr.onclickclose);
            $(this.element.btnClose).show();
        }
    };

    this.template = function () {
        return `
            <div class="form">
                <div id="header" class="form-header">
                    <span id="title">[[title]]</span>
                     <a id="btnClose" class="link fr c-white-i" href="javascript: void(0);" style="display: none;"><i class="icon-m">close</i></a>
<!--                     <a class="link fr c-white-i" href="javascript: kolos.component.Form.__clickClose();"><i class="icon-m">close</i></a>-->
                </div>
                
                <div id="content" class="form-content" title="Заголовок">[[content]]</div>
            </div>
        `;
    };
};

