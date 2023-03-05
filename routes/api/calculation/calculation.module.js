const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")
const LibFunction = require("../../../helpers/libfunction")
const constant = require("../../../helpers/constant")

const calculateSIPPerformanceModule = async (req) => {
    const schemeCode = req.body.scheme_code
    const SIPAmount = req.body.sip_amount
    var SIPStartDate = req.body.sip_start_date
    var SIPEndDate = req.body.sip_end_date
    var valuationDate = req.body.valuation_date

    if (!schemeCode || !SIPAmount || !SIPStartDate || !SIPEndDate || !valuationDate) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    SIPStartDate = !Number(SIPStartDate) ? SIPStartDate.toString() : Number(SIPStartDate)
    SIPEndDate = !Number(SIPEndDate) ? SIPEndDate.toString() : Number(SIPEndDate)
    valuationDate = !Number(valuationDate) ? valuationDate.toString() : Number(valuationDate)

    const formatedStartDate = await LibFunction.formatDateToIST(new Date(SIPStartDate))
    const formatedEndDate = await LibFunction.formatDateToIST(new Date(SIPEndDate))
    const formatedValuationDate = await LibFunction.formatDateToIST(new Date(valuationDate))

    const totalAmountInvested = differenceInMonths(new Date(SIPEndDate), new Date(SIPStartDate)) * SIPAmount
    const getSchemeCodeData = await LibFunction.getResponseURL(schemeCode)
    if (!getSchemeCodeData.status) {
        return getSchemeCodeData
    }

    const schemeCodeData = getSchemeCodeData.data
    // console.log([formatedStartDate, formatedEndDate, formatedValuationDate], new Date(new Date(SIPStartDate).setDate(new Date(SIPStartDate).getDate() + 1)))

    var SIPStartDateNavData = schemeCodeData.data.filter((obj) => obj.date == formatedStartDate)
    if (SIPStartDateNavData.length == 0) {
        console.log("if")
        var date1 = await LibFunction.formateDateLib(new Date(SIPStartDate))
        date1 = await LibFunction.formatDateToIST(new Date(new Date(date1).setDate(new Date(date1).getDate() + 1)))

        SIPStartDateNavData = schemeCodeData.data.filter((obj) => obj.date == findDate)
    }

    return {
        totalAmountInvested: totalAmountInvested,
        SIPStartDateNavData: SIPStartDateNavData
    }
}

const calculateSpiModule = async (req) => {
    var monthlySipAmount = req.body.monthly_sip_amount
    var expectedReturn = req.body.expected_return
    var timePeriod = req.body.time_period

    if (monthlySipAmount == undefined || monthlySipAmount == "" || monthlySipAmount == null || expectedReturn == undefined || expectedReturn == null || expectedReturn == "" || timePeriod == undefined || timePeriod == "" || timePeriod == null) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    async function calculateSIP(monthlyInvestment, expectedReturn, timePeriod, inflationRate) {
        var exp = expectedReturn / 100
        var n = timePeriod * 12
        var i = exp / 12
        var oneI = 1 + i
        var onePower = Math.pow(oneI, n)
        var onePowerSubtrect = onePower - 1
        var middle = onePowerSubtrect / i
        // var M = P * ({[1 + i]n - 1} / i) * (1 + i)
        var total_value = Math.round(monthlyInvestment * middle * oneI)
        var total_investment = monthlyInvestment * n
        var returns = total_value - total_investment
        return {
            total_value,
            returns,
            total_investment
        }
    }

    const result = calculateSIP(monthlySipAmount, expectedReturn, timePeriod)
    return result
}

module.exports = {
    calculateSIPPerformanceModule: calculateSIPPerformanceModule,
    calculateSpiModule: calculateSpiModule
}
