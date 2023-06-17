kolos.Modal = {
    /**
     * @return {kolos.Modal.Item}
     */
    content: function(content) {
        let item = new kolos.Modal.Item();
        item.content(content);
        return item;
    },

    /**
     * @return {kolos.Modal.Item}
     */
    element: function(element) {
        let item = new kolos.Modal.Item();
        item.element(element);
        return item;
    },

    /**
     * @return {kolos.Modal.Item}
     */
    component: function(componentClass, parentComp, callback) {
        let item = new kolos.Modal.Item();
        item.component(componentClass, parentComp, callback);
        return item;
    },

    /**
     * @return {kolos.Modal.Item}
     */
    componentByDesc: function(componentDesc, parentComp, callback) {
        let item = new kolos.Modal.Item();
        item.componentByDesc(componentDesc, parentComp, callback);
        return item;
    },

    /**
     * @return {kolos.Modal}
     */
    capture: function(tagId) {
        this._content = $(tagId).html();
        return this;
    },
};



kolos.Modal.Item = function () {
    let Self = this;
    this.globalId = kolos.Global.add(this);
    this.tagId = kolos.Global.getTagId(this.globalId);
    this.__isMouseDown = false;
    this.__element = undefined;
    this.__elementContent = undefined;

    this.__content = undefined;
    this.__onClickBack = undefined;
    this.__component = undefined;
    // для захвата элемента
    this.__elementCapture = undefined;
    this.__elementCaptureTmp = undefined;

    this.__clickBack = function () {
        // если нажатие было не фоне, то ничего не делаем
        if (Self.__isMouseDown) {
            Self.__isMouseDown = false;
            // выполняем экшины
            if (Self.__onClickBack !== undefined) {
                Self.__onClickBack(Self);
            } else {
                Self.close();
            }
        }
    }

    this.__mouseDown = function () {
        Self.__isMouseDown = true;
    }

    this.onClickBack = function (callback) {
        this.__onClickBack = callback;
    }

    this.setContent = function (content) {
        this.__content = content;
        $(this.__elementContent).html(this.__content);
    }

    this.content = function (content) {
        this.__content = content;
    }

    /**
     * @return {kolos.Modal.Item}
     */
    this.element = function(element) {
        this.__elementCapture = element;
        this.__elementCaptureTmp = $('<span id="k-modalElCaptTmp' + this.globalId + '"></span>');


        $(this.__elementCapture).replaceWith(this.__elementCaptureTmp);

        this.setContent(this.__elementCapture);

    }

    /**
     * @return {kolos.Modal.Item}
     */
    this.component = function(componentClass, parent, callback) {
        this.componentByDesc('<div component="' + componentClass + '"></div>', parent, callback);
        return this;
    }

    /**
     * @return {kolos.Modal.Item}
     */
    this.componentByDesc = function(componentDesc, parent, callback) {

        let memory = $(componentDesc);

        this._content = '<div class="icon-load"></div>';

        kolos.app.componentManager.initComponent(memory, parent, (cmp) => {
            Self.__component = cmp;

            // передаём модельную форму в компонент
            cmp.context.modal = Self;

            // на случий, когда компонент инициализировался раньше отображения
            Self.setContent(cmp.context.element);

            if (callback !== undefined) {
                callback(cmp);
            }
        });

        return this;
    }

    this.close = function () {
        $(this.__element).fadeOut(50);

        // если был компонент, нужно грохнуть компонент
        if (this.__component !== undefined) {
            kolos.app.componentManager.destroyComponent(this.__component);
        }

        // если был dom элемент, то нужно вернуть его обратно
        if (this.__elementCapture !== undefined) {
            $(this.__elementCaptureTmp).replaceWith(this.__elementCapture);
        }

        kolos.Global.remove(this.globalId);
        $(this.__element).remove();
    }

    this.show = function () {
        this.__element = $(
            '<div id="' + this.tagId + '" class="modal-back" onclick="kolos.Global.get(' + this.globalId + ').__clickBack();" onmousedown="kolos.Global.get(' + this.globalId + ').__mouseDown();">' +
            '<div id="' + this.tagId + '-content" class="modal-content" onclick="event.stopPropagation();" onmousedown="event.stopPropagation();">' +
            this.__content +
            '</div>' +
            '</div>'
        )[0];
        this.__elementContent = $(this.__element).children()[0];
        $(document.body).prepend(this.__element);


        //вставляем контент
        $(this.__elementContent).html(this.__content);
        //выравниваем по центу
        kolos.Utils.toCenterTopMargin(this.__elementContent);
        //отображаем
        $(this.__element).fadeIn(50);
        //выравниваем по центу
        kolos.Utils.toCenterTopMargin(this.__elementContent);

        $(this.__elementContent).find('input').each(function(index){
            var inputJq = $(this);
            //для первого элемента задаём фокус
            if (index === 0) {
                inputJq.focus();
            }
            inputJq.keydown(function(eventObject) {
                // нажата клавиша Esc
                if ( eventObject.which === 27 ) {
                    Self.close();
                }
            });
        });
        return this;
    }
}
