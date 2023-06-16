kolos.Html = {
    getParent: function (element) {
        return $(element).parent()[0];
    },

    getFirstChildren: function (tag) {
        let elements = [];
        // получаем список контейнеров
        let firstChild = $(tag).find(":first-child")[0];
        if (firstChild !== undefined) {
            elements.push(firstChild);
            let otherElements = $(firstChild).siblings();
            for (let i = 0; i < otherElements.length; i++) {
                elements.push(otherElements[i]);
            }
        }
        return elements;
    }
};