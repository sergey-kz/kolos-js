kolos.component.TopMenu = function() {
    // стандартные поля -->>
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
        caption: undefined,
        form: undefined,
        divBtnSend: undefined
    };
    this.component = {
        /** @type {kolos.component.Hint} */
        hintFrom: {},
    }
    this.param = {};
    //--


    this.__prepareTagId = function (tagId) {
        return this.context.tagId + '-i-' + tagId;
    }

    this.__buildSumItems = function (items) {
        if (
            items === undefined
            || items === ''
            || items.length === 0
        ) {
            return '';
        }
        let build = '<div class="dropdown-content">';
        for (let i in items) {
            let item = items[i];
            build += `
                <a href="javascript: ` + item['action'] + `;" id="` + item['id'] + `" class="menu-item nwr"">
                    ` + item['icon'] + ` ` + item['caption'] + `
                </a>`;
        }

        build += '</div>';
        return build;
    }

    this.__buildItem = function (item) {
        return `
            <div class="dropdown ib">
                <a href="javascript: ` + item['action'] + `;" id="` + item['id'] + `" class="menu-item">
                    ` + item['icon'] + ` ` + item['caption'] + `
                </a>
                ` + this.__buildSumItems(item['items']) + `
            </div>`;
    }

    this.onReady = function() {

        this.data = eval(this.param['content']);

        let build = '';
        let indexer = 0;
        for (let i in this.data) {
            let itemId = this.__prepareTagId(indexer++);
            let item = {
                id: kolos.Utils.val(this.data[i], 'id', itemId),
                caption: kolos.Utils.val(this.data[i], 'caption', ''),
                icon: kolos.Utils.val(this.data[i], 'icon', ''),
                action: kolos.Utils.val(this.data[i], 'action', ''),
                items: kolos.Utils.val(this.data[i], 'items', []),
            };
            build += this.__buildItem(item);
        }

        $(this.context.element).html(build);
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `<span>[[content]]</span>`;
    }
}

