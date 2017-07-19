/**
 * Created by ndoorly on 19/07/17.
 */

const configureExpress = require("./configure/express");

const app = configureExpress();

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});