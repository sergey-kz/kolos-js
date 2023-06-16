kolos.Pagination = function (containerTagId) {
    var Self = this;
    this.containerTagId = containerTagId;
    this.globalIndex = kolos.Global.add(this);
    this._page = 1;
    this._count = 1;
    this._countView = 9;
    this._action = undefined;
    this._syncPagination = undefined; // объект пагинации, с которым нужно синхронизовать

    /**
     *
     * @param page
     * @returns {kolos.Pagination}
     */
    this.page = function (page) {
        this._page = page;
        this.render();
        if (this._syncPagination !== undefined) {
            this._syncPagination._page = page;
            this._syncPagination.render();
        }
        // выполняем действие
        if (this._action !== undefined) {
            this._action(page);
        }
        if (this._syncPagination !== undefined) {
            if (this._syncPagination._action !== undefined) {
                this._syncPagination._action(page);
            }
        }
        return this;
    };

    this.getPage = function() {
        return this._page;
    };

    /**
     *
     * @param callback
     * @returns {kolos.Pagination}
     */
    this.action = function(callback) {
        this._action = callback;
        return this;
    };

    /**
     *
     * @param count
     * @returns {kolos.Pagination}
     */
    this.count = function (count) {
        this._count = count;
        this.render();
        if (this._syncPagination !== undefined) {
            this._syncPagination._count = count;
            this._syncPagination.render();
        }
        return this;
    };


    /**
     * Синхронизовать с другим объектом пагинации
     * @param pagination
     * @returns {kolos.Pagination}
     */
    this.sync = function (pagination) {
        this._syncPagination = pagination;
        pagination._syncPagination = this;
        return this;
    };

    /**
     *
     * @param countView
     * @returns {kolos.Pagination}
     */
    this.countView = function (countView) {
        this._countView = countView;
        this.render();
        if (this._syncPagination !== undefined) {
            this._syncPagination._countView = countView;
            this._syncPagination.render();
        }
        return this;
    };

    this.render = function() {
        var content = '';

        var min = this._page - Math.floor(this._countView / 2);
        if (min < 1) {
            min = 1;
        }

        var max = min + this._countView;
        if (max > this._count) {
            max = this._count;
        }

        if (max - min < this._countView) {
            min = max - this._countView;
            if (min < 1) {
                min = 1;
            }
        }

        //var backward = false;
        //var forward = false;

        // перейти в начало
        if (min > 1) {
            content += '<a class="button ' + (i === this._page ? 'active' : '') + '" href="javascript: kolos.Global.get(' + this.globalIndex + ').page(1)"><i class="icon-m">fast_rewind</i> </a>';
            //content += '<a class="button ' + (i === this._page ? 'active' : '') + '" href="javascript: kolos.Global.get(' + this.globalIndex + ').page(' + (this._page - 1) + ')">< </a>';
        }

        for (var i = min; i<= max; i++) {
            //var btnId = kolos.Global.getTagId(this.globalIndex) + '_' + i;
            content += '<a class="button ' + (i === this._page ? 'active' : '') + '" href="javascript: kolos.Global.get(' + this.globalIndex + ').page(' + i + ')">' + i + '</a>';
        }

        /*if (max < this._count) {
            content += ' . . . ';
            content += '<a class="button" href="javascript: kolos.Global.get(' + this.globalIndex + ').page(' + this._count + ')">' + this._count + '</a>';
        }*/

        // перейти в конце
        if (max < this._count) {
            //content += '<a class="button ' + (i === this._page ? 'active' : '') + '" href="javascript: kolos.Global.get(' + this.globalIndex + ').page(' + (this._page + 1) + ')">> </a>';
            content += '<a class="button ' + (i === this._page ? 'active' : '') + '" href="javascript: kolos.Global.get(' + this.globalIndex + ').page(' + this._count + ')"><i class="icon-m">fast_forward</i> </a>';
        }

        $(this.containerTagId).html(content);
    };

    this.update = function(page, count) {
        if (page !== undefined) {
            this._page = page;
        }
        if (count !== undefined) {
            this._count = count;
        }
        this.render();
    };

};