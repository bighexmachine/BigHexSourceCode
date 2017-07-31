/**
 * Created by ndoorly on 19/07/17.
 */

const configureExpress = require("./configure/express");

//Import useful libraries, use npm to install express, i2c-bus etc.
var http = require('http');
var url = require('url');
var express = require('express');
var path = require('path');
var fs = require("fs");
var gpioService = require('./gpioConfig/gpioService.js');


const app = configureExpress();
gpioService.setSpeed(1);




app.listen(3000, function () {
    console.log('Example app listening on port 3000')
});
