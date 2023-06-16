kolos.Set = function(valuesArr) {
    this.__arr = [];
    this.add = function(element) {
        if (!this.contains(element)) {
            this.__arr.push(element);
        }
    };
    this.remove = function(element) {
        const index = this.__arr.indexOf(element);
        if (index > -1) {
            this.__arr.splice(index, 1);
        }
    };
    this.contains = function(element) {
        return this.__arr.indexOf(element) > -1;
    };
    this.clear = function() {
        this.__arr = [];
    };
    this.getLength =function() {
        this.__arr.length;
    };

    //если переданы в конструктор массив значений, добавляем их через метод добавления, чтобы исключить повторения элементов
    if (valuesArr !== undefined) {
        for (var i in valuesArr) {
            this.add(valuesArr[i]);
        }
    }
};