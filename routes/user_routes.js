var path = require('path');
const apifunc = require('../configure/api.js');
const queue = require('../configure/queue.js')

module.exports = function (app) {
    //api function calls
    app.get('/api', function (req, res) {
        var comm = req.query.command;
        var data = req.query.data;
        rep = apifunc(comm, data);
        queue.setActive();
        res.send(rep);
    })

    //Queue calls
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
