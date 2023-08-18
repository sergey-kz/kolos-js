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
    component: function(componentClass, params, parentComp, callback) {
        let item = new kolos.Modal.Item();
        item.component(componentClass, params, parentComp, callback);
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
    this.__onCloseBack = undefined;
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

    /**
     * @param callback
     * @return {kolos.Modal.Item}
     */
    this.onClickBack = function (callback) {
        this.__onClickBack = callback;
        return this;
    }

    /**
     * @param callback
     * @return {kolos.Modal.Item}
     */
    this.onClose = function (callback) {
        this.__onCloseBack = callback;
        return this;
    }

    this.setContent = function (content) {
        this.__content = content;
        $(this.__elementContent).html(this.__content);
    }

    /**
     * @param content
     * @return {kolos.Modal.Item}
     */
    this.content = function (content) {
        this.__content = content;
        return this;
    }

    /**
     * @return {kolos.Modal.Item}
     */
    this.element = function(element) {
        this.__elementCapture = element;
        this.__elementCaptureTmp = $('<span id="k-modalElCaptTmp' + this.globalId + '"></span>')[0];

        // заменяем временным элементом, чтобы можно было вернуть обратно
        $(this.__elementCapture).replaceWith(this.__elementCaptureTmp);

        this.setContent(this.__elementCapture);
    }

    this.__buildParamStr = function (params) {
        let arr = [];
        for (let key in params) {
            arr.push(key + ': ' + params[key] + ';');
        }
        return arr.join(' ');
    }

    /**
     * @return {kolos.Modal.Item}
     */
    this.component = function(componentClass, params, parent, callback) {
        this.componentByDesc('<div component="' + componentClass + '" param="' + this.__buildParamStr(params) + '"></div>', parent, callback);
        return this;
    }

    /**
     * @return {kolos.Modal.Item}
     */
    this.componentByDesc = function(componentDesc, parent, callback) {

        let memory = $(componentDesc);

        Self.setContent('<div class="icon-load"></div>');

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

        try {
            // если был компонент, нужно грохнуть компонент
            if (this.__component !== undefined) {
                kolos.app.componentManager.destroyComponent(this.__component);
            }
        } catch (e) {
            kolos.Utils.error(e);
        }

        try {
            // если был dom элемент, то нужно вернуть его обратно
            if (this.__elementCapture !== undefined) {
                $(this.__elementCaptureTmp).replaceWith(this.__elementCapture);
            }
        } catch (e) {
            kolos.Utils.error(e);
        }

        kolos.Global.remove(this.globalId);
        $(this.__element).remove();

        if (this.__onCloseBack !== undefined) {
            this.__onCloseBack();
        }
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
