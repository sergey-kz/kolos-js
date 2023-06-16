kolos.component.Hint = function () {
    let Self = this;
    // стандартные поля -->>
    this.context = undefined;
    this.element = {
        caption: undefined,
        form: undefined,
        divBtnSend: undefined
    };
    //--||

    /** @type {kolos.Hints} */
    this._hint = undefined;


    this.message = function (text) {
        this._hint.info(text);
    };

    this.info = function (text) {
        this._hint.info(text);
    };

    this.success = function (text) {

        this._hint.success(text);
    };

    this.warning = function (text) {
        this._hint.warning(text, 0);
    };

    this.error = function (text) {

        this._hint.error(text, 0);
    };

    this.clear = function () {
        this._hint.clear();
    };


    this.onReady = function () {

        // создаём хинты
        Self._hint = new kolos.Hints('#' + Self.context.tagId, 3000);

        //console.log(this._hint);

        //this.info('Hints reade!');
    };

    this.template = function () {
        return `
            <div></div>
        `;
    };
};

