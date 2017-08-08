function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var userNum = getCookie("BIG_HEX");
    if (userNum != "") {
        console.log("Cookie user num " + userNum);
        checkPlaceInQueue(userNum);
    } else {
        getNextUserNum(function(userNum) {
            console.log("New user num " + userNum);
            setCookie("BIG_HEX", userNum, 1);
        });
    }
    //setCookie("BIG_HEX",1,-1);
}

//Get next available user number and add to queue
function getNextUserNum(callback) {
    var num = 0;
    $.ajax({
        type: 'GET',
        url: '/nextqueuenum',
        success: function(data){
            //Create jQuery object from the response HTML.
            var $response=$(data);
            //Query the jQuery object for the values
            num= $response.selector;
            console.log("number from server " + num);
            callback(num);
        }
    });
}

//Check place of user in the queue and add if not already
function checkPlaceInQueue(num) {
    $.ajax({
        type: 'GET',
        url: '/placeinqueue',
        data: {'userNum': num},
        success: function(data){
            //Create jQuery object from the response HTML.
            var $response=$(data);
            //Query the jQuery object for the values
            num = $response.selector;
            console.log("Your place in queue " + num);
            updateQueueUI(num);
        }
    });
}


//Copied from cookie.js, needs to be refactored at some point
function checkPlaceAndRunFunc(num, callbackFunc) {
    $.ajax({
        type: 'GET',
        url: '/placeinqueue',
        data: {'userNum': num},
        success: function(data){
            var $response=$(data);
            num = $response.selector;
            console.log("Your place in queue " + num);
            if(num == '0') {
                callbackFunc();
            }
            else {
                //Move to top of page and flash queue
            }
        }
    });
}

function askServerForAccessToAPI(callbackFunc) {
    var userNum = getCookie("BIG_HEX");
    checkPlaceAndRunFunc(userNum, callbackFunc);
}

checkCookie()
