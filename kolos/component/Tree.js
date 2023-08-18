kolos.component.Tree = function() {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {
        content: {},
    };
    this.component = {
        /** @type {kolos.component.Hint} */
        hint: {},
    }
    this.param = {};
    this.attr = {};
    //--

    this.FIELD_KEY = 'id';
    this.FIELD_PARENT = 'pid';
    this.FIELD_CAPTION = 'name';

    this.items = {};
    /**
     *
     * @type {*[kolos.component.Tree.Node]}
     */
    this.nodes = [];



    this.setData = function (data) {
        // создаём элементы
        for (let i in data) {
            let key = data[i][this.FIELD_KEY];
            let row = data[i];
            // создаём узел
            let node = new kolos.component.Tree.Node(this);
            node.data = row;
            this.items[key] = node;
        }

        // строим дерево
        this.nodes = [];
        for (let key in this.items) {
            /** @type {kolos.component.Tree.Node} */
            let node = this.items[key];
            /** @type {kolos.component.Tree.Node} */
            let parent = this.items[node.getParentKey()];
            if (parent !== undefined) {
                parent.child.push(node);
            } else {
                this.nodes.push(node);
            }
        }

        $(this.element.content).html(this.__renderTree());
    }

    this.__renderTree = function () {
        //return JSON.safeStringify(this.data);
        let element = $('<div></div>');

        // строим dom элементы
        for (let key in this.items) {
            /** @type {kolos.component.Tree.Node} */
            let node = this.items[key];
            let nodeElement = node.buildElement();
            element.append(nodeElement);
        }

        // формируем дерево
        for (let key in this.items) {
            /** @type {kolos.component.Tree.Node} */
            let node = this.items[key];

            for (let i in node.child) {
                let childNode = node.child[i];
                $(node.element.child).append(childNode.element.node);
            }
        }

        return element;

    }

    this.onReady = function() {
        //
    }

    this.onDestroy = function() {
        //
    }

    // this.template = function() {
    //     return `
    //         <div>
    //             <div component="kolos.component.Hint"></div>
    //             <div id="link">
    //                 <a href="javascript: kolos.component.Tree.exampleMethod();">Test exampleMethod</a>
    //             </div>
    //             <div>[[content]]</div>
    //         </div>
    //     `;
    // }
}

kolos.component.Tree.Node = function (parentCom) {
    let Self = this;
    /** @type {kolos.component.Tree} */
    this.parentCom = parentCom;
    // dom элементы
    this.element = {
        node: undefined,
        caption: undefined,
        arrow: undefined,
        icon: undefined,
        text: undefined,
        child: undefined
    };
    /** @type [{kolos.component.Tree.Node}] */
    this.child = [];
    this.data = {};
    this.isOpen = true;


    this.getKey = function () {
        return this.data[parentCom.FIELD_KEY];
    }

    this.getParentKey = function () {
        return this.data[parentCom.FIELD_PARENT];
    }

    this.getCaption = function () {
        return this.data[parentCom.FIELD_CAPTION];
    }

    this.open = function () {
        Self.isOpen = true;
        $(Self.element.arrow).html('expand_more');
        $(Self.element.child).slideDown(150);
    }

    this.close = function () {
        Self.isOpen = false;
        $(Self.element.child).slideUp(150, () => {
            $(Self.element.arrow).html('chevron_right');
        });
    }

    this.onclick = function () {
        if (Self.isOpen) {
            Self.close();
        } else {
            Self.open();
        }
    }

    this.buildElement = function () {
        let elementItem = $(Self.__templateNode(Self));
        Self.element.node = elementItem[0];
        Self.element.caption = $(elementItem).find('.tr-caption')[0];
        Self.element.text = $(elementItem).find('.tr-text')[0];
        Self.element.child = $(elementItem).find('.tr-child')[0];
        Self.element.arrow = $(elementItem).find('.tr-arrow')[0];
        Self.element.icon = $(elementItem).find('.tr-icon')[0];

        Self.element.caption.onclick = function (e) {
            Self.onclick(e);
        }

        Self.updateState();

        return elementItem;
    }

    this.updateState = function () {
        if (Self.child.length === 0) {
            $(Self.element.icon).show();
            $(Self.element.arrow).hide();
            // $(node.element.arrow).html("feed");
        } else {
            $(Self.element.icon).hide();
            $(Self.element.arrow).show();
        }
    }

    /**
     * @param {kolos.component.Tree.Node} node
     * @return {string}
     * @private
     */
    this.__templateNode = function (node) {
        return `<div class="tr-node">
            <div class="tr-caption">
                <a class="icon-m tr-arrow" href="javascript: void(0);">expand_more</a>
                <!--<a class="icon-m" href="javascript: void(0);">check_box_outline_blank</a>-->
                <span class="tr-text"><i class="icon-m tr-icon">feed</i> ` + node.getCaption() + `</span>
            </div>
            <div class="tr-child">
            </div>
        </div>`;
    }

}
