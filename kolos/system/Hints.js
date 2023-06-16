/**
 * Всплывающие сообщения
 * @param tagId
 * @param timeout
 * @constructor
 */
kolos.Hints = function (tagId, timeout) {
    var Self = this;
    this.tagId = tagId;
    this.element = undefined;
    this.timeout = timeout;
    //--
    this._isInit = false;
    this._container = undefined;
    this._hints = {};

    this.message = function(text, timeout) {
        this.info(text, timeout);
    };

    this.info = function(text, timeout) {
        this._addHint(text, 'info', timeout);
    };

    this.success = function(text, timeout) {
        this._addHint(text, 'success', timeout);
    };

    this.warning = function(text) {
        this._addHint(text, 'warning', 0);
    };

    this.error = function(text) {

        this._addHint(text, 'error', 0);
    };

    this.clear = function() {
        for (var i in this._hints) {
            this._hints[i].remove();
        }
    };

    //--


    this._addHint = function(text, style, timeout) {

        // создаём всплывашку
        var hintItem = new kolos.HintItem(
            this,
            text,
            style,
            timeout !== undefined ? timeout : this.timeout
        );

        // добавляем в общий список
        this._hints[hintItem.tagId] = hintItem;
    };


    this._construct = function() {
        if (this.tagId !== undefined) {
            this._container = $(this.tagId);
        } else {
            this.tagId = '#hints-container';
            // если контейнер ещё не созда, создаём его
            if (!$(this.tagId).length) {
                $('head').append('<style>' +
                    '.hints-container { position: fixed; top: 15px; right: 15px; width: 270px; z-index: 999999; } ' +
                    '.hint-close { content: ""; position: relative; float: right; top: 11px; right: 11px; width: 15px; height: 15px; background: transparent url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%23000\'%3e%3cpath d=\'M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z\'/%3e%3c/svg%3e") center/0.875em auto no-repeat; border: 0; opacity: 0.5; cursor: pointer; transition: opacity 0.1s ease-in-out; } ' +
                    '</style>');
                this.element = $('<div id="' + this.tagId.slice(1) + '" class="hints-container" style=""></div>');
                $('body').prepend(this.element);
            }
            // берём ссылку на контейнер
            this._container = $(this.tagId);
        }
    };
    this._construct();
};

kolos.HintItem = function(parent, text, style, timeout) {
    var Self = this;
    this.parent = parent;
    this.text = text;
    this.style = style;
    this.timeout = timeout;
    this.globalIndex = kolos.Global.add(this);
    this.tagId = '#' + kolos.Global.getTagId(this.globalIndex);

    this.remove = function(force) {
        // удаляем из общего списка в родителе
        delete this.parent._hints[this.tagId];
        // удаляем из глобального пула
        kolos.Global.remove(this.globalIndex);
        // принудительное удаление без анимации
        if (force !== undefined) {
            $(this.tagId).remove();
        } else {
            // анимация исчезновения и удаление dom элемента
            $(this.tagId)
                .animate({
                    opacity: 0
                }, 200, function() {})
                .animate({
                    height: 0
                }, 200, function() {
                    // удаляем после сворачивания
                    $(this).remove();
                });
        }
    };

    //--

    this._onclick = function() {
        if (!window.getSelection().toString()){
            this.remove();
            return true;
        } else {
            return false;
        }
    };

    // шаблон
    this._template = function(id, text, style, globalIndex, btnClose) {
        return '<div id="' + id + '" class="mb-norm shadow-norm ofh" onclick="return kolos.Global.get(' + globalIndex + ')._onclick();" style="">' +
                    (btnClose ? '<div class="hint-close"></div>' : '') +
                    '<div class="hint ' + style + '">' + text + '</div> ' +
                '</div>';
    };

    this._construct = function() {
        // добавляем элемент в контейнер
        $(this.parent.tagId).append(this._template(
            this.tagId.slice(1),
            this.text,
            this.style,
            this.globalIndex,
            (this.timeout === undefined || this.timeout === 0)
        ));

        // если задан таймаут, что навешиваем таймер удаления
        if (this.timeout !== undefined && this.timeout !== 0) {
            setTimeout(() => {
                Self.remove();
            }, this.timeout);
        }
    };
    this._construct();

};

