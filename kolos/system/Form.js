kolos.Form = function (tagId) {
    var Self = this;
    this.tagId = tagId;

    this._elements = {};

    this._init = function() {
        //запоминаем все элементы
        $(Self.tagId).find('input, textarea, select').each(function() {
            //для radio отдельная логика
            if ($(this).prop("type") === 'radio') {
                //радио чекеды складываем в массив по значениям
                if (Self._elements[this.name] === undefined) {
                    Self._elements[this.name] = {
                        isArray: true,
                    };
                }
                var valAsKey = $(this).val();
                Self._elements[this.name][valAsKey] = this;
            } else {
                //остальные складываем как обычно
                Self._elements[this.name] = this;
            }
        });
    };

    this._init();




    this.getAll = function() {
        var data = {};
        for (var name in this._elements) {
            //достаём все значения по имени
            data[name] = this.get(name);
        }
        return data;
    };

    this.get = function (name) {

        if (this._elements[name] !== undefined) {
            var element = this._elements[name];
            //если это массив radio
            if (element['isArray'] !== undefined) {

                for (var nameElem in element) {
                    var radio = element[nameElem];
                    //исключаем метку что это массив
                    if (nameElem !== 'isArray') {
                        //возвращаем значение выбранного элемента
                        if ($(radio).prop("checked")) {
                            return $(radio).val()
                        }
                    }
                }

            } else {
                //иначе это обычный элемент
                //если это чекбокс
                if ($(element).prop("type") === 'checkbox') {
                    if ($(element).prop("checked")) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return $(element).val();
                }
            }
        }
        return undefined;
    };

    this.getElement = function (name) {
        if (this._elements[name] !== undefined) {
            return this._elements[name];
        }
        return undefined;
    };

    this.set = function (name, value) {
        if (this._elements[name] !== undefined) {
            var element = this._elements[name];
            //если это массив radio
            if (element['isArray'] !== undefined) {

                //иначе это массив radio
                for (var nameElem in element) {
                    var radio = element[nameElem];

                    //исключаем метку что это массив
                    if (nameElem !== 'isArray') {
                        //выставляем чек для заданного значения
                        if ($(radio).val() == value) { //тут обязательно неявное сравнение, чтобы типы преобразовывались автоматом
                            $(radio).prop('checked', true);
                        }
                    }

                }
            } else {
                if ($(element).prop("type") === 'checkbox') {
                    $(element).prop("checked", value);
                } else {
                    $(element).val(value);
                }
            }
        }
    };

    this.toJson = function() {
        return JSON.stringify(this.getAll());
    }

};
