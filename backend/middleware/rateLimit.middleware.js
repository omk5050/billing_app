const rateLimit = require('express-rate-limit');

/*
-----------------------------------------
GENERAL API RATE LIMIT
-----------------------------------------
100 requests per 15 minutes per IP
-----------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});


/*
-----------------------------------------
STRICT LOGIN LIMIT
-----------------------------------------
5 login attempts per 15 minutes
-----------------------------------------
*/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});


module.exports = {
  apiLimiter,
  authLimiter
};