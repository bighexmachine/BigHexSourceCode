var path = require('path');
const apifunc = require('../configure/api.js');
var jsdom = require('node-jsdom');
var window = jsdom.jsdom().parentWindow;
var Cookies = require('cookies-js')(window);

module.exports = function (app) {
    var x =0;
    /**
     * html files
     */

    app.get('/', function (req, res) {
        console.log("get request to homepage\n");
        if(x === 0) {
            Cookies.set('ND', 5, /*{expires: }*/);
            x=1;
        }
        else {
            console.log(Cookies.get('ND'));
        }
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

    app.get('/returnAndRun', function (req, res) {
        console.log("get request to return and run");
        apifunc('start', undefined);
        res.redirect('/');
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
};



function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
    console.log("cookiefound " + ca);
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
