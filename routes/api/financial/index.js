var express = require("express")
const router = express.Router()
const financialController = require("./financial.controller")

router.post("/calculate-spi",financialController.finacialSpiController);
router.post("/calculate-lumpsum",financialController.finacialLumpSumController)

module.exports = router
