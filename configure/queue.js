var jsdom = require('node-jsdom');
var window = jsdom.jsdom().parentWindow;
var Cookies = require('cookies-js')(window);

var queue = []


exports.getUserNum = function() {
    return (Cookies.get('BIGHEX'));
}

exports.setUserNum = function() {
    var dateTime = new Date();
    console.log(dateTime);
    d2 = dateTime+1;
    console.log(d2);
    Cookies.set('BIGHEX', dateTime);
    queue.push(dateTime);
};

exports.getAllCurrentUsers = function() {
    return queue;
}


//update queue
//
