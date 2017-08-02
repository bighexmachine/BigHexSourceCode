
var queue = [];
var nextUserNum = 0;
var innactive = true;

function addToQueue(number) {
    queue.push(number);
}

//Time user out after ertain number of seconds if innactive
function timeOutUser() {
    setTimeout( function() {
        if(innactive) {
            removeFromQueueFront(false)
        }
        innactive = true;
        timeOutUser();
    }, 3000000);//Timeout at 5 mins
}

//Remoe user from front of queue. Put them at back is flag is true
function removeFromQueueFront(moveToBack) {
    if(moveToBack) {
        var temp = queue[0];
        addToQueue(temp);
    }
    queue.shift();
    console.log("Current queue " + queue);
}


//Get the next available user number and add to queue
exports.getNextUserNum = function() {
    nextUserNum++;
    addToQueue(nextUserNum)
    return nextUserNum;
}

//Checks user is in queue, if not then is added
exports.checkUserInQueue = function(number) {
    var pos = queue.indexOf(number);
    console.log(pos);
    if(pos === -1) {
        addToQueue(number);
        //Will print user in pos -1 for first position.
        console.log("Added user to queue. User number: " + number + "\nin position: " + pos);
        console.log("Current queue: " + queue);
        return queue.length-1;
    }
    console.log("Current queue: " + queue);

    //TODO Make sure server never hands out same number when restarted
    if(number > nextUserNum) {
        nextUserNum = number+1;
    }
    return pos
}

timeOutUser();
