/**
 * Created by ndoorly on 02/07/17.
 */

var path = require('path');

module.exports = function (app) {
    app.get('/', function (req, res) {
        console.log("get request to homepage");
        res.sendFile('gui.html', {root: './public'});
    });
};
