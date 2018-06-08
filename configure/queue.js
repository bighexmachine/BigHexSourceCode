
var queue = [];
var nextUserNum = 0;
var innactive = true;

exports.setActive = function() {
    innactive = false;
}

exports.length = function() { return queue.length; }

exports.addToQueue = function(number) {
    if(queue.indexOf(number) === -1) {
        queue.push(number);
        console.log("New queue: " + queue);
    }
    else{
        console.log(number + " Already in queue");
    }
}

exports.getFrontOfQueue = function() {
    return queue[0];
}

exports.getQueuePositionOfIP = function(ip) {
    return queue.indexOf(ip);
}

exports.removeFromQueue = function(userIP) {
    console.log("User num given: " + userIP);
    var position = queue.indexOf(userIP);
    if(position !== -1) {
        queue.splice(position, 1);
    }
    console.log("Current queue " + queue);
}


//Time user out after ertain number of seconds if innactive
function timeOutUser() {
    setTimeout( function() {
        if(innactive) {
            exports.removeFromQueue(queue[0] ,false)
        }
        innactive = true;
        timeOutUser();
    }, 1500000);//Timeout at 2 1/2 mins
}


timeOutUser();
