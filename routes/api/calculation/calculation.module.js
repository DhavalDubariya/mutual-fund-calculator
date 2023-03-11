const express = require("express")
const router = express.Router()
const dotenv = require("dotenv").config()
const request = require("request")
const { JSDOM } = require("jsdom")
const { differenceInMonths } = require("date-fns")
const LibFunction = require("../../../helpers/libfunction")
const constant = require("../../../helpers/constant")
const fundTypeArr = [
    "arbitrage",
    "Balanced/Aggressive",
    "Banking-PSU",
    "Conservative",
    "Corporate-Bond",
    "Credit-Risk",
    "Dividend-Yield",
    "Dynamic-Bond",
    "Dynamic-Asset-Allocation",
    "Equity-Savings",
    "ELSS",
    "Focused",
    "FOF",
    "FMP",
    "Floaters",
    "Gilt",
    "Gilt-10-Yrs-Constant-Duration",
    "Index-Funds",
    "Large-cap",
    "Liquid",
    "Low-Duration",
    "Long-Duration",
    "Medium-Duration",
    "Med-to-Long-Duration",
    "Mid-Cap",
    "Money-Market",
    "Multi-Asset-Alloc",
    "Multi-Cap",
    "Overnight",
    "Retirement",
    "Sectoral/Thematic",
    "Short-Duration",
    "Small-Cap",
    "Ultra-Short-Duration",
    "Value/Contra"
]

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

    const options = {
        url: `${process.env.MUTUAL_FUNDS_URL}/${schemeCode}`,
        headers: {
            "Content-Type": "application/json"
        }
    }

    const getSchemeCodeData = await LibFunction.getResponseURL(options)
    // console.log(getSchemeCodeData)
    if (!getSchemeCodeData.status) {
        return getSchemeCodeData
    }
    // console.log(getSchemeCodeData)

    const schemeCodeData = JSON.parse(getSchemeCodeData.data)
    if (schemeCodeData.length == 0 || !JSON.parse(getSchemeCodeData.data)) {
        return getSchemeCodeData
    }

    const skipDay = 1
    SIPStartDate = new Date(SIPStartDate)
    SIPEndDate = new Date(SIPEndDate)
    valuationDate = new Date(valuationDate)

    if (SIPStartDate >= SIPEndDate || valuationDate < SIPEndDate) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_DATE
        }
    }

    const schemeCodeMaxDate = new Date(`${schemeCodeData.data[0].date.split("-")[2]}-${schemeCodeData.data[0].date.split("-")[1]}-${schemeCodeData.data[0].date.split("-")[0]}`)
    const schemeCodeMinDate = new Date(`${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[2]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[1]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[0]}`)
    if (schemeCodeMaxDate < SIPStartDate || schemeCodeMinDate > SIPStartDate || schemeCodeMaxDate < valuationDate || schemeCodeMinDate > valuationDate) {
        return {
            status: false,
            error: constant.requestMessages.ERR_DATE_OUT_OF_BOUND
        }
    }

    const monthDiff = differenceInMonths(new Date(SIPEndDate), new Date(SIPStartDate)) + 1
    const totalAmountInvested = monthDiff * Number(SIPAmount)

    var SIPStartDateNavData = []
    var SIPValuationDateNavData = []
    var formatedSIPStartDate = await LibFunction.formateDateLib(SIPStartDate)
    var formatedValuationDate = await LibFunction.formateDateLib(valuationDate)

    SIPStartDateNavData = await filterStartDateData(false, SIPStartDateNavData, schemeCodeData, formatedSIPStartDate, skipDay, SIPStartDate)
    var StartDateNav = Number(SIPStartDateNavData[0].nav)

    SIPValuationDateNavData = await filterValuationDateData(false, SIPValuationDateNavData, schemeCodeData, formatedValuationDate, skipDay, valuationDate)
    var valuationDateNav = Number(SIPValuationDateNavData[0].nav)

    const totalUnitsAccumulated = Number(totalAmountInvested) / Number(StartDateNav)
    const currentValue = Number(totalUnitsAccumulated) * Number(valuationDateNav)
    const totalInvestmentYear = monthDiff / 12
    const raiseValue = await formatNumber(1 / totalInvestmentYear)
    const finalValue = await formatNumber(currentValue / totalAmountInvested)
    const cagrValue = finalValue ** raiseValue

    var finalTableData = []

    finalTableData = await setFinalData(finalTableData, monthDiff, SIPStartDate, SIPAmount, schemeCodeData, schemeCodeMaxDate, schemeCodeMinDate, SIPAmount, skipDay)

    var data = {
        "total_amount_invested": await formatNumber(totalAmountInvested),
        "current_value": await formatNumber(currentValue),
        "profit_loss": await formatNumber(currentValue - totalAmountInvested),
        "sip_amount": await formatNumber(SIPAmount),
        "current_nav": await formatNumber(valuationDateNav),
        "cagr": await formatNumber((cagrValue - 1) * 100),
        "absolute_return": await formatNumber(((currentValue - totalAmountInvested) / totalAmountInvested) * 100),
        "graph_data": finalTableData
    }

    return {
        status: true,
        data: data
    }
}

const navFinderModule = async (req) => {
    const schemeCode = req.body.scheme_code
    var SIPStartDate = req.body.sip_start_date
    var SIPEndDate = req.body.sip_end_date

    if (!schemeCode || new Date(SIPStartDate) > new Date(SIPEndDate)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const options = {
        url: `${process.env.MUTUAL_FUNDS_URL}/${schemeCode}`,
        headers: {
            "Content-Type": "application/json"
        }
    }
    const getSchemeCodeData = await LibFunction.getResponseURL(options)
    if (!getSchemeCodeData.status) {
        return getSchemeCodeData
    }

    // console.log(getSchemeCodeData)

    const schemeCodeData = JSON.parse(getSchemeCodeData.data)
    if (schemeCodeData.length == 0 || !JSON.parse(getSchemeCodeData.data)) {
        return getSchemeCodeData
    }

    SIPStartDate = new Date(SIPStartDate)
    SIPEndDate = new Date(SIPEndDate)

    const schemeCodeMaxDate = new Date(`${schemeCodeData.data[0].date.split("-")[2]}-${schemeCodeData.data[0].date.split("-")[1]}-${schemeCodeData.data[0].date.split("-")[0]}`)
    const schemeCodeMinDate = new Date(`${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[2]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[1]}-${schemeCodeData.data[schemeCodeData.data.length - 1].date.split("-")[0]}`)
    if (schemeCodeMaxDate < SIPStartDate || schemeCodeMinDate > SIPStartDate || schemeCodeMaxDate < SIPEndDate || schemeCodeMinDate > SIPEndDate) {
        return {
            status: false,
            error: constant.requestMessages.ERR_DATE_OUT_OF_BOUND
        }
    }

    const skipDay = 1
    var formatedSIPStartDate = await LibFunction.formateDateLib(SIPStartDate)
    var formatedEndDate = await LibFunction.formateDateLib(SIPEndDate)

    var startIndex = await filterStartDateData(true, null, schemeCodeData, formatedSIPStartDate, skipDay, SIPStartDate)
    var lastIndex = await filterValuationDateData(true, null, schemeCodeData, formatedEndDate, skipDay, SIPEndDate)
    // console.log(startIndex, lastIndex)
    var result = []
    for (let i = lastIndex; i <= startIndex; i++) {
        var data = {
            "date": schemeCodeData.data[i].date,
            "nav": await formatNumber(schemeCodeData.data[i].nav)
        }
        result.push(data)
    }

    return {
        status: true,
        data: result
    }
}

const getTopPerformerModule = async (req) => {
    const fundTypeId = req.query.fund_type_id - 1
    // console.log(fundTypeId, fundTypeArr[fundTypeId])
    const options = {
        url: `https://my-eoffice.com/advisor/calculatornew/all_calculator/show_fund_calc_CLS.php?cat=${fundTypeArr[fundTypeId]}&bg=&fc=#`
    }
    const getTopPerformeData = await LibFunction.getResponseURL(options)
    if (!getTopPerformeData.status) {
        return getTopPerformeData
    }

    const htmlString = getTopPerformeData.data
    const dom = new JSDOM(htmlString)

    // const fullHtml = dom.window.document.documentElement.outerHTML
    // return fullHtml

    // Obtain HTML Text Content
    var result = []
    const element2 = dom.window.document.querySelectorAll(".item2")
    for (let i = 0; i < element2.length; i++) {
        result[i] = {}
        result[i]["scheme_name"] = element2[i].textContent.trim().replace("  Why this Fund  Close", "") ? element2[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element3 = dom.window.document.querySelectorAll(".item3")
    for (let i = 0; i < element2.length; i++) {
        result[i]["nav"] = element3[i].textContent.trim().replace("  Why this Fund  Close", "") ? element3[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element4 = dom.window.document.querySelectorAll(".item4")
    for (let i = 0; i < element2.length; i++) {
        result[i]["one_week"] = element4[i].textContent.trim().replace("  Why this Fund  Close", "") ? element4[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element5 = dom.window.document.querySelectorAll(".item5")
    for (let i = 0; i < element2.length; i++) {
        result[i]["one_month"] = element5[i].textContent.trim().replace("  Why this Fund  Close", "") ? element5[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element6 = dom.window.document.querySelectorAll(".item6")
    for (let i = 0; i < element2.length; i++) {
        result[i]["three_month"] = element6[i].textContent.trim().replace("  Why this Fund  Close", "") ? element6[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element7 = dom.window.document.querySelectorAll(".item7")
    for (let i = 0; i < element2.length; i++) {
        result[i]["six_month"] = element7[i].textContent.trim().replace("  Why this Fund  Close", "") ? element7[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element8 = dom.window.document.querySelectorAll(".item8")
    for (let i = 0; i < element2.length; i++) {
        result[i]["nine_month"] = element8[i].textContent.trim().replace("  Why this Fund  Close", "") ? element8[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element9 = dom.window.document.querySelectorAll(".item9")
    for (let i = 0; i < element2.length; i++) {
        result[i]["one_year"] = element9[i].textContent.trim().replace("  Why this Fund  Close", "") ? element9[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element10 = dom.window.document.querySelectorAll(".item10")
    for (let i = 0; i < element2.length; i++) {
        result[i]["three_year"] = element10[i].textContent.trim().replace("  Why this Fund  Close", "") ? element10[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element11 = dom.window.document.querySelectorAll(".item11")
    for (let i = 0; i < element2.length; i++) {
        result[i]["five_year"] = element11[i].textContent.trim().replace("  Why this Fund  Close", "") ? element11[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    const element12 = dom.window.document.querySelectorAll(".item12")
    for (let i = 0; i < element2.length; i++) {
        result[i]["SI"] = element12[i].textContent.trim().replace("  Why this Fund  Close", "") ? element12[i].textContent.trim().replace("  Why this Fund  Close", "") : ""
    }

    return {
        status: true,
        data: result
    }
}

module.exports = {
    calculateSIPPerformanceModule: calculateSIPPerformanceModule,
    navFinderModule: navFinderModule,
    getTopPerformerModule: getTopPerformerModule
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

        schemeNAVData = await filterStartDateData(false, schemeNAVData, schemeCodeData, formatedSIPStartDate, skipDay, SIPStartDate)

        finalTableData[i]["date"] = schemeNAVData[0]["date"]
        finalTableData[i]["sip_amount"] = await formatNumber(SIPAmount)
        finalTableData[i]["nav"] = await formatNumber(schemeNAVData[0]["nav"])
        finalTableData[i]["unit"] = await formatNumber(SIPAmount / Number(schemeNAVData[0]["nav"]))
        finalTableData[i]["cumulative_unit"] = i > 0 ? await formatNumber(Number(finalTableData[i - 1]["cumulative_unit"]) + SIPAmount / Number(schemeNAVData[0]["nav"])) : await formatNumber(SIPAmount / Number(schemeNAVData[0]["nav"]))
        finalTableData[i]["cumulative_amount"] = i > 0 ? await formatNumber(Number(finalTableData[i - 1]["cumulative_amount"]) + SIPAmount) : await formatNumber(SIPAmount)
    }
    return finalTableData
}

async function filterStartDateData(findIndexFlag, SIPStartDateNavData, schemeCodeData, formatedSIPDate, skipDay, SIPStartDate) {
    console.log("filterStartDateData", skipDay, formatedSIPDate)
    if (findIndexFlag) {
        SIPStartDateNavData = schemeCodeData.data.findIndex((obj) => obj.date == formatedSIPDate)
    } else {
        SIPStartDateNavData = schemeCodeData.data.filter((obj) => obj.date == formatedSIPDate)
    }

    if ((SIPStartDateNavData.length == 0 && !findIndexFlag) || (SIPStartDateNavData < 0 && findIndexFlag)) {
        if (new Date() < new Date(SIPStartDate) || new Date(schemeCodeData.data[0].date) < new Date(SIPStartDate)) {
            formatedSIPDate = schemeCodeData.data[1].date
        } else if (new Date(schemeCodeData.data[schemeCodeData.data.length - 1].date) > new Date(SIPStartDate)) {
            formatedSIPDate = schemeCodeData.data[schemeCodeData.data.length - 1].date
        } else {
            formatedSIPDate = await LibFunction.formateDateLib(new Date(SIPStartDate).setDate(new Date(SIPStartDate).getDate() + skipDay))
        }
        skipDay++
        SIPStartDateNavData = filterStartDateData(findIndexFlag, SIPStartDateNavData, schemeCodeData, formatedSIPDate, skipDay, SIPStartDate)
    }
    return SIPStartDateNavData
}

async function filterValuationDateData(findIndexFlag, SIPValuationDateNavData, schemeCodeData, formatedDate, skipDay, SIPLastDate) {
    // console.log("filterValuationDateData", skipDay)
    // console.log(schemeCodeData, schemeCodeData.data)
    if (findIndexFlag) {
        SIPValuationDateNavData = schemeCodeData.data.findIndex((obj) => obj.date == formatedDate)
    } else {
        SIPValuationDateNavData = schemeCodeData.data.filter((obj) => obj.date == formatedDate)
    }

    if ((SIPValuationDateNavData.length == 0 && !findIndexFlag) || (SIPValuationDateNavData < 0 && findIndexFlag)) {
        if (new Date() < new Date(SIPLastDate) || new Date(schemeCodeData.data[0].date) < new Date(SIPLastDate)) {
            formatedDate = schemeCodeData.data[0].date
        } else if (new Date(schemeCodeData.data[schemeCodeData.data.length - 1].date) > new Date(SIPLastDate)) {
            formatedDate = schemeCodeData.data[schemeCodeData.data.length - 2].date
        } else {
            formatedDate = await LibFunction.formateDateLib(new Date(SIPLastDate).setDate(new Date(SIPLastDate).getDate() - skipDay))
        }
        skipDay++
        SIPValuationDateNavData = filterValuationDateData(findIndexFlag, SIPValuationDateNavData, schemeCodeData, formatedDate, skipDay, SIPLastDate)
    }
    return SIPValuationDateNavData
}

async function formatNumber(data) {
    return Number(data).toFixed(2)
}
