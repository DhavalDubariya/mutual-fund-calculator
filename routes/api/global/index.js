var express = require("express")
const router = express.Router()
const globalController = require("./global.controller")

router.get("/get-mutual-funds-scheme-list", globalController.getMutualFundsSchemeListController)
router.get("/get-fund-types", globalController.getFundTypesController)
module.exports = router
