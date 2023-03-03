const express = require("express")
const router = express.Router()
const globalModule = require("./global.module")

const getMutualFundsListController = async (req, res) => {
    var result = await globalModule.getMutualFundsListModule()
    return res.send(result)
}

module.exports = {
    getMutualFundsListController: getMutualFundsListController
}
