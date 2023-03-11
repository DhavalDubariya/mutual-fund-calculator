const express = require("express")
const router = express.Router()
const request = require("request")
const constant = require("./constant")

const formateDateLib = async (date) => {
    const now = new Date(date)
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    const formatedDate = now.toLocaleDateString("en-IN", options).split("/").join("-")

    return formatedDate
}

const getRandomString = async (len) => {
    if (len == undefined) {
        return ""
    }

    var result = ""
    var characters = "ABCDEFGHIJKfLMNOPQrerfhRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

const getResponseURL = async (options) => {
    try {
        var response = await new Promise(function (resolve, reject) {
            // console.log("entry 1")
            request.get(options, (error, result) => {
                // console.log("entry 2")
                if (error) throw new Error(error)

                var data = result.body
                // console.log("exit")
                resolve(data)
            })
        })

        // if (response.data.length == 0) {
        //     return {
        //         status: false,
        //         error: constant.inValidAuthentication
        //     }
        // }
        console.log(response);

        return {
            status: true,
            data: response
        }
    } catch (error) {
        return {
            status: false,
            error: error
        }
    }
}

module.exports = {
    formateDateLib: formateDateLib,
    getRandomString: getRandomString,
    getResponseURL: getResponseURL
}

async function isHTML(str) {
    // console.log("entry 3")
    var htmlRegex = /<\/?[a-z][^>]*>/i
    str = str.substring(0, 1000)
    return htmlRegex.test(str)
}
