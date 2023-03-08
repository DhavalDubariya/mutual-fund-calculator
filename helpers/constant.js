module.exports.notFound = {
    status: false,
    statusCode: 404,
    error: "Path Not Found."
}

module.exports.inValidAuthentication = {
    statusCode: -999,
    message: "Error! Invalid authentication found."
}

module.exports.requestMessages = {
    ERR_GENERAL: {
        code: 9000,
        message: "Something went wrong with the server."
    },
    ERR_INVALID_BODY: {
        code: 9001,
        message: "Invalid body. Please fill all required fields."
    },
    ERR_DATE_OUT_OF_BOUND: {
        code: 9002,
        message: "Error! The fund you have selected has no related data with the dates you have selected."
    }
}
