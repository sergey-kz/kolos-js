kolos.component.MenuLeft = function () {
    // стандартные поля -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {};
    this.param = {};
    //--||

    this.items = [];

    /** @returns {kolos.component.MenuLeft.Item} */
    this.create = function () {
        let item = new kolos.component.MenuLeft.Item();
        this.items.push(item);
        return item;
    }

    this.update = function () {
        let str = '';
        for (let i = 0; i < this.items.length; i++) {
            str += this.templateItem(this.items[i], i);
        }
        $(this.context.element).html(str);
    }

    this.onReady = function () {

        let elements = kolos.Html.getFirstChildren(this.context.element);

        for (let i in elements) {
            let el = elements[i];

            this.create()
                .caption($(el).html())
                .url($(el).attr('href'));
        }

        this.update();

        window.addEventListener('hashchange', Self.__checkHash);
    };

    this.onDestroy = function () {
        window.removeEventListener('hashchange', Self.__checkHash);
    };

    this.__lastHash = '';

    this.__checkHash = function () {
        if (Self.__lastHash !== location.hash) {
            Self.__lastHash = location.hash;
            Self.update();
        }
    }

    this.__exec = function (menuIndex) {
        Self.items[menuIndex]['callback']();
    }

    /**
     * @param {kolos.component.MenuLeft.Item} item
     * @param itemIndex
     * @returns {string}
     */
    this.templateItem = function (item, itemIndex) {
        let href = '';
        if (item.__data['url'] !== undefined) {
            href = item.__data['url'];
        } else if (item.__data['callback'] !== undefined) {
            href = 'javascript: kolos.Global.get(' + Self.context.globalId + ').__exec(' + itemIndex + ');';
        } else {
            href = 'javascript: void(0);';
        }
        let cls = '';
        if (location.hash === href) {
            cls = 'sel';
        }

        return '<a href="' + href + '" class="' + cls + '">' + item.__data['caption'] + '</a>';
    }

    this.template = function () {
        return `
                <div class="menu-left">
                    [[content]]
                </div>
        `;
    };
};

kolos.component.MenuLeft.Item = function () {
    this.__data = {};

    /** @returns {kolos.component.MenuLeft.Item} */
    this.caption = function (caption) {
        this.__data['caption'] = caption;
        return this;
    }

    /** @returns {kolos.component.MenuLeft.Item} */
    this.url = function (url) {
        this.__data['url'] = url;
        return this;
    }

    /** @returns {kolos.component.MenuLeft.Item} */
    this.callback = function (callback) {
        this.__data['callback'] = callback;
        return this;
    }

    /** @returns {kolos.component.MenuLeft.Item} */
    this.image = function (image) {
        this.__data['image'] = image;
        return this;
    }
}

