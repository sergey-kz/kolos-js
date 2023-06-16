kolos.Modal = {
    _content: 'modal',
    _isInit: false,
    _onClickBackCallback: function() {
        this.close();
    },
    _callOnClickBack: function() {
        if (this._onClickBackCallback !== undefined) {
            this._onClickBackCallback();
        }
    },
    _init: function() {
        var css = '<style>    ' +
            '    #modalBack {\n' +
            '        display: none;\n' +
            '        position: fixed;\n' +
            '        left: 0;\n' +
            '        top: 0;\n' +
            '        width: 100%;\n' +
            '        height: 100%;\n' +
            '        overflow: auto;\n' +
            '        /*background-color: rgba(0,0,0,0.6);*/\n' +
            '        /*background-color: rgba(0, 4, 51, 0.85);*/\n' +
            '        background-color: rgba(6, 32, 52, 0.85);\n' + //rgb(6 32 52 / 80%);
            '        z-index: 1000;\n' +
            '        /*cursor: pointer;*/\n' +
            '    }\n' +
            '    #modalBack #modalContent {\n' +
            '        display: inline-block;\n' +
            '        overflow: hidden;\n' +
            '        /*background-color: #fefefe;*/\n' +
            '        /*border: 1px solid #888;*/\n' +
            '        z-index: 99999;\n' +
            '        cursor: auto;\n' +
            '        min-width: 20px;\n' +
            '        min-height: 20px;\n' +
            '    }' +
            '</style>';
        //document.getElementsByTagName('HEAD')[0].appendChild(css);
        $(document.head).append(css);

        var html = '<div id="modalBack" class="" onclick="kolos.Modal._callOnClickBack()"><div id="modalContent" onclick="event.stopPropagation();"></div></div>';
        $(document.body).prepend(html);
    },

    content: function(content) {
        this._content = content;
        return this;
    },

    capture: function(tagId) {
        this._content = $(tagId).html();
        return this;
    },

    close: function () {
        $('#modalBack').fadeOut(50);
        this._content = '';
        return this;
    },
    onClickBack: function(callback) {
        this._onClickBackCallback = callback;
        return this;
    },
    show: function() {
        var Self = this;
        if (!this._isInit) {
            this._isInit = true;
            this._init();
        }
        //вставляем контент
        $('#modalContent').html(this._content);
        //выравниваем по центу
        kolos.Utils.toCenterTop('#modalContent');
        //отображаем
        $('#modalBack').fadeIn(50);
        //выравниваем по центу
        kolos.Utils.toCenterTop('#modalContent');

        // $('#modalContent').each(function(){
        //     var inputs = $(this).find(':input');
        //     console.log(inputs);
        //     /*for (var i in inputs) {
        //         var inputTag = inputs[i];
        //         console.log(inputTag);
        //     }*/
        // });

        $('#modalContent input').each(function(index){
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
    }
};