function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    console.log("new cookie set");
}

function getCookie(cname, callback) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            callback(c.substring(name.length, c.length));
            return;
        }
    }
    console.log("return nothing");
    callback("");
    return;
}

function checkCookie() {
    getCookie("BIG_HEX", function(res) {
        if (res != "") {
            console.log("Cookie user num " + res);
            checkPlaceInQueue(res);
        } else {
            getNextUserNum(function(res) {
                console.log("New user num " + res);
                setCookie("BIG_HEX", res, 1);
            });
        }
    });
}

//Get next available user number
function getNextUserNum(callback) {
    var num = 0;
    $.ajax({
        type: 'GET',
        url: '/nextqueuenum',
        success: function(data){
            //Create jQuery object from the response HTML.
            var $response=$(data);
            //Query the jQuery object for the values
            num = $response.selector;
            console.log("number from server " + num);
            callback(num);
        }
    });
}

//Check place of user in the queue and add if not already.
//updates queue ui
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
            console.log("1Your place in queue " + num);
            updateQueueUI(num);
        }
    });
}


//Copied. needs to be refactored at some point
function checkPlaceAndRunFunc(num, callbackFunc) {
    $.ajax({
        type: 'GET',
        url: '/placeinqueue',
        data: {'userNum': num},
        success: function(data){
            var $response=$(data);
            num = $response.selector;
            console.log("2Your place in queue " + num);
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
    getCookie("BIG_HEX", function(res) {
        if(res !== "") {
            console.log("get coookie user num = " + res);
            checkPlaceInQueue(res);
            checkPlaceAndRunFunc(res, callbackFunc);
            return;
        }
        else {
            console.log("we send nothing");
            getNextUserNum(function(res) {
                console.log("New user num " + res);
                setCookie("BIG_HEX", res, 1);
            });
            return;
        }
    });

}
