const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")

const getMutualFundsListModule = async () => {
    try {
        const mutualFundCompanyListURL = "https://api.mfapi.in/mf"

        const options = {
            url: mutualFundCompanyListURL,
            headers: {
                "Content-Type": "application/json"
            }
        }

        var response = await new Promise(function (resolve, reject) {
            request.get(options, (error, result) => {
                if (error) throw new Error(error)
                console.log("result: ", result)
                var data = JSON.parse(result.body)
                if (data.errorCode) {
                    console.log(url, webhookDefinition, result.body)
                    console.log(data.errorCode)
                }
                resolve(data)
            })
        })

        var result = []
        for (let i = 0; i < response.length; i++) {
            var data = {
                "schemeCode": response[i].schemeCode,
                "schemeName": response[i].schemeName
            }
            result.push(data)
        }

        return {
            status: true,
            data: result
        }
    } catch (error) {
        return {
            status: false,
            error: error
        }
    }
}

module.exports = {
    getMutualFundsListModule: getMutualFundsListModule
}
