kolos.Request = function(url) {
    var Self = this;
    this._url = url;
    this._buffer = {
        'data': {}
    };
    this._callback = undefined;
    this._callbackError = undefined;
    this._method = 'POST';
    this._ajax = undefined;

    /**
     *
     * @param data
     * @returns {kolos.Request}
     */
    this.data = function(data) {
        this._buffer['data'] = data;
        return this;
    };

    /**
     *
     * @param tpl
     * @returns {kolos.Request}
     */
    this.template = function(tpl) {
        if (this._buffer['tpl'] === undefined) {
            this._buffer['tpl'] = [];
        }
        this._buffer['tpl'].push(tpl);
        return this;
    };

    /**
     *
     * @param callback
     * @returns {kolos.Request}
     */
    this.error = function(callback) {
        this._callbackError = callback;
        return this;
    };

    /**
     * Задать метод POST/GET
     * @param method
     * @returns {kolos.Request}
     */
    this.method = function(method) {
        this._method = method;
        return this;
    };

    /**
     * Запуск выполнения запроса
     * @param callback
     * @returns {kolos.Request}
     */
    this.ready = function(callback) {
        this._callback = callback;

        if (kolos.Utils.__delayRequest) {
            // для отладки
            setTimeout(function(){
                Self._start();
            }, 500);

        } else {
            this._start();
        }
    };

    /**
     * Запуск выполнения запроса, в результате будет объект Response
     * @param callback
     * @returns {kolos.Request}
     */
    this.response = function(callback) {
        // данные преобразуем в response, и передаём дальше в callback
        this.ready(function (data) {
            let resp = new kolos.Response(data);
            callback(resp);
        });
    };

    /**
     * Отмена запроса
     * @returns {kolos.Request}
     */
    this.cancel = function() {
        if (this._ajax !== undefined) {
            this._ajax.abort();
        }
        return this;
    };


    this._ready = function(data) {
        if (this._callback !== undefined) {
            this._callback(data);
        }
    };
    this._start = function() {
        var url = Self._url;
        Self._ajax = $.ajax({
            type: Self._method,
            url: url,
            //dataType: options.dataType,
            async: true,
            //data: 'request=' + $.toJSON(Self._buffer),
            data: Self._buffer['data'],
            beforeSend: function(){
                //messages.loading.show('request','Загрузка данных...');
            },
            success: function(data){

                try {
                    Self._ready(data);
                } catch (e) {
                    kolos.Utils.error('Error callback request (Request._start url: ' + url + '): , error: ' + e, true);
                }


                return;

                try {
                    var dataResult = undefined;
                    try {
                        //dataResult = eval('('+data+')');
                        dataResult = JSON.parse(data);
                        /*
                        dataResult = eval('('+data+')');

                        //FIXME: Убрать! Или переделать в нормальную обработку
                        var debugDataAjax = '';
                        if (dataResult['profilers'] !== undefined) {
                            debugDataAjax += '<pre style="background: #fffddb;>' + url + "<br><br>" + dataResult['profilers'] + '</pre>';
                            Kolos.logInfo(dataResult['profilers']);
                        }
                        if (dataResult['errors'] !== undefined) {
                            debugDataAjax += '<pre style="background: #ffe5d2;">' + url + "<br><br>" + dataResult['errors'] + '</pre>';
                            Kolos.logInfo(dataResult['errors']);
                        }
                        $('#debugDataAjax').html(debugDataAjax);
                        */


                    } catch (exception_var){
                        dataResult = data;
                    }
                    try {
                        Self._ready(dataResult);
                    } catch (e) {
                        kolos.Utils.error('Error (Request callback url: ' + url + '): , error: ' + e, true);
                    }
                } catch (e) {
                    //
                }
            },
            complete: function(){
                //messages.loading.hide('request');
            },
            error: function (jqXHR, exception) {
                if (Self._callbackError === undefined) return;
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                Self._callbackError(msg, jqXHR.status);
            },
        });
    };

};