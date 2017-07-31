var jsdom = require('node-jsdom');
var window = jsdom.jsdom().parentWindow;
var Cookies = require('cookies-js')(window);


function getUserNum() {
    return Cookies.get('BIGHEX');
}

function setUserNum() {
    var dateTime = new Date(month, day, hours, minutes, seconds)
    console.log(dateTime);
    console.log(dateTime+1);
    Cookies.set('BIGHEX', dateTime);
}


module.exports = setUserNum();
