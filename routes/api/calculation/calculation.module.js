
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const request = require("request");
const constant = require("../../../helpers/constant");

const calculateSIPPerformanceModule = async (req) => {
  const schemeCode = req.body.scheme_code;
  const sipAmt = req.body.sip_amount;
  const sipStartDate = req.body.sip_start_date;
  const sipEndDate = req.body.sip_end_date;
  const valuationDate = req.body.valuation_date;

  if (
    !schemeCode ||
    !sipAmt ||
    !sipStartDate ||
    !sipEndDate ||
    !valuationDate
  ) {
    return {
      status: false,
      error: constant.requestMessages.ERR_INVALID_BODY,
    };
  }
};


module.exports = {
  calculateSIPPerformanceModule: calculateSIPPerformanceModule
};
