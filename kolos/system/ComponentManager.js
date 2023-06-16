// внутренний класс
kolos.ComponentContext = function() {
    /** родительский компонент */
    this.parent = undefined;
    this.baseElement = undefined;
    this.fullClassName = undefined;
    this.className = undefined;
    this.namespace = undefined;
    this.name = undefined;
    // ниже инфа заполняется при создании
    this.globalId = undefined;
    this.tagId = undefined;
    /** @type {Element} */
    this.element = undefined;
    /**
     * Компонент подготовлен к инициализации (создан, выставлены необходимые поля)
     * @type {boolean}
     */
    this.isPrepared = false;
    /**
     * Компонент инициализирован
     */
    this.isInit = false;
    this.path = '';
}

kolos.ComponentManager = function (rootPath) {
    let Self = this;
    /**
     * Корневой путь для загрузки скриптов
     * @type {string}
     */
    this.rootPath = rootPath !== undefined ? rootPath : '/';
    /**
     * Все компоненты загружаемые через данный менеджер
     * @type {{}}
     */
    this.__components = {};
    /**
     * Таймер проверяющий загрузку компонетов
     */
    this.__timerCheckInitComponent = undefined;
    /**
     * Кэш классов компонентов
     */
    this.__cacheClass = {};


    this.__filterNameSpace = function(name) {
        return name.replace(/[^a-zA-Zа-яА-Я\.\-\d]/ig, "");
    }

    /**
     * Free components from memory
     */
    this.freeAll = function() {
        for (let i in this.__components) {
            let comp = this.__components[i];
            this.freeComponent(comp);
        }
        this.__components = {};
    }

    this.destroyComponent = function (comp) {
        this.freeComponent(comp);
        // remove dom element
        if (comp.context !== undefined && comp.element !== undefined) {
            $(comp.context.component).remove();
        }
    }

    this.freeComponent = function(comp) {
        try {
            if (comp !== undefined) {
                if (comp.onDestroy !== undefined) {
                    try {
                        comp.onDestroy();
                    } catch (e) {
                        console.error(e);
                    }
                }
                /** @var {kolos.ComponentContext} comp.context */
                if (comp.context !== undefined) {
                    kolos.Global.remove(comp.context.globalId);
                    delete Self.__components[comp.context.globalId];
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Full destroy components
     */
    this.destroyAll = function() {
        for (let i in this.__components) {
            let comp = this.__components[i];
            this.destroyComponent(comp);
        }
        this.__components = {};
    }

    //---------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------

    /**
     * Построить дерево компонентов
     */
    this.__buildTreeElementComponent = function (elements, parentNode)
    {
        if (parentNode === undefined) {
            parentNode = {
                element: undefined,
                child: []
            };
        }

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            // достаём класс компонента
            let classComp = $(element).attr('component');

            if (classComp !== undefined) {
                // есть класс, значит это компонент
                let newNode = {
                    'element' : element,
                    'child': []
                }
                // добавляем в родителя
                parentNode.child.push(newNode);
                this.__buildTreeElementComponent($(element).children(), newNode);
            } else {
                // иначе это обычный элемент, обрабатываем его потомков, с текущим родителем
                this.__buildTreeElementComponent($(element).children(), parentNode);
            }
        }

        return parentNode;
    }

    /**
     * Построить контекст для каждого элемента в дереве
     */
    this.__buildContextInTree = function (nodes) {
        for (let i in nodes) {
            let node = nodes[i];
            node.context = this.__buildContext(node.element, undefined);
            this.__buildContextInTree(node.child);
        }
    }


    this.__buildPathComponent = function (context) {
        // формируем url
        let url;
        let subNameSpace = context.namespace.replace('kolos.', '');
        let coreComponents = [
            'component'
        ];
        // компоненты ядра грузим из каталога kolos
        if (coreComponents.includes(subNameSpace)) {
            // формируем адрес загрузки
            url = Self.rootPath
                + '/kolos/' + subNameSpace;
        } else {
            url = Self.rootPath
                + '/' + subNameSpace;
        }
        return url;
    }

    /**
     * @param {kolos.ComponentContext} context
     * @private
     */
    this.__buildUrl = function (context) {
        // формируем url
        return context.path + '/' + context.className + '.js';
    }

    /**
     * Предварительная загрузка скриптов компонентов в дереве
     */
    this.__preloadComponentsInTree = function (nodes) {
        for (let i in nodes) {
            let node = nodes[i];
            let url = this.__buildUrl(node.context);

            // просто загружаем скрипт
            kolos.Utils.loadScriptAndExec(url, undefined);

            this.__preloadComponentsInTree(node.child);
        }
    }

    /**
     * Создать базовую часть компонента по контексту
     */
    this.__createBaseComponentFromContext = function (context, parent, callback) {
        let url = this.__buildUrl(context);
        // загружаем скрипт компонента
        kolos.Utils.loadScriptAndExec(url, function () {

            // материализуем класс компонента из строки (включая пространство имён)
            let componentClass = Self.__getComponentClass(context);

            // создаём компонент
            let component = new componentClass();
            component.context = context;

            // создаём обязательные поля, если ранее не были заданы
            // вложенные компоненты
            if (component.component === undefined) component.component = {};
            // dom элементы компонента, у которых заданы id (для быстрого доступа)
            if (component.element === undefined) component.element = {};
            // дополнительные параметры компонента, которые можно задачть через атрибут param
            if (component.param === undefined) component.param = {};
            // для проверки инициализации вложенных компонентов
            component.__checkSubCompInit = [];
            // методы которые нужно вызвать по готовности компонента
            component.__ready = [];

            // добавляем стандартные методы для вызова по готовности
            // сначала вызывается метод сообщающий о готовности
            if (component.onReady !== undefined) {
                component.__ready.push(component.onReady);
            }

            // добавляем в глобальные объекты и запоминаем его globalId
            context.globalId = kolos.Global.add(component);
            context.tagId = 'k-c-g' + context.globalId;

            // запоминаем компонент в менеджере
            Self.__components[context.globalId] = component;

            if (parent !== undefined) {
                // запоминаем родителя
                context.parent = parent;
                // добавляем в список компонентов родительского компонента
                parent.component[component.context.name] = component;
                // добавляем в список ожидания готовности
                parent.__checkSubCompInit.push(context);
            }


            // делаем метод загрузки простых файлов
            component.loadFile = function(fileName, callback) {
                let urlFile = context.path + '/' + fileName + '?v=' + kolos.Utils.getVer();
                $.ajax({
                    url: urlFile,
                    dataType: 'text',
                    type: 'GET',
                    async: true,
                    success: function (response) {
                        callback(response);
                    }
                });
            }



            // проверяем, если нет метода шаблона в компоненте, то загружаем шаблон отдельно
            if (component.template === undefined) {
                let urlTpl = context.path + '/' + context.className +'.html' + '?v=' + kolos.Utils.getVer();
                $.ajax({
                    url: urlTpl,
                    dataType: 'text',
                    type: 'GET',
                    async: true,
                    success: function (response) {
                        // создаём метод с загруженным шаблоном
                        component.template = function () {
                            return response;
                        }

                        callback(component);
                    }
                });
            } else {
                callback(component);
            }
        });
    }

    /**
     * Посчитать кол-во нод
     */
    this.__getCountNodes = function (nodes, count) {
        if (count === undefined) {
            count = 0;
        }
        for (let i in nodes) {
            count++;
            let node = nodes[i];
            count = this.__getCountNodes(node.child, count);
        }
        return count;
    }

    /**
     * Создать базовую часть компонента для каждой ноды
     */
    this.__createBaseComponentInTree = function (nodes, parent, callbackOneCreated) {
        for (let i in nodes) {
            let node = nodes[i];
            // создаём корневой компонент
            this.__createBaseComponentFromContext(node.context, parent, function (component) {
                node.component = component;

                // рекурсивно создаём компоненты потомков
                Self.__createBaseComponentInTree(node.child, parent, function (childComponent) {
                    // // добавляем в список ожидания инициализации в родительский компонент
                    // component.__checkSubCompInit.push(childComponent.context);
                    callbackOneCreated(childComponent);
                });

                // выполняем каждый раз при создании компонента
                callbackOneCreated(component);
            });
        }
    }

    /**
     * Получить очередь компонентов в обратном порядке начиная с последнего элемента
     * (обратный порядок нужен для инициализации, сначала вложенные компоненты, затем более верхние)
     */
    this.__getQueueComponents = function (nodes) {
        function recurAddToQueue (nodes, queue) {
            if (queue === undefined) {
                queue = [];
            }
            for (let i in nodes) {
                let node = nodes[i];
                queue.push(node.component);
                recurAddToQueue(node.child, queue);
            }
            return queue;
        }
        // строим последовательную очередь
        let queue = recurAddToQueue(nodes);
        // реверсим очередь
        return queue.reverse();
    }

    this.__initComponentAttributes = function (component) {
        let context = component.context;
        let attr = {};

        for (let i in context.baseElement.attributes) {
            let attribute = context.baseElement.attributes[i];
            if (attribute.nodeName) {
                attr[attribute.nodeName] = attribute.nodeValue;
            }
        }

        // удаляем служебные поля
        delete attr['id'];
        delete attr['name'];
        delete attr['component'];
        delete attr['param'];
        // delete attr['class'];
        component.attr = kolos.Utils.merge(component.attr, attr);
    }

    this.__initComponentParam = function (component) {
        let context = component.context;
       // парсим параметры из элемента из атрибута param, и задаём в параметры компонента
        let paramStr = $(context.baseElement).attr('param');
        if (paramStr !== undefined) {
            let paramPairList = paramStr.split(';');
            for (let i in paramPairList) {
                let paramPairStr = paramPairList[i];
                let iSplit = paramPairStr.indexOf(':');
                let keyParam = paramPairStr.substring(0, iSplit).trim();
                let valueParam = paramPairStr.substring(iSplit + 1, paramPairStr.length).trim();
                if (keyParam !== '') {
                    component.param[keyParam] = valueParam;
                }
            }
        }
    }

    function parseParamTag(text) {
        let result = [];
        let open = false;
        let key = '';
        for (let i = 0; i < text.length - 1; i++) {
            let char1 = text[i];
            let char2 = text[i + 1];
            if (char1 === '[' && char2 === '[') {
                open = true;
                i += 2;
                key = '';
            } else if (char1 === ']' && char2 === ']') {
                open = false;
                i += 2;
                result.push(key);
                key = '';
            }

            if (open) {
                key += text[i];
            }
        }
        return result;
    }

    //---------------------------------------------------------------------------------


    this.__buildQueueNode = function (nodes) {
        function recurAddToQueue (nodes, queue) {
            if (queue === undefined) {
                queue = [];
            }
            for (let i in nodes) {
                let node = nodes[i];
                queue.push(node);
                recurAddToQueue(node.child, queue);
            }
            return queue;
        }
        // строим последовательную очередь
        let queue = recurAddToQueue(nodes);
        // реверсим очередь
        return queue.reverse();
    }


    /**
     * Init component from dom element
     * @param {[Element]} elements
     * @param parent
     * @param {function} callback
     * @returns {kolos.ComponentContext}
     */
    this.initComponent = function(elements, parent, callback) {

        // 1) строим дерево элементов компонентов
        let rootNode = this.__buildTreeElementComponent(elements);

        // 2) строим контекст для каждой ноды
        this.__buildContextInTree(rootNode.child);




        // Делаем так, чтобы родительский компонент ждал загрузки
        // Добавляем в ожидание загрузки в родительски компонент
        if (parent !== undefined) {
            let queueNodes = Self.__buildQueueNode(rootNode.child);
            for (let i in queueNodes) {
                if (queueNodes[i] !== undefined) {
                    let nodeTmp = queueNodes[i];
                    // добавляем в список ожидания инициализации в родительский компонент
                    parent.__checkSubCompInit.push(nodeTmp.context);
                }
            }
        }





        // 3) выполняем предварительную загрузку компонентов
        this.__preloadComponentsInTree(rootNode.child);

        // 4) создаём базовую часть компонента каждой ноды
        // считаем кол-во нод
        let countNodes = this.__getCountNodes(rootNode.child);
        let countCreated = 0;
        this.__createBaseComponentInTree(rootNode.child, parent,  function (newComponent) {
            // считаем кол-во созданных компонентов
            countCreated++;

            // если все созданы, можно инициализировать
            if (countNodes === countCreated) {

                // пока сюда впиндюрим
                Self.__checkInitTree.push(rootNode);

                // 5) инициализируем все компоненты (очередь в обратно порядке)
                let components = Self.__getQueueComponents(rootNode.child);
                for (let i in components) {

                    let component = components[i];
                    let context = component.context;

                    kolos.Utils.debug('Init component: ' + component.context.name + ' (' + component.context.fullClassName + ')');

                    // 6) инициализируем атрибуты
                    Self.__initComponentAttributes(component);

                    // 7) инициализируем параметры
                    Self.__initComponentParam(component);



                    //------------

                    // Ниже хардкор... нужно привести в порядок....



                    let contentElements = $(component.context.baseElement).children();

                    // если элементов нет, то пробуем забрать текст
                    if (contentElements.length === 0) {
                        contentElements = $(component.context.baseElement).html();
                    }

                    let template = component.template();


                    // подготавливаем тег для вложенного контента
                    template = template.replaceAll('[[content]]', '<span id="__content"></span>');


                    // в шаблоне заменяем имя класса на вызов глобального объекта компонента
                    // (таким образов все вызовы будут принадлежать к своему экземпляру)
                    template = kolos.ComponentManager.replaceCallActions(template, component);


                    // достаём все теги в шаблоне формата [[tag]]
                    let paramTag = parseParamTag(template);
                    // заменяем все теги на параметры по ключу (пока таким костыльным способом, потом прикрутим шаблонизатор)
                    for (let i in paramTag) {
                        let keyParam = paramTag[i];
                        template = template.replaceAll(
                            '[[' + keyParam + ']]',
                            component.param[keyParam] !== undefined ? component.param[keyParam] : ''
                        );
                    }



                    let memory = $('<div></div>');

                    memory.append(template);


                    // 8) ищем все элементы с тегом id, и добавляем им префикс, а также делаем ссылку на них
                    let elementIdList = memory.find("[id]");
                    for (let i = 0; i < elementIdList.length; i++) {
                        let el = elementIdList[i];
                        let elTagId = $(el).attr('id');
                        // подменяем tagId
                        $(el).attr('id', context.tagId + '-' + elTagId);
                        // запоминаем элементы для быстрого обращения к ним (например: this.element.label1.innerHTML = 'text')
                        component.element[elTagId] = el;
                    }

                    // 9) достаём первый элемент компонента, он считается главнымs
                    // (считается что весь компонента заворачивается в один элемент, поэтому берём первый)
                    context.element = $(memory).find(":first-child")[0];
                    $(context.element).attr('id', context.tagId);
                    $(context.element).attr('cmp-name', context.name);


                    // 11) переносим атрибуты

                    // предварительно объединяем классы шаблона и класс в атрибутах
                    if (component.attr['class'] !== undefined) {
                        component.attr['class'] = $(context.element).attr('class') + ' ' + component.attr['class'];
                    }

                    for (let attrName in component.attr) {
                        $(context.element).attr(attrName, component.attr[attrName]);
                    }


                    //----


                    Self.initComponent(memory.children(), component, function (newSubComponent) {
                        // sub init
                    });

                    //---


                    let contentContainer = memory.find('#' + context.tagId + '-__content');

                    $(contentContainer).replaceWith(
                        contentElements
                    );


                    // // отрисовываем компонент, когда всё готово
                    // component.__ready.push(function () {
                    //     $(component.context.baseElement).replaceWith(
                    //         memory.children()
                    //     );
                    // });

                    $(component.context.baseElement).replaceWith(
                        memory.children()
                    );


                    // затем добавляем колбэк завершения инициализации менеджера
                    if (callback !== undefined) {
                        component.__ready.push(callback);
                    }



                    let strSubInit = "\n";
                    for (let f in component.__checkSubCompInit) {
                        /** @type {kolos.ComponentContext} */
                        let cntx = component.__checkSubCompInit[f];
                        strSubInit += cntx.name + ' (' + cntx.fullClassName + ') isInit=' + cntx.isInit + "\n";
                    }



                    context.isPrepared = true;

                    Self.__checkInitTreeComponents();


                    // // если нет компонентов в ожидание, то запускаем инициализацию
                    // if (kolos.Utils.isEmpty(component.__checkSubCompInit)) {
                    //
                    //
                    //     Self.__checkInitTreeComponents();
                    //
                    //
                    // }



                }

            }
        });


        //$(baseElement).html(str);

        return undefined;

        //-----------



        // let context = this.__buildContext(baseElement, parent);
        // // загружаем компонент
        // this.__loadAndInitComponent(context, callback);
        // // возвращаем предварительную информацию
        // return context;
    }


    this.__checkInitTree = [];

    this.__checkInitTreeComponents = function () {

        for (let i = Self.__checkInitTree.length - 1; i >= 0; i--) {

            let rootNode = Self.__checkInitTree[i];

            let queueNodes = Self.__buildQueueNode(rootNode.child);

            let allNodesInit = true;

            for (let i in queueNodes) {
                let node = queueNodes[i];

                let context = node.context;

                if (node.component !== undefined) {

                    let component = node.component;

                    // если компонент не подготовлен, то прерываем выполнение
                    // (дальше нет смысла, т.к. инициализация начинается с дочерних компонентов, должны сначала они подготовиться)
                    if (!context.isPrepared) {
                        allNodesInit = false;
                        break;
                    }

                    // проверяем что инициализированы вложенные компоненты (если они есть)
                    let allSubInit = true;
                    for (let j in component.__checkSubCompInit) {
                        /** @type {kolos.ComponentContext} subComponentContext */
                        let subComponentContext = component.__checkSubCompInit[j];
                        if (!subComponentContext.isInit) {
                            allSubInit = false;
                        }
                    }

                    // если все подчинённые компоненты инициализированы, то можем инициализировать текущий
                    if (allSubInit) {

                        if (!context.isInit) {
                            // отмечаем как инициализированный
                            context.isInit = true;

                            // очищаем список ожидания инициализации вложенных компонентов
                            component.__checkSubCompInit = [];

                            // выполняем все колбэки готовности
                            for (let k in component.__ready) {
                                // хак: присваиваем колбэк компоненту, чтобы внутри колбэка this это был сам компонент
                                component.__tmpCb = component.__ready[k];
                                component.__tmpCb(component);
                                delete component.__tmpCb;
                            }

                            kolos.Utils.debug('Component ready: ' + context.name + ' (' + context.fullClassName + ')');
                        }

                    } else {
                        allNodesInit = false;
                    }

                }


            } // for (let i in queueNodes)

            if (allNodesInit) {
                //delete Self.__checkInitTree[i];
                Self.__checkInitTree.splice(i, 1);
            }

        }


    }



    this.__buildContext = function (baseElement, parent) {
        // фильтруем идентификатор компонента
        let fullClassName = this.__filterNameSpace( $(baseElement).attr('component') );
        // ищем разделитель для класса и его пространство имён
        let splitIndex = fullClassName.lastIndexOf('.');
        // формируем информацию о компонент
        let context = new kolos.ComponentContext();
        context.parent = parent;
        context.baseElement = baseElement;
        context.fullClassName = fullClassName;
        context.namespace = fullClassName.substring(0, splitIndex);
        context.className = fullClassName.substring(splitIndex + 1);
        context.name = $(baseElement).attr('name');
        // если имя компонента не задано, то берём его из класса
        if (context.name === undefined || context.name === '') {
            context.name = kolos.Utils.firstLow(context.className);
        }
        context.path = this.__buildPathComponent(context);
        return context;
    }

    /**
     * @param {kolos.ComponentContext} context
     * @returns {*}
     * @private
     */
    this.__getComponentClass = function(context) {
        let fullClassName = context.fullClassName;
        if (this.__cacheClass[fullClassName] === undefined) {
            // материализуем класс и засовываем кэш
            this.__cacheClass[fullClassName] = eval(Self.__filterNameSpace(fullClassName));
        }
        return this.__cacheClass[fullClassName];
    }


    /**
     * @param tagId
     * @param parent
     * @param callback
     */
    this.initComponentsFromTag = function(tagId, parent, callback) {
        Self.initComponent($(tagId).children(), parent, callback);

    }

    /**
     * Инициализировать все компоненты на странице
     */
    this.initComponentsOnPage = function() {
        this.initComponentsFromTag('body');
    }

    /**
     * @deprecated пока ещё думаю как изящно это сделать
     * @param componentDescription
     * @param tagId
     * @param parent
     * @param callback
     */
    this.initComponentTo = function (componentDescription, tagId, parent, callback) {
        let element = $(componentDescription);
        $(tagId).html(element);
        Self.initComponent(element, parent, callback);
    }


    this.__construct = function () {
        // // дежурный таймер, на случай если не всё проинициализируется
        // this.__timerCheckInitComponent = setInterval(() => {
        //     Self.__checkInitComponentsAll();
        // }, 1000);
    }
    this.__construct();
};

/**
 * Заменить вызовы действий класса на вызов действий экземпляра
 * @param template
 * @param component
 * @returns {string}
 */
kolos.ComponentManager.replaceCallActions = function (template, component) {
    // в шаблоне заменяем имя класса на вызов глобального объекта компонента
    // (таким образов все вызовы будут принадлежать к своему экземпляру)
    return template.replaceAll(
        component.context.fullClassName,
        'kolos.Global.get(' + component.context.globalId + ')'
    );
}

