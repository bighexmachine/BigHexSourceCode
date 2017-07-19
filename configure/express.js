/**
 * Created by ndoorly on 02/07/17.
 */


module.exports = function () {
    const express = require('express');
    const app = express();
    app.use(express.static('public'));

    require('../routes/user_routes.js')(app);
    return app;
};



