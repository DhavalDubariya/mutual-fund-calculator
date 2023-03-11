const express = require("express")
const router = express.Router()
const globalModule = require("./global.module")

const getMutualFundsSchemeListController = async (req, res) => {
    var result = await globalModule.getMutualFundsSchemeListModule()
    return res.send(result)
}

const getFundTypesController = async (req, res) => {
    var result = await globalModule.getFundTypesModule()
    return res.send(result)
}

module.exports = {
    getMutualFundsSchemeListController: getMutualFundsSchemeListController,
    getFundTypesController: getFundTypesController
}
