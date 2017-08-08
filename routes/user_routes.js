var path = require('path');
const apifunc = require('../configure/api.js');
const queue = require('../configure/queue.js')

module.exports = function (app) {
    /**
     * html files
     */
    app.get('/', function (req, res) {
        console.log("get request to homepage\n");
        res.sendFile('gui.html', {root: './public'});
    });

    app.get('/loadprogram', function(req, res) {
    	res.sendFile('loadprogram.html', {root: './public'});
    });

    app.get('/runInstruction', function(req, res) {
        res.sendFile('runInstruction.html', {root: './public'});
    });

    app.get('/loadassembly', function(req, res) {
        res.sendFile('loadassembly.html', {root: './public'});
    });

    /**
     * js files
     */

    app.get('/resources/scripts.js', function(req, res) {
        res.sendFile('resources/scripts.js', {root: './public'});
    });

    app.get('/resources/loadProgramScript.js', function(req, res) {
        res.sendFile('resources/loadProgramScript.js', {root: './public'});
    });

    app.get('/resources/loadassemblyScript.js', function(req, res) {
        res.sendFile('resources/loadassemblyScript.js', {root: './public'});
    });

    app.get('/resources/styles.css', function(req, res) {
        res.sendFile('resources/styles.css', {root: './public'});
    });

    app.get('/resources/bootstrap.min.css', function(req, res) {
        res.sendFile('resources/bootstrap.min.css', {root: './public'});
    });

    app.get('/resources/bootstrap.min.js', function(req, res) {
        res.sendFile('resources/bootstrap.min.js', {root: './public'});
    });

    app.get('/resources/jquery.js', function(req, res) {
        res.sendFile('resources/jquery.js', {root: './public'});
    });

    app.get('resources/cookies.js', function(req, res) {
        res.sendFile('resources/cookies.js', { root: './public' });
    });

    //pdf
    app.get('/assemblySpec.pdf', function(req, res) {
        res.sendFile('assemblySpec.pdf', {root: './public'});
    });



    //api function calls
    app.get('/api', function (req, res) {
        var comm = req.query.command;
        var data = req.query.data;
        rep = apifunc(comm, data);
        res.send(rep);
    })


    app.get('/nextqueuenum', function(req, res) {
        var nextNum = queue.getNextUserNum()
        res.send(nextNum.toString());
    });

    app.get('/placeinqueue', function(req, res) {
        var queuePos = queue.checkUserInQueue(req.query.userNum);
        res.send(queuePos.toString());
    });

    app.get('/leavequeue', function(req, res) {
        var userNum = req.query.userNum;
        var toBack = req.query.toBack;
        console.log(userNum);
        queue.remover(userNum, toBack);
        res.send("Removed");
    });
};
