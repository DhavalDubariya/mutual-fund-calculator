var express = require("express")
const router = express.Router()
const calculatorController = require("./calculator.controller")


router.get("/mf-sip",calculatorController.calculateController)
router.get("/sip",calculatorController.calculateSipController)
router.get("/lumpsum",calculatorController.calculateLumpsumController)
router.get("/car-loan",calculatorController.calculateCarLoanController)
router.get("/compund-interest",calculatorController.calculateCompundController)
router.get("/car-planing",calculatorController.calculateCarPlaningController)
router.get("/nav-finder",calculatorController.calculateNavController)
router.get("/top-perfomer",calculatorController.calculateTopPerformanceController)
module.exports = router
