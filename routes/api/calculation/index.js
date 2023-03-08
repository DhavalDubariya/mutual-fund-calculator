var express = require("express")
const router = express.Router()
const calculationController = require("./calculation.controller")

router.post("/calculate-sip-performance", calculationController.calculateSIPPerformanceController)
router.post("/nav-finder",calculationController.navFinderController)

module.exports = router
