var express = require("express")
const router = express.Router()
const globalController = require("./global.controller")

router.use("/get-mutual-funds-list", globalController.getMutualFundsListController)

module.exports = router
