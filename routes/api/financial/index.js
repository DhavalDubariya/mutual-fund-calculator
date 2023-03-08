var express = require("express")
const router = express.Router()
const financialController = require("./financial.controller")

router.post("/calculate-spi",financialController.finacialSpiController);
router.post("/calculate-lumpsum",financialController.finacialLumpSumController)
router.post("/calculate-car-lone",financialController.finacialCarloneController).post("/calculate-compound")
router.post("/calculate-compund-interest",financialController.finacialCompoundInterestController)
module.exports = router
