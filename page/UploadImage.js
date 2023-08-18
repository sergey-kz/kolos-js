kolos.page.UploadImage = function() {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {};
    this.component = {
        /** @type {kolos.component.Table} */
        upload: {}
    }
    this.param = {};
    this.attr = {};
    //--

    this.onPage = function() {
        // происходит каждый раз при переходе на страницу
        // метод нужен только для страниц
    }

    this.onReady = function() {
        // инициализация компонента
    }

    this.onDestroy = function() {
        // уничтожение компонента
    }

}

