kolos.Logger = {
    limit: 100,//максимальное кол-во строк
    TYPE_INFO: 1,
    TYPE_WARNING: 2,
    TYPE_ERROR: 3,
    __log: [],
    __handlerDraw: undefined,
    __viewFilter: new kolos.Set([1,2,3]), //фильтр по отображаемым типам

    info: function(text, group) {
        this.__addMessage(this.TYPE_INFO, group, text);
    },
    warning: function(text, group) {
        this.__addMessage(this.TYPE_WARNING, group, text);
    },
    error: function(text, group) {
        this.__addMessage(this.TYPE_ERROR, group, text);
    },

    __addMessage: function(type, group, text) {
        this.__log.push(new kolos.LoggerItem(
            kolos.DateTool.now(),
            type,
            group !== undefined ? group : '',
            text
        ));
        //если привысилии лимит, то удаляем первый элемент
        if (this.__log.length > this.limit * 3) {
            this.__log.shift();
        }
        //отрисовываем лог
        this.__render();
    },

    handlerDraw: function(callback) {
        this.__handlerDraw = callback;
    },

    /** Переключить фильтр */
    toggleFilter: function(type) {
        if (this.__viewFilter.contains(type)) {
            this.__viewFilter.remove(type);
        } else {
            this.__viewFilter.add(type);
        }
        this.__render();
    },

    __render() {
        if (this.__handlerDraw !== undefined) {
            var result = '';
            result += '<style> .root-logger-container td {font-size: 11px;} </style>';
            result += `<div>
                        <a class="` + (this.__viewFilter.contains(this.TYPE_INFO) ? 'bold' : '') + `" href="javascript: kolos.Logger.toggleFilter(` + this.TYPE_INFO + `)">[info]</a>
                        <a class="` + (this.__viewFilter.contains(this.TYPE_WARNING) ? 'bold' : '') + `" href="javascript: kolos.Logger.toggleFilter(` + this.TYPE_WARNING + `)">[warning]</a>
                        <a class="` + (this.__viewFilter.contains(this.TYPE_ERROR) ? 'bold' : '') + `" href="javascript: kolos.Logger.toggleFilter(` + this.TYPE_ERROR + `)">[error]</a>
                        </div>`;
            result += '<pre><table class="root-logger-container" cellpadding="2" cellspacing="0" border="0">';
            //копируем массива
            var arr = this.__log.slice();
            //var start = arr.length - this.limit;
            //if (start < 0) start = 0;
            var count=0;
            //выводим не больше лимита
            for (var i = arr.length-1; i >= 0; i--) {

                /** @var kolos.LoggerItem loggerItem */
                var loggerItem = arr[i];

                //отображаем только выбранные типы
                if (this.__viewFilter.contains(loggerItem.type)) {
                    count++;
                    if (count > this.limit) {
                        break;
                    }

                    var group = '';
                    if (loggerItem.group != '') {
                        group = ' [' + loggerItem.group + '] '
                    }

                    var typeStr = '';
                    var bgColor = 'bgColor';
                    switch (loggerItem.type) {
                        case this.TYPE_INFO:
                            typeStr = 'INFO';
                            break;
                        case this.TYPE_WARNING:
                            typeStr = 'WARNING';
                            bgColor = '#fffab2';
                            break;
                        case this.TYPE_ERROR:
                            typeStr = '<b>ERROR</b>';
                            bgColor = '#ffcece';
                            break;
                    }
                    result += '<tr style="background: ' + bgColor + ';">';
                    result += '<td>' + kolos.DateTool.toSqlFormat(loggerItem.datetime) + '</td>';
                    result += '<td>' + group + '</td>';
                    result += '<td>' + typeStr + '</td>';
                    result += '<td>' + loggerItem.text + '</td>';
                    result += '</tr>';
                }
            }
            result += '</table></pre>';

            this.__handlerDraw(result);
        }
    },
};

kolos.LoggerItem = function(datetime, type, group, text) {
    var Self = this;
    this.datetime = datetime;
    this.type = type;
    this.group = group;
    this.text = text;
};