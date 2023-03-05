const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")
const { differenceInMonths } = require("date-fns")
const moment = require("moment")
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

    SIPStartDate = new Date(SIPStartDate)
    SIPEndDate = new Date(SIPEndDate)
    valuationDate = new Date(valuationDate)

    const totalAmountInvested = (differenceInMonths(new Date(SIPEndDate), new Date(SIPStartDate)) + 1) * SIPAmount
    const getSchemeCodeData = await LibFunction.getResponseURL(schemeCode)
    if (!getSchemeCodeData.status) {
        return getSchemeCodeData
    }

    console.log(getSchemeCodeData)

    const skipDay = 1
    const schemeCodeData = getSchemeCodeData.data

    var formatedDate = await LibFunction.formateDateLib(SIPStartDate)
    var SIPStartDateNavData = []
    SIPStartDateNavData = await filterData(SIPStartDateNavData, schemeCodeData, formatedDate, skipDay, SIPStartDate, true)
    StartDateNav = SIPStartDateNavData.nav

    var formatedValuationDate = await LibFunction.formateDateLib(valuationDate)
    var SIPValuationDateNavData = []
    var SIPValuationDateNavData = filterData(SIPValuationDateNavData, schemeCodeData, formatedValuationDate, skipDay, valuationDate, false)

    const totalUnitsAccumulated = totalAmountInvested / StartDateNav
    const currentValue = totalUnitsAccumulated * valuationDateNav

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

async function filterData(SIPStartDateNavData, schemeCodeData, formatedDate, skipDay, searchDate, flag) {
    SIPStartDateNavData = schemeCodeData.data.filter((obj) => obj.date == formatedDate)
    if (SIPStartDateNavData.length == 0) {
        if (flag) {
            formatedDate = await LibFunction.formateDateLib(new Date(searchDate).setDate(new Date(searchDate).getDate() + skipDay))
            skipDay++
        } else {
            if (new Date().getDate() == new Date(searchDate).getDate() && new Date().getMonth() == new Date(searchDate).getMonth() && new Date().getFullYear() == new Date(searchDate).getFullYear()) {
                formatedDate = await LibFunction.formateDateLib(new Date(searchDate).setDate(new Date(searchDate).getDate() - skipDay))
                skipDay++
            } else if (new Date() > new Date(searchDate)) {
            }
        }
        SIPStartDateNavData = filterData(SIPStartDateNavData, schemeCodeData, formatedDate, skipDay, searchDate, flag)
    }

    return SIPStartDateNavData
}
