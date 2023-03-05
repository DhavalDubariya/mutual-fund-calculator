const express = require("express")
const router = express.Router()
const calculationModule = require("./calculation.module")

const calculateSIPPerformanceController = async (req, res) => {
    var result = await calculationModule.calculateSIPPerformanceModule(req)
    return res.send(result)
}

module.exports = {
    calculateSIPPerformanceController: calculateSIPPerformanceController
}