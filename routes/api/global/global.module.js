const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")
const libfunction = require("../../../helpers/libfunction")

const getMutualFundsListModule = async () => {
    try {
        const getSchemeData = await libfunction.getResponseURL()
        if (!getSchemeData.status) {
            return getSchemeData
        }

        var result = []
        for (let i = 0; i < getSchemeData.data.length; i++) {
            // const schemeDataURL = `https://api.mfapi.in/mf/${response1[i].schemeCode}`

            // const payload = {
            //     url: schemeDataURL,
            //     headers: {
            //         "Content-Type": "application/json"
            //     }
            // }

            // var response2 = await new Promise(function (resolve, reject) {
            //     request.get(payload, (error, result) => {
            //         if (error) throw new Error(error)
            //         console.log("result: ", result)
            //         var data = JSON.parse(result.body)
            //         if (data.errorCode) {
            //             console.log(url, result.body)
            //             console.log(data.errorCode)
            //         }
            //         resolve(data)
            //     })
            // })

            // const fundHouseName = response2.meta.fund_house

            // var findSchemeName = schemeNameData.filter((obj) => obj.fund_house == fundHouseName)
            // if (findSchemeName.length > 0) {
            //     const index = schemeNameData.findIndex((obj) => obj.fund_house === fundHouseName)
            //     schemeNameData[i].scheme_codes.push(response1[i].schemeCode)
            // } else {
            //     var data = {
            //         fund_house: fundHouseName,
            //         scheme_codes: [response2[i].schemeCode]
            //     }
            //     schemeNameData.push(data)
            // }

            var data = {
                "schemeCode": getSchemeData.data[i].schemeCode,
                "schemeName": getSchemeData.data[i].schemeName
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
