var express = require("express")
var router = express.Router()
const calculationAPIs = require("./api/calculation")
const globalAPIs = require("./api/global")
const financial = require("./api/financial")
const calculator = require("./app/calculator")

router.use("/api/calculation", calculationAPIs)
router.use("/api/global", globalAPIs)
router.use("/api/financial",financial)

router.use("/app/calculator",calculator)

module.exports = router
