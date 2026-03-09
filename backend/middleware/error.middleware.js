const errorHandler = (err, req, res, next) => {

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    // Mongoose invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400
        message = "Invalid resource ID"
    }

    // Mongo duplicate key error
    if (err.code === 11000) {
        statusCode = 400
        message = "Duplicate field value entered"
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    })

}

module.exports = errorHandler