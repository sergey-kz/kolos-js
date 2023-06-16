//работа с таймаутами
kolos.Date = {
    setTimeout: function (val) {
        return Date.now() + val;
    },
    checkTimeout: function (variable) {
        return variable < Date.now();
    },
    getTimeoutLeft: function (variable) {
        var left = variable - Date.now();
        return left > 0 ? left : 0;
    },
    now: function () {
        return Date.now(); //UTC
    },
    toSqlFormatUTC(datetime) {
        // если число
        if (!isNaN(datetime)) {
            datetime = new Date(datetime);
        }
        return datetime.toISOString().slice(0, 19).replace('T', ' ');
    },
    toSqlFormat(datetime) {
        // если число
        if (!isNaN(datetime)) {
            datetime = new Date(datetime);
        }
        //форматируем в текущем часовом поясе бразузера
        return datetime.getFullYear() + '-' +
            ('00' + (datetime.getMonth() + 1)).slice(-2) + '-' +
            ('00' + datetime.getDate()).slice(-2) + ' ' +
            ('00' + datetime.getHours()).slice(-2) + ':' +
            ('00' + datetime.getMinutes()).slice(-2) + ':' +
            ('00' + datetime.getSeconds()).slice(-2);

    },
    toDatetime(str) {
        return Date.parse(str);
    },
};