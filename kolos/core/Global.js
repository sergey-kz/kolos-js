// это для безопасности, чтобы по ошибке не переопределить глобальное свойство
if (kolos.Global === undefined) {
    /**
     * Работа с глобальными объектами, чтобы просто добавлять общий пул, и избежать их пересечения
     */
    kolos.Global = {
        objects: {},
        index: 0,
        add: function(obj) {
            let i = this.index++;
            this.objects[i] = obj;
            return i;
        },
        get: function(id) {
            return this.objects[id];
        },
        remove: function(id) {
            delete this.objects[id];
        },
        getTagId: function(id) {
            return 'kolos-gl-' + id;
        }
    };

}
