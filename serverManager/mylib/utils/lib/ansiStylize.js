/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-8-19
 * Time: 下午2:17
 * To change this template use File | Settings | File Templates.
 */

// Stylize a string
function stylize(str, style) {
    var styles = {
        'bold'      : [1,  22],
        'italic'    : [3,  23],
        'underline' : [4,  24],
        'cyan'      : [96, 39],
        'blue'      : [34, 39],
        'yellow'    : [33, 39],
        'green'     : [32, 39],
        'red'       : [31, 39],
        'grey'      : [90, 39],
        'green-hi'  : [92, 32],
    };
    return '\033[' + styles[style][0] + 'm' + str +
        '\033[' + styles[style][1] + 'm';
}

function $(str) {
    str = new(String)(str);
    ['bold', 'grey', 'yellow', 'red', 'green', 'cyan', 'blue', 'italic', 'underline'].forEach(function (style) {
        Object.defineProperty(str, style, {
            get: function () {
                return $(stylize(this, style));
            }
        });
    });
    return str;
}

module.exports.$ = $;