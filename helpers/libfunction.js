const express = require("express")
const router = express.Router()
const request = require("request")

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

const getResponseURL = async (schemeCode) => {
    try {
        const options = {
            url: schemeCode ? `${process.env.MUTUAL_FUNDS_URL}/${schemeCode}` : process.env.MUTUAL_FUNDS_URL,
            headers: {
                "Content-Type": "application/json"
            }
        }

        var response = await new Promise(function (resolve, reject) {
            request.get(options, (error, result) => {
                if (error) throw new Error(error)
                var data = JSON.parse(result.body)
                // console.log("result: ", data)
                resolve(data)
            })
        })
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
