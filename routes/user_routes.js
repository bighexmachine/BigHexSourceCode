var path = require('path');
const api = require('../configure/api.js');
const queue = require('../configure/queue.js')

module.exports = function (app) {
    //api function calls
    app.get('/api', function (req, res) {
        let comm = req.query.command;
        let data = req.query.data;
        let ip = req.ip.split(':')[3];

        if(queue.getFrontOfQueue() == ip)
        {
          queue.setActive();
        }

        if(queue.getFrontOfQueue() == ip || !api.isCommandRestricted(comm))
        {
          api.execute(comm, data).then((rep) => {
            res.send(rep);
          }).catch((err) => {
            res.status(500);
            res.json(err);
          });
        }
        else
        {
          res.status(401);
          res.json({message:"You must be at the front of the queue to execute this command"});
        }
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
