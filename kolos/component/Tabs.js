kolos.component.Tabs = function() {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
        content: undefined,
        tabContainer: undefined,
    };
    this.component = {
        /** @type {kolos.component.Hint} */
        hint: undefined,
    }
    this.param = {};
    this.attr = {};
    //--

    this.__currentIndex = undefined;
    this.__onChange = [];

    /**
     * @type {[kolos.component.Tabs.TabItem]}
     */
    this.tabs = [];


    this.changeTab = function(index) {
        if (index !== this.__currentIndex) {
            this.__currentIndex = index;
            for (let i in this.tabs) {
                this.tabs[i].hide();
            }
            this.tabs[index].show();
            for (let i in this.__onChange) {
                this.__onChange[i](index);
            }
        }
    }

    this.onChange = function (callback) {
        this.__onChange.push(callback);
    }

    this.onReady = function() {

        let tabElements = kolos.Html.getFirstChildren(this.element.content);

        // скрываем все элементы
        for (let i = 0; i < tabElements.length; i++) {
            $(tabElements[i]).hide();
        }

        // создаём объекты вкладок
        for (let i = 0; i < tabElements.length; i++) {
            let tabItem = new kolos.component.Tabs.TabItem(tabElements[i], i, Self);
            this.tabs.push(tabItem);
        }

        // засовываем вкладки в контейнер вкладок
        for (let i in this.tabs) {
            let tabItem = this.tabs[i];
            $(this.element.tabContainer).append(tabItem.elementTab);
        }

        // показываем первую вкладку
        this.changeTab(0);
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `
            <div class="tabs">
                <div class="tab-container" id="tabContainer"></div>
                <div class="tab-content" id="content">
                    [[content]]
                </div>
            </div>
        `;
    }

}

kolos.component.Tabs.TabItem = function (element, index, parent) {
    let Self = this;
    this.parent = parent;
    this.index = index;
    this.element = element;
    this.elementTab = undefined;
    this.caption = undefined;
    this.name = undefined;

    this.show = function () {
        $(this.elementTab).addClass('active');
        $(this.element).show();
    }

    this.hide = function () {
        $(this.elementTab).removeClass('active');
        $(this.element).hide();
    }

    this.template = function () {
        return '<a class="tab-item mr-norm" href="javascript: kolos.component.Tabs.changeTab(' + this.index + ');">' + this.caption + '</a>';
    }

    this.init = function () {
        this.name = $(this.element).attr('name');
        this.caption = $(this.element).attr('caption');
        if (this.caption === undefined) {
            this.caption = 'tab';
        }
        let tpl = kolos.ComponentManager.replaceCallActions(this.template(), this.parent);
        this.elementTab = $(tpl);
    }

    this.init();
}

