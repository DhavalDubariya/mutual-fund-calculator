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

module.exports = {
    calculateSIPPerformanceModule: calculateSIPPerformanceModule
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
