kolos.component.Upload = function() {
    // base properties -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = {};
    this.element = {
        area: {},
        items: {},
        caption: {},
        controls: {},
        btnSelectFile: {},
    };
    this.component = {
        /** @type {kolos.component.Hint} */
        hint: {},
        btnSend: {},
    }
    this.param = {
        autoLoad: false,
        autoHide: false
    };
    this.attr = {
        path: '/upload',
        upload: undefined
    };
    //--

    this.__items = {};
    this.__index = 0;

    this.__callback = [];
    this.__callbackAll = [];


    this.onUpload = function (callback) {
        this.__callback.push(callback);
    }

    this.onUploadAll = function (callback) {
        this.__callbackAll.push(callback);
    }

    /**
     * @param {kolos.component.Upload.Item} item
     */
    this.__executeCallbacks = function (item) {
        for (let i in Self.__callback) {
            let callback = Self.__callback[i];
            try {
                callback(item);
            } catch (e) {
                kolos.Utils.error(e)
            }
        }

        let count = kolos.Utils.getLength(this.__items);
        let countUpload = 0;
        for (let i in this.__items) {
            /** @var {kolos.component.Upload.Item} */
            let item = this.__items[i];
            if (item.isUpload) {
                countUpload++;
            }
        }

        // если все элементы загружены, вызываем колбэкт
        if (count === countUpload) {
            if (this.attr.upload !== undefined && this.attr.upload !== '') {
                try {
                    eval(this.attr.upload);
                } catch (e) {
                    kolos.Utils.error(e);
                }
            }
            for (let i in Self.__callbackAll) {
                let callback = Self.__callbackAll[i];
                try {
                    callback(item);
                } catch (e) {
                    kolos.Utils.error(e)
                }
            }
        }
    }

    this.uploadAll = function() {
        for (let index in this.__items) {
            let item = this.__items[index];
            this.__uploadItem(item);
        }
    }

    this.selectFile = function () {
        Self.element.btnSelectFile.click();
    }

    this.updateState = function () {
        let countNotUpload = 0;
        for (let i in this.__items) {
            /** @type {kolos.component.Upload.Item} */
            let item = this.__items[i];
            if (!item.isUpload) {
                countNotUpload++;
            }
        }

        if (kolos.Utils.isEmpty(this.__items)) {
            $(Self.element.caption).show();
        } else {
            $(Self.element.caption).hide();
        }

        if (countNotUpload > 0) {
            $(Self.component.btnSend.context.element).show();
        } else {
            $(Self.component.btnSend.context.element).hide();
        }
    }

    this.toggleIn = function () {
        Self.element.area.classList.add('upload-hover');
    }

    this.toggleOut = function () {
        Self.element.area.classList.remove('upload-hover');
    }

    this.__uploadItem = function (item) {
        let fileInstanceUpload = item.file;

        if(!item.isUpload && fileInstanceUpload != undefined) {

            item.toggleLoad();

            const formData = new FormData()
            const xhr = new XMLHttpRequest()

            formData.append('image', fileInstanceUpload)

            // xhr.upload.addEventListener('progress', function() {
            //     hintText.classList.remove('upload-hint_visible')
            //     loaderImage.classList.add('upload-loader_visible')
            // })

            xhr.open('POST', Self.attr.path, true)

            xhr.send(formData)

            xhr.onload = function (event){
                if (xhr.status == 200) {
                    item.toggleSuccess();

                    Self.__executeCallbacks(item);

                    if (Self.param.autoHide == 'true') {
                        setTimeout(() => {
                            item.remove();
                        }, 1000);
                    }
                } else {
                    item.toggleError();
                }
                Self.updateState();
            }

            xhr.onerror = function (event) {
                item.toggleError();
                Self.updateState();
            }
        }
    }

    this.fileFilter = function (file) {
        // let BYTES_IN_MB = 1048576;
        // if (file.size > 5 * BYTES_IN_MB) {
        //     alert('Принимается файл до 5 МБ')
        //     return false
        // }
        // if (!file.type.startsWith('image/')) {
        //     alert('Можно загружать только изображения')
        //     return false
        // }
        return true;
    }


    this.onReady = function() {

        Self.element.btnSelectFile.addEventListener("change", (event) => {
            Self.__addFiles(event.target.files);
            event.target.files = [];
        }, false);

        // ниже инициализация перетаскивания -->>

        if (kolos.component.Upload.__initDragoverDrop === undefined) {
            kolos.component.Upload.__initDragoverDrop = true;
            ['dragover', 'drop'].forEach(function(event) {
                document.addEventListener(event, function(evt) {
                    evt.preventDefault();
                    return false
                })
            });
        }

        this.element.area.addEventListener('dragenter', function(event) {
            Self.toggleIn();
        });
        this.element.area.addEventListener('dragleave', function(event) {
            // Self.toggleOut();
        });

        this.element.caption.addEventListener('dragenter', function(event) {
            Self.toggleIn();
        });
        this.element.caption.addEventListener('dragleave', function(event) {
            // Self.toggleOut();
        });

        this.element.controls.addEventListener('dragenter', function(event) {
            Self.toggleIn();
            // alert('123');
        });
        this.element.controls.addEventListener('dragleave', function(event) {
            // Self.toggleOut();
        });

        this.element.items.addEventListener('dragenter', function(event) {
            Self.toggleIn();
        });
        this.element.items.addEventListener('dragleave', function(event) {
            // Self.toggleOut();
        });

        this.element.area.addEventListener('drop', function(event) {
            Self.__addFiles(event.dataTransfer.files);
        });
    }

    this.__addFiles = function (files) {
        for (let index in files) {
            let file = files[index];

            if (!Self.fileFilter(file)) {
                continue;
            }

            Self.toggleOut();
            Self.__createItem(file);
            Self.updateState();
        }
    }

    this.__createItem = function(file) {
        // создам позицию на загрузку
        let item = new kolos.component.Upload.Item(
            Self,
            this.__index++,
            file
        );
        // добавляем в кучу
        this.__items[item.index] = item;

        // сразу отправляем на сервер после добавления
        if (Self.param.autoLoad == 'true') {
            Self.__uploadItem(item);
        }
    }

    this.onDestroy = function() {
        this.element.area.removeEventListener('dragenter');
        this.element.area.removeEventListener('dragleave');
    }

}

kolos.component.Upload.Item = function (component, index, file) {
    let Self = this;
    this.component = component;
    this.tagId = component.context.tagId + '-item' + index;
    this.imageTagId = component.context.tagId + '-item' + index + '-img';
    this.closeTagId = component.context.tagId + '-item' + index + '-close';
    this.loadTagId = component.context.tagId + '-item' + index + '-load';
    this.file = file;
    this.index = index;
    this.element = undefined;
    this.isUpload = false;

    this.remove = function () {
        $(Self.element).fadeOut("fast", () => {
            $(Self.element).remove();
            // удаляем из компонента
            delete component.__items[Self.index];
            component.updateState();
        });
    }

    this.toggleLoad = function () {
        $('#' + this.loadTagId).show();
    }

    this.toggleSuccess = function () {
        // $(this.element).css('background','#ebf5ee');
        $('#' + this.closeTagId).removeClass('icon-cancel');
        $('#' + this.closeTagId).addClass('icon-ok');
        $('#' + this.loadTagId).hide();
        this.isUpload = true;
    }

    this.toggleError = function () {
        // $(this.element).css('background','#f5eceb');
        $(this.element).css('background','#dc6e63');
        $('#' + this.loadTagId).hide();
        this.isUpload = false;
    }

    this.template = function () {
        let src = URL.createObjectURL(this.file);
        return `
            <div id="` + this.tagId + `" class="mt-small ib radius-small" style="
            width: 100px; margin: 1px; padding: 1px;
            border: 1px dotted #eeeeee;">
                <div style="position: absolute;">
                    <a id="` + this.closeTagId + `" href="javascript: void(0)" class="actionDelete icon-cancel" style="
                        display: inline-block;
                        position: relative;
                        left: 80px;
                        top: -2px;
                        width: 25px;
                        height: 25px;
                    "></a>
                </div>
                <div class="center">
                    <img id="` + this.imageTagId + `" src="` + src + `" class="vm" style="width: 100%; "/>
                </div>
                <div class="text-small wr">
                    <span id="` + this.loadTagId + `" class="icon-load" style="display: none;"></span>
                    ` + this.file.name + `
                </div>
            </div>
        `;
    }

    // создаём элемент из шаблона
    this.element = $(this.template().trim());
    // добавляем элемент в список позиций
    $(component.element.items).append(this.element);


    // добавлям действие удаления
    $(this.element).find('.actionDelete').on('click', function () {
        // удаляем со страницы
        Self.remove();
    });

}

