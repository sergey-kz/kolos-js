kolos.component.Table = function () {
    // стандартные поля -->>
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {};
    //--||

    this.fields = {};
    this.data = {};
    this.actions = [];

    this.setFields = function (fields) {
        this.fields = fields;
    }

    this.setData = function(data) {
        this.data = data;
        $(this.context.element).html(this.__renderTable());
    }

    /**
     *
     * @param caption
     * @param {function} callback в параметры передаётся строка
     */
    this.addAction = function (caption, callback) {
        this.actions.push({
            'caption': caption,
            'callback': callback
        });
    }

    this.__renderTable = function() {
        let content = '<table class="table" style="width: 100%;">';
        content += this.__renderHeader();
        content += this.__renderBody();
        content += '</table>';
        return content;
    }

    this.__renderHeader = function() {
        // если поля не заданы, то берём их из данных
        if (kolos.Utils.isEmpty(this.fields)) {
            for (let i in this.data) {
                let row = this.data[i];
                this.fields = {};
                for (let fieldName in row) {
                    this.fields[fieldName] = fieldName;
                }
                break;
            }
        }
        let content = '<thead>\t<tr>\n';
        for (let fieldName in this.fields) {
            let caption = this.fields[fieldName];
            content += this.__renderHeaderCell(fieldName, caption);
        }
        for (let i in this.actions) {
            content += this.__renderHeaderCell('', '');
        }
        content += '</tr>\t</thead>\n';
        return content;
    }

    this.__renderHeaderCell = function(fieldName, caption) {
        return '\t\t<th>' + caption + '</th>\n';
    }

    this.__renderBody = function() {
        let content = '<tbody>';

        for (let index in this.data) {
            let row = this.data[index];
            content += this.__renderRow(row, index);
        }

        content += '</tbody>';
        return content;
    }

    this.__renderRow = function(row, index) {
        let content = '\t<tr>\n';
        for (let fieldName in row) {
            let value = row[fieldName];
            content += this.__renderCell(fieldName, value, row, index);
        }
        for (let actionId in this.actions) {
            let action = this.actions[actionId];
            let actionEl = '<a href="javascript: kolos.Global.get(' + this.context.globalId + ').__execAction(' + actionId + ', ' + index + ')">' + action['caption'] + '</a>';
            content += this.__renderCell('action' + actionId, actionEl, row, index);
        }
        content += '\t</tr>\n';
        return content;
    }

    this.__renderCell = function(fieldName, value, row, index) {
        return '\t\t<td>' + value + '</td>\n'
    }

    this.__execAction = function(actionId, index) {
        let action = this.actions[actionId];
        let row = this.data[index];
        // выполняем деействие
        action.callback(row);
    };

    this.onReady = function () {
        //
    };

    this.template = function () {
        return `
            <div>
                <table class="table" style="width: 100%;">
                    <thead>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        `;
    };
};
