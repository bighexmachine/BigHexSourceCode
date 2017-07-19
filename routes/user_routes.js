/**
 * Created by ndoorly on 02/07/17.
 */

var path = require('path');

module.exports = function (app) {
    app.get('/', function (req, res) {
        console.log("get request to homepage");
        res.sendFile('gui.html', {root: './public'});
    });


    app.get('/loadprogram', function(req, res) {
    	res.sendFile('loadprogram.html', {root: './public'});
    });

app.get('/runInstruction', function(req, res) {
    res.sendFile(path.join(__dirname, 'runInstruction.html'));
});

app.get('/loadassembly', function(req, res) {
    res.sendFile(path.join(__dirname, 'loadassembly.html'));
});

app.get('/resources/scripts.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/scripts.js'));
});

app.get('/resources/loadProgramScript.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/loadProgramScript.js'));
});

app.get('/resources/loadassemblyScript.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/loadassemblyScript.js'));
});

app.get('/resources/styles.css', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/styles.css'));
});

app.get('/resources/bootstrap.min.css', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/bootstrap.min.css'));
});

app.get('/resources/bootstrap.min.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/bootstrap.min.js'));
});

app.get('/resources/jquery.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'resources/jquery.js'));
});

app.get('/assemblySpec.pdf', function(req, res) {
    res.sendFile(path.join(__dirname, 'assemblySpec.pdf'));
});

var lastCommand = "";


};
