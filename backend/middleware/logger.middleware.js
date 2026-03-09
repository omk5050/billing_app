const morgan = require('morgan');

/*
-----------------------------------------
HTTP REQUEST LOGGER
-----------------------------------------
Logs method, URL, status, response time
-----------------------------------------
*/

const logger = morgan(
':method :url :status :res[content-length] - :response-time ms'
);

module.exports = logger;