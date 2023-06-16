kolos.Table = function (containerTagId, data, fields) {
    var Self = this;
    this.containerTagId = containerTagId;
    this.globalIndex = kolos.Global.add(this);
    this._data = data;
    this._fields = undefined;
    this._actions = [];

    /**
     * Выздвать действие к строке
     * @param indexAction
     * @param indexRow
     * @param element
     * @private
     */
    this._callAction = function(indexAction, indexRow, element) {
        if (
            this._actions[indexAction] !== undefined
            && this._data[indexRow] !== undefined
        ) {
            this._actions[indexAction]['callback'](indexRow, this._data[indexRow], element);
        }
    };
    /**
     * Добавить действие
     * @param caption   подпись
     * @param callback  (indexRow, rowData, element) => {}
     * @returns {kolos.Table}
     */
    this.action = function (caption, callback) {
        this._actions.push({
            'caption' : caption,
            'callback': callback
        });
        return this;
    };

    /**
     * Задать поля
     * @param fields
     * @returns {kolos.Table}
     */
    this.fields = function (fields) {
        if (fields.constructor === Array) {
            this._fields = {};
            for (var i in fields) {
                var field = fields[i];
                this._fields[field] = field;
            }
        } else {
            this._fields = fields;
        }
        return this;
    };

    // сразу проверяем, если переданы поля, то назначаем их
    if (fields !== undefined) {
        this.fields(fields);
    }

    this._drawFields = function (index, field, value, rowData) {
        if (this._fieldDrawHandlers[field] !== undefined) {
            return this._fieldDrawHandlers[field](index, value, rowData);
        } else {
            return value;
        }
    };

    this._fieldDrawHandlers = {};

    /**
     * Добавить обработчик отрисовки поля, в параметр handlerCallback передаются переменные index, value
     * @param fieldName
     * @param handlerCallback функция с параметрами function(index, value) { return ... }
     * @returns {kolos.Table}
     */
    this.drawField = function (fieldName, handlerCallback) {
        this._fieldDrawHandlers[fieldName] = handlerCallback;
        return this;
    };

    this.templateContainer = function(content) {
        var fieldsStr = '';

        if (this._fields !== undefined) {
            // отрисовываем заголовки полей
            for (var field in this._fields) {
                fieldsStr += '<th>' + this._fields[field] + '</th>' + "\n";
            }
            // отрисовываем заголовки действий
            for (var i in this._actions) {
                fieldsStr += '<th></th>' + "\n";
            }
        }
        return `<table class="table" border="0" cellpadding="0" cellspacing="0">
            <thead><tr>`
            + fieldsStr
            +`</tr></thead>
            <tbody>` + content + `</tbody>`;
    };

    this.templateRow = function(index, rowData) {

        // если поля пустые, то заполнляем их из данных
        if (this._fields === undefined) {
            this._fields = {};
            for (var field in rowData) {
                this._fields[field] = field;
            }
        }

        var str = '<tr>';

        // отрисовываем поля
        for (var field in this._fields) {
            str += '<td>' + this._drawFields(index, field, rowData[field], rowData) + '</td>';
        }

        // отрисовываем действия
        for (var indexAction in this._actions) {
            str += '<td><a href="javascript: void(0)" onclick="kolos.Global.get(' + this.globalIndex + ')._callAction(' + indexAction + ', ' + index + ', this);">' + this._actions[indexAction]['caption'] + '</a></td>';
        }

        str += '</tr>';

        return str;
    };

    this.render = function() {
        var content = '';

        //отрисовываем строки
        for (var index in this._data) {
            content += this.templateRow(index, this._data[index]);
        }
        //отрисовываем контейнер с уже отрисованными строками, и вставляем в контейнер
        $(this.containerTagId).html(this.templateContainer(content));
    };

    this.update = function(data) {
        if (data !== undefined) {
            this._data = data;
        }
        this.render();
    };

};