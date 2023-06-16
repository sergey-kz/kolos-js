var TField = function(idTag){
    var Self = this;
    this._tag = $('#'+idTag);
    this.val = function(value){
        if(value){
            this._tag.val(value);
            return this;
        } else
            return this._tag.val();
    }
    return this;
}

var TForm = function(tag){
    var Self = this;
    this._tag = $(tag);
    this._fields = [];
    
    /**
    * Получение данных в виде массива
    * @return Array
    */
    this.asArray = function(){
        var data = {};
        for(var i in this._fields){
            data[this._fields[i]] = $('#'+this._fields[i]).val();
        }
        return data;
    }
    
    /**
    * Получение данных в виде массива
    * @return JSON
    */
    this.asJSON = function(){
        return $.toJSON(Self.asArray());
    }
    
    /**
     * Отправка данных формы как массив
     * @param address адрес, куда отправлять
     * @return \request
     */
    this.send = function(address){
        return request(address)
                    .send(Self.asArray());
    }
    
    /**
     * Установка данных форм
     * @param data массив данных
     * @return \request
     */
    this.set = function(data){
        for(var i in data){
            $('#'+i).val(data[i]);
        }
        return this;
    }
    
    this.clear = function(){
        for(var i in this._fields){
            $('#'+this._fields[i]).val('');
        }
        return this;
    }
    
    // инициализация
    this._init = function(){
        var tmp = $(this._tag).serializeArray();
        for(var i in tmp){
            var idTag = tmp[i]['name'];
            this._fields.push(idTag);
            // создаём поля
            Self[idTag] = new TField(idTag);
        }        
        $(this._tag).submit(function() {
            //alert('Handler for .submit() called.');
            return false;
        });
    }
    this._init();
    
    return this;
}

/**
 * Форма (получение, обработка данных)
 * @param tag Тэг передаётся по правилам jQuery
 * @return \TForm
 */
var form = function(tag){
    return new TForm(tag);
}