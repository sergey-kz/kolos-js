if (kolos.example === undefined) kolos.example = {};
kolos.example.Components = function() {
    let Self = this;

    // стандартные поля -->>
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {
        // link: {},
        table: {},
    };
    this.component = {
        /** @type {kolos.component.Table} */
        table: {},
    }
    this.param = {};
    //--

    this.__initTableFlag = false;
    this.__initTable = function () {
        if (!this.__initTableFlag) {
            this.__initTableFlag = true;

            Self.component.table.setFields({
                id: "ID",
                name: "Name",
                group: "GroUp"
            });

            Self.component.table.addAction("View row", function (row) {
                alert(JSON.stringify(row));
            });

            Self.component.table.addAction("View name", function (row) {
                alert(row["name"]);
            });

            Self.component.table.setData([
                {id: 100, name: "Viktor", group: "007"},
                {id: 101, name: "Alex", group: "007"},
                {id: 102, name: "Viktor", group: "007"},
            ]);
        }
    }

    this.onReady = function() {
        // грузим файл с примерами
        Self.loadFile('ComponentExample.html', (data) => {

            $(Self.context.element).html(data);

            kolos.app.componentManager.initComponentsFromTag(Self.context.element, Self, (cmp) => {
                Self.__initTable();
            });
        });
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `<div></div>`;
    }

}

