var express = require("express")
const router = express.Router()
const calculationController = require("./calculation.controller")

router.post("/calculate-sip-performance", calculationController.calculateSIPPerformanceController)
router.post("/nav-finder",calculationController.navFinderController)
router.get("/get-top-performer", calculationController.getTopPerformerController)

module.exports = router
