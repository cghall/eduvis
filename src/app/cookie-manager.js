define(['underscore'], function(_) {

    var cookieWritable = false;

    function enableCookieWriting(on) {
        cookieWritable = on;
    }

    function bakeCookie(name, value) {
        if (cookieWritable) {
            value = _.pick(value, _.identity);
            document.cookie = [name, '=', JSON.stringify(value) + ';'].join('');
            console.log(readCookie('graph'));
        }
    }

    function readCookie(name) {
        var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        result && (result = JSON.parse(result[1]));
        return result || {};
    }

    function extendCookie(name, extension) {
        var cookie = readCookie(name) || {};
        bakeCookie(name, _.extend(cookie, extension));
    }

    return {
        bakeCookie: bakeCookie,
        readCookie: readCookie,
        extendCookie: extendCookie,
        enableCookieWriting: enableCookieWriting
    };

});
