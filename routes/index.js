var express = require("express")
var router = express.Router()
const calculationAPIs = require("./api/calculation")
const globalAPIs = require("./api/global")

router.use("/api/calculation", calculationAPIs)
router.use("/api/global", globalAPIs)

module.exports = router
