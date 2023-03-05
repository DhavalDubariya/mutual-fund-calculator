const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")
const { differenceInMonths } = require("date-fns")
const constant = require("../../../helpers/constant")
const LibFunction = require("../../../helpers/libfunction")

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

    const totalAmountInvested = differenceInMonths(new Date(SIPEndDate), new Date(SIPStartDate)) * SIPAmount
    const schemeCodeData = await LibFunction.getResponseURL(schemeCode)
    return {
        totalAmountInvested: totalAmountInvested,
        schemeCodeData: schemeCodeData
    }
}

module.exports = {
    calculateSIPPerformanceModule: calculateSIPPerformanceModule
}
