kolos.Response = function(dataIn) {
    this.data = undefined;

    this._response = {};

    this.getData = function() {
        return this.get('data', undefined);
    };

    this.getTemplates = function() {
        return this.get('tpl', []);
    };

    this.getTemplate = function(name) {
        let templates = this.getTemplates();
        if (templates[name] !== undefined) {
            return templates[name];
        }
        return undefined;
    };

    this.getCode = function() {
        return this.get('code', 0);
    };

    this.getMessagesAll = function() {
        return this.get('msg', []);
    };

    this.getMessagesCallback = function(callback) {
        let messages = this.getMessagesAll();
        // выводим первое сообщение
        for (let i in messages) {
            callback(messages[i]);
        }
    };

    this.getMessage = function() {
        let messages = this.getMessagesAll();
        // выводим первое сообщение
        for (let i in messages) {
            return messages[i];
        }
        return undefined;
    };

    /**
     * Получить значение из результата
     * @param key ключ
     * @param def значение по умолчанию
     */
    this.get = function(key, def) {
        if (this._response[key] !== undefined) {
            return this._response[key];
        }
        return def;
    };


    //-- constructor -->>

    try {
        // парсим данные
        this._response = JSON.parse(dataIn);
    } catch (exception_var){
        // при ошибки результат просто подставляем в data
        this._response = {};
        this._response['data'] = dataIn;
    }

};