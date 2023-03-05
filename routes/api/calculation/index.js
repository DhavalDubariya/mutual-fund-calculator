var express = require("express")
const router = express.Router()
const calculationController = require("./calculation.controller")

router.post("/calculate-sip-performance", calculationController.calculateSIPPerformanceController)
router.post("/calculate-spi",calculationController.calculateSpiController);

module.exports = router
