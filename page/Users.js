kolos.page.Users = function() {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {};
    this.component = {
        /** @type {kolos.component.Table} */
        usersTable: {}
    }
    this.param = {};
    this.attr = {};
    //--

    this.update = function() {
        // массив с данными (который можно получать по сети)
        let data = [
            {'id': 100, 'name': 'Ivan', 'right': 0},
            {'id': 521, 'name': 'Petr', 'right': 0},
            {'id': 753, 'name': 'Chuck', 'right': 0},
            {'id': 43, 'name': 'Blade', 'right': 0},
        ];
        // задаём данные в таблицу
        Self.component.usersTable.setData(data);
    }

    this.formAdd = function() {
        //
    }

    this.onPage = function() {
        // происходит каждый раз при переходе на страницу
        // метод нужен только для страниц
    }

    this.onReady = function() {
        // инициализация компонента

        // задаём описания поле таблицы
        Self.component.usersTable.setFields({
            id: 'ид',
            name: 'Имя',
            right: 'Права'
        });

        // добавляем действие для таблцы
        Self.component.usersTable.addAction('Удалить', function (row) {
            // здесь row - это строка данных из таблицы
            alert('Удалить пользователя "' + row['name'] + '" (id: ' + row['id'] + ') ?');
        });
    }

    this.onDestroy = function() {
        // уничтожение компонента
    }

}

