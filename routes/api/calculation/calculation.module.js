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

const calculateSpiModule = async (req) => {
  var monthlySipAmount = req.body.monthly_sip_amount;
  var expectedReturn = req.body.expected_return;
  var timePeriod = req.body.time_period;

  if (
    monthlySipAmount == undefined ||
    monthlySipAmount == "" ||
    monthlySipAmount == null ||
    expectedReturn == undefined ||
    expectedReturn == null ||
    expectedReturn == "" ||
    timePeriod == undefined ||
    timePeriod == "" ||
    timePeriod == null
  ) {
    return {
      status: false,
      error: constant.requestMessages.ERR_INVALID_BODY,
    };
  }

  async function calculateSIP(monthlyInvestment, expectedReturn, timePeriod, inflationRate) {

    var exp = expectedReturn / 100
    var n = timePeriod * 12
    var i = exp/12
    var oneI = 1 + i
    var onePower =Math.pow(oneI, n)
    var onePowerSubtrect = onePower - 1 
    var middle = onePowerSubtrect/i
    // var M = P * ({[1 + i]n - 1} / i) * (1 + i)
    var total_value = Math.round(monthlyInvestment * middle * oneI)
    var total_investment = monthlyInvestment * n
    var returns = total_value - total_investment
    return {
        total_value,returns,total_investment
    };
  }
  
  const result = calculateSIP(monthlySipAmount, expectedReturn, timePeriod);
  return result;
};

module.exports = {
  calculateSIPPerformanceModule: calculateSIPPerformanceModule,
  calculateSpiModule: calculateSpiModule,
};
