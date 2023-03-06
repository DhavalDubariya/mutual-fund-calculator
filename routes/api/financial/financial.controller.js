const express = require("express")
const router = express.Router()
const financialModule = require("./financial.module")

const finacialSpiController = async(req,res) => {
    var result = await financialModule.finacialSpiModule(req)
    return res.send(result)
}

const finacialLumpSumController = async(req,res) => {
    var result = await financialModule.finacialLumpSumModule(req)
    return res.send(result)
}

const finacialCarloneController = async(req,res) => {
    var result = await financialModule.finacialCarloneModule(req)
    return res.send(result)
}

module.exports = {
    finacialSpiController: finacialSpiController,
    finacialLumpSumController:finacialLumpSumController,
    finacialCarloneController:finacialCarloneController
}
