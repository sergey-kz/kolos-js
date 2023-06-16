kolos.component.CodeEditor = function() {
    // стандартные поля -->>
    let Self = this;
    /** @type {kolos.ComponentContext} */
    this.context = undefined;
    this.element = {
        code: undefined,
    };
    this.component = {
        /** @type {kolos.component.Hint} */
        hint: undefined,
    }
    this.param = {};
    this.attr = {
        type: 'javascript'
    };
    //--

    /** @type {CodeMirror} */
    this.editor = undefined;


    this.setCode = function (code) {
        $(this.element.code).val(code);
        if (
            this.editor !== undefined
            && this.editor.setValue !== undefined
    ) {
            this.editor.setValue(code);
        }
    }

    this.getCode = function () {
        return this.editor.getValue();
    }

    this.refresh = function () {
        this.editor.refresh();
    }

    this.onReady = function() {

        let options = {
            lineNumbers: true,               // показывать номера строк
            matchBrackets: true,             // подсвечивать парные скобки
            styleActiveLine: true,
            indentUnit: 4 ,                  // размер табуляции
            extraKeys: {"Ctrl-Space": "autocomplete"},
            theme: "idea",
            //theme: "darcula",
            //theme: "xq-dark",
            //--
            lint: true,
            spellcheck: true,
            // lineWrapping: true,

            autoCloseTags: true,
            autoCloseBrackets: true,
            //matchTags: true,
        }


        switch (this.attr.type) {

            case 'javascript' :
                options = kolos.Utils.merge(options, {
                    mode: {name: "javascript", globalVars: true},
                    gutters: ["CodeMirror-lint-markers"],
                    lint: {options: {esversion: 2021}},
                    theme: "darcula",
                });
                break;

            case 'html' :
                options = kolos.Utils.merge(options, {
                    mode: "text/html",
                    value: document.documentElement.innerHTML,
                    gutters: ["CodeMirror-lint-markers"],
                    lint: true,
                    //theme: "xq-dark",
                    theme: "darcula",
                });
                break;
        }

        // сначала грузим основной движок редактора, после загрузки грузим все дополнения
        kolos.Utils.loadScripts([
            kolos.app.rootPath + "/kolos/lib/codemirror/lib/codemirror.js",
        ], () => {

            let urls = [
                "/kolos/lib/codemirror/addon/selection/active-line.js",
                "/kolos/lib/codemirror/addon/edit/matchbrackets.js",
                "/kolos/lib/codemirror/addon/hint/show-hint.js",
                "/kolos/lib/codemirror/addon/hint/xml-hint.js",
                "/kolos/lib/codemirror/addon/hint/html-hint.js",
                "/kolos/lib/codemirror/addon/hint/javascript-hint.js",

                "/kolos/lib/codemirror/addon/lint/lint.js",
                "/kolos/lib/codemirror/addon/lint/html-lint.js",
                "/kolos/lib/codemirror/addon/lint/javascript-lint.js",
                "/kolos/lib/codemirror/other/jshint.js", // дополнительная либа для lint, без неё не работает

                "/kolos/lib/codemirror/mode/javascript/javascript.js",
                "/kolos/lib/codemirror/mode/xml/xml.js",
                "/kolos/lib/codemirror/mode/css/css.js",
                "/kolos/lib/codemirror/mode/htmlmixed/htmlmixed.js",
                "/kolos/lib/codemirror/mode/markdown/markdown.js",

                '/kolos/lib/codemirror/addon/edit/closetag.js',
                '/kolos/lib/codemirror/addon/edit/closebrackets.js',
                //'/kolos/lib/codemirror/addon/edit/matchtags.js',
            ];

            // добавляем корневой каталог
            for (let i in urls) {
                urls[i] = kolos.app.rootPath + urls[i];
            }

            //urls.push("https://unpkg.com/jshint@2.13.2/dist/jshint.js");

            //  грузим оставшиеся скрипты
            kolos.Utils.loadScripts(urls, () => {
                // создаём редактор
                Self.editor = CodeMirror.fromTextArea(this.element.code, options);
            });

        });

        // грузим стили редактора
        kolos.Utils.loadCss("/static/js/kolos/lib/codemirror/lib/codemirror.css");
        kolos.Utils.loadCss("/static/js/kolos/lib/codemirror/theme/idea.css");
        kolos.Utils.loadCss("/static/js/kolos/lib/codemirror/theme/darcula.css");
        kolos.Utils.loadCss("/static/js/kolos/lib/codemirror/theme/xq-dark.css");
        kolos.Utils.loadCss("/static/js/kolos/lib/codemirror/addon/hint/show-hint.css");
        kolos.Utils.loadCss("/static/js/kolos/lib/codemirror/addon/lint/lint.css");

        // корректируем стиль
        $('head').append(`<style>
            .cm-s-darcula span.cm-tag {
                color: #ffc66d;
                 font-weight: inherit; 
                 font-style: inherit; 
                 text-decoration: inherit; 
            }
            
            .cm-s-darcula span.cm-bracket {
                color: #ffc66d;
            }
            
            .cm-s-darcula span.cm-attribute {
                color: #aab7c5;
            }
            
            .cm-s-darcula span.cm-keyword {
                 font-weight: inherit; 
            }
        </style>`);
    }

    this.onDestroy = function() {
        //
    }

    this.template = function() {
        return `
            <div>
                <textarea id="code"></textarea>
            </div>
        `;
    }
}

