
var queue = [];
var nextUserNum = 0;
var innactive = true;

exports.setActive = function() {
    innactive = false;
}

function getHighestUserNum() {
    //TODO
}

function addToQueue(number) {
    queue.push(number);
    console.log("New queue: " + queue);
}

//Time user out after ertain number of seconds if innactive
function timeOutUser() {
    setTimeout( function() {
        if(innactive) {
            removeFromQueue(queue[0] ,false)
        }
        innactive = true;
        timeOutUser();
    }, 1500000);//Timeout at 2 1/2 mins
}

//Remoe user from front of queue. Put them at back is flag is true
function removeFromQueue(userNum, moveToBack) {
    console.log("User num given: " + userNum);
    var position = queue.indexOf(userNum);
    if(position !== -1) {
        queue.splice(position, 1);
        if(moveToBack) {
            addToQueue(userNum);
        }
    }
    console.log("Current queue " + queue);
}


//Get the next available user number and add to queue
exports.getNextUserNum = function() {
    nextUserNum = nextUserNum + 1;
    addToQueue(nextUserNum);
    console.log("next number to give: " + nextUserNum);
    return nextUserNum;
}

//Checks user is in queue, if not then is added
exports.checkUserInQueue = function(number) {
    console.log("number provided = " + number + " " + typeof number );
    var pos = queue.indexOf(parseInt(number));
    console.log("pos = " + pos);
    if(pos === -1) {
        console.log("in pos section with pos = " + pos);
        addToQueue(number);
        //Will print user in pos -1 for first position.
        console.log("Added user to queue. User number: " + number + "\nin position: " + pos);
        console.log("Current queue: " + queue);
        //TODO Make sure server never hands out same number when restarted
        nextUserNum = nextUserNum + 1;
        return queue.length-1;
    }
    console.log("Current queue: " + queue);
    return pos;
}

exports.remover = function(userNum, moveToBack) {
    removeFromQueue(userNum, moveToBack);
}

timeOutUser();
