const express = require("express")
const router = express.Router()
const request = require("request")

const formateDateLib = async (date) => {
    date = date.toLocaleDateString("en-GB")
    var d = new Date(date),
        month = 1 + d.getMonth() < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1,
        day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate(),
        year = d.getFullYear()
    // hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours(),
    // minute = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
    // second = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()

    var str = [day, month, year].join("-")
    var formatedDate = str // `${str} ${hour}:${minute}:${second}`
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
                console.log("result: ", data)
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
