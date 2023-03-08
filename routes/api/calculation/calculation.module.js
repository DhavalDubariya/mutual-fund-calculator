const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")
const { differenceInMonths } = require("date-fns")
const moment = require("moment")
const LibFunction = require("../../../helpers/libfunction")
const constant = require("../../../helpers/constant")

const calculateSIPPerformanceModule_COPY = async (req) => {
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

    const monthDiff = differenceInMonths(new Date(SIPEndDate), new Date(SIPStartDate)) + 1
    const totalAmountInvested = monthDiff * Number(SIPAmount)
    var finalTable = []
    const getSchemeCodeData = await LibFunction.getResponseURL(schemeCode)
    if (!getSchemeCodeData.status) {
        return getSchemeCodeData
    }

    console.log(getSchemeCodeData)

    const skipDay = 1
    const schemeCodeData = getSchemeCodeData.data
    const schemeCodeMaxDate = new Date(`${schemeCodeData.data[0].date.split("-")[2]}-${schemeCodeData.data[0].date.split("-")[1]}-${schemeCodeData.data[0].date.split("-")[0]}`)
    const schemeCodeMinDate = new Date(`${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[2]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[1]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[0]}`)

    var formatedSIPStartDate = await LibFunction.formateDateLib(SIPStartDate)
    var formatedValuationDate = await LibFunction.formateDateLib(valuationDate)
    var SIPStartDateNavData = []
    var SIPValuationDateNavData = []

    if (schemeCodeMaxDate < SIPStartDate || schemeCodeMinDate > SIPStartDate || schemeCodeMaxDate < valuationDate || schemeCodeMinDate > valuationDate) {
        return {
            status: false,
            error: constant.requestMessages.ERR_DATE_OUT_OF_BOUND
        }
    }
    SIPStartDateNavData = await filterStartDateData(SIPStartDateNavData, schemeCodeData, formatedSIPStartDate, skipDay, SIPStartDate)
    var StartDateNav = Number(SIPStartDateNavData[0].nav)

    SIPValuationDateNavData = await filterValuationDateData(SIPValuationDateNavData, schemeCodeData, formatedValuationDate, skipDay, valuationDate, false)
    var valuationDateNav = Number(SIPValuationDateNavData[0].nav)

    const totalUnitsAccumulated = Number(totalAmountInvested) / Number(StartDateNav).toFixed(2)
    const currentValue = (Number(totalUnitsAccumulated) * Number(valuationDateNav)).toFixed(2)
    const profitLoss = (Number(currentValue) - Number(totalAmountInvested)).toFixed(2)
    const absoluteReturn = (((Number(currentValue) - Number(totalAmountInvested)) * 100) / totalAmountInvested).toFixed(2)

    return {
        totalAmountInvested: totalAmountInvested,
        currentValue: currentValue,
        profitLoss: profitLoss,
        absoluteReturn: absoluteReturn
    }
}

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

    const getSchemeCodeData = await LibFunction.getResponseURL(schemeCode)
    if (!getSchemeCodeData.status) {
        return getSchemeCodeData
    }

    console.log(getSchemeCodeData)

    const schemeCodeData = getSchemeCodeData.data

    const skipDay = 1
    SIPStartDate = new Date(SIPStartDate)
    SIPEndDate = new Date(SIPEndDate)
    valuationDate = new Date(valuationDate)

    const monthDiff = differenceInMonths(new Date(SIPEndDate), new Date(SIPStartDate)) + 1
    const totalAmountInvested = monthDiff * Number(SIPAmount)

    var SIPStartDateNavData = []
    var SIPValuationDateNavData = []
    var formatedSIPStartDate = await LibFunction.formateDateLib(SIPStartDate)
    var formatedValuationDate = await LibFunction.formateDateLib(valuationDate)

    SIPStartDateNavData = await filterStartDateData(SIPStartDateNavData, schemeCodeData, formatedSIPStartDate, skipDay, SIPStartDate)
    var StartDateNav = Number(SIPStartDateNavData[0].nav)

    SIPValuationDateNavData = await filterValuationDateData(SIPValuationDateNavData, schemeCodeData, formatedValuationDate, skipDay, valuationDate, false)
    var valuationDateNav = Number(SIPValuationDateNavData[0].nav)

    const totalUnitsAccumulated = Number(totalAmountInvested) / Number(StartDateNav)
    const currentValue = Number(totalUnitsAccumulated) * Number(valuationDateNav)

    var finalTableData = []

    const schemeCodeMaxDate = new Date(`${schemeCodeData.data[0].date.split("-")[2]}-${schemeCodeData.data[0].date.split("-")[1]}-${schemeCodeData.data[0].date.split("-")[0]}`)
    const schemeCodeMinDate = new Date(`${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[2]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[1]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[0]}`)
    if (schemeCodeMaxDate < SIPStartDate || schemeCodeMinDate > SIPStartDate || schemeCodeMaxDate < valuationDate || schemeCodeMinDate > valuationDate) {
        return {
            status: false,
            error: constant.requestMessages.ERR_DATE_OUT_OF_BOUND
        }
    }

    finalTableData = await setFinalData(finalTableData, monthDiff, SIPStartDate, SIPAmount, schemeCodeData, schemeCodeMaxDate, schemeCodeMinDate, SIPAmount, skipDay)

    var data = {
        "total_amount_invested": await formatNumber(totalAmountInvested),
        "current_value": await formatNumber(currentValue),
        "profit_loss": await formatNumber(currentValue - totalAmountInvested),
        "sip_amount": await formatNumber(SIPAmount),
        "current_nav": await formatNumber(valuationDateNav),
        "cagr": undefined,
        "absolute_return": await formatNumber(((currentValue - totalAmountInvested) * 100) / totalAmountInvested),
        "graph_data": finalTableData
    }
    return data
}

module.exports = {
    calculateSIPPerformanceModule: calculateSIPPerformanceModule
}

async function setFinalData(finalTableData, monthDiff, SIPStartDate, SIPAmount, schemeCodeData, schemeCodeMaxDate, schemeCodeMinDate, SIPAmount, skipDay) {
    var schemeNAVData = []
    for (let i = 0; i < monthDiff; i++) {
        console.log(i)
        finalTableData[i] = {}

        if (i == 0) {
            var tempDate = SIPStartDate
        } else {
            var tempDate = new Date(SIPStartDate.setMonth(SIPStartDate.getMonth() + 1))
        }

        var formatedSIPStartDate = await LibFunction.formateDateLib(tempDate)
        if (schemeCodeMaxDate < tempDate || schemeCodeMinDate > tempDate) {
            break
        }

        schemeNAVData = await filterStartDateData(schemeNAVData, schemeCodeData, formatedSIPStartDate, skipDay, SIPStartDate)

        finalTableData[i]["date"] = schemeNAVData[0]["date"]
        finalTableData[i]["sip_amount"] = await formatNumber(SIPAmount)
        finalTableData[i]["nav"] = await formatNumber(schemeNAVData[0]["nav"])
        finalTableData[i]["unit"] = await formatNumber(SIPAmount / schemeNAVData[0]["nav"])
        finalTableData[i]["cumulative_unit"] = i > 0 ? await formatNumber(finalTableData[i - 1]["cumulative_unit"] + SIPAmount / schemeNAVData[0]["nav"]) : await formatNumber(SIPAmount / schemeNAVData[0]["nav"])
        finalTableData[i]["cumulative_amount"] = i > 0 ? await formatNumber(finalTableData[i - 1]["cumulative_amount"] + SIPAmount) : await formatNumber(SIPAmount)
    }
    return finalTableData
}

async function filterStartDateData(SIPStartDateNavData, schemeCodeData, formatedSIPDate, skipDay, SIPStartDate) {
    console.log("filterStartDateData", skipDay, formatedSIPDate)
    SIPStartDateNavData = schemeCodeData.data.filter((obj) => obj.date == formatedSIPDate)
    if (SIPStartDateNavData.length == 0) {
        formatedSIPDate = await LibFunction.formateDateLib(new Date(SIPStartDate).setDate(new Date(SIPStartDate).getDate() + skipDay))
        skipDay++
        SIPStartDateNavData = filterStartDateData(SIPStartDateNavData, schemeCodeData, formatedSIPDate, skipDay, SIPStartDate)
    }
    return SIPStartDateNavData
}

async function filterValuationDateData(SIPValuationDateNavData, schemeCodeData, formatedValuationDate, skipDay, valuationDate, backFlag) {
    console.log("filterValuationDateData", skipDay)
    SIPValuationDateNavData = schemeCodeData.data.filter((obj) => obj.date == formatedValuationDate)
    if (SIPValuationDateNavData.length == 0) {
        const sameDate = new Date().getFullYear() === new Date(valuationDate).getFullYear() && new Date().getMonth() === new Date(valuationDate).getMonth() && new Date().getDate() === new Date(valuationDate).getDate()
        if (sameDate) {
            backFlag = true
            formatedValuationDate = await LibFunction.formateDateLib(new Date(valuationDate).setDate(new Date(valuationDate).getDate() - skipDay))
        } else if (new Date() > new Date(valuationDate)) {
            if (backFlag) {
                formatedValuationDate = await LibFunction.formateDateLib(new Date(valuationDate).setDate(new Date(valuationDate).getDate() - skipDay))
            } else {
                formatedValuationDate = await LibFunction.formateDateLib(new Date(valuationDate).setDate(new Date(valuationDate).getDate() + skipDay))
            }
        } else if (new Date() < new Date(valuationDate)) {
            formatedValuationDate = await LibFunction.formateDateLib(new Date())
        }
        skipDay++
        SIPValuationDateNavData = filterValuationDateData(SIPValuationDateNavData, schemeCodeData, formatedValuationDate, skipDay, valuationDate, backFlag)
    }
    return SIPValuationDateNavData
}

async function formatNumber(data) {
    return Number(Number(data).toFixed(2))
}
