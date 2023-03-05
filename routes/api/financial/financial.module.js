
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const request = require("request");
const constant = require("../../../helpers/constant");

const finacialSpiModule = async (req) => {
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

  
  async function calculateSIP(monthlyInvestment, expectedReturn, timePeriod) {
    var currentYear = new Date().getFullYear()
    var dataArray = [];
    for (let i = 1; i < timePeriod + 1; i++) {
      var exp = expectedReturn / 100;
      var n = i * 12;
      var iPerod = exp / 12;
      var oneI = 1 + iPerod;
      var onePower = Math.pow(oneI, n);
      var onePowerSubtrect = onePower - 1;
      var middle = onePowerSubtrect / iPerod;
      // var M = P * ({[1 + i]n - 1} / i) * (1 + i)
      var total_value = Math.round(monthlyInvestment * middle * oneI);
      var total_investment = monthlyInvestment * n;
      var returns = total_value - total_investment;
      var nextYear = currentYear + i;
      var result = {
        total_investment: total_investment.toLocaleString(),
        returns: returns.toLocaleString(),
        total_value: total_value.toLocaleString(),
        "year":nextYear
      };
      dataArray.push(result);
    }
    return dataArray;
  }

  const sipCalculactionc = await calculateSIP(
    monthlySipAmount,
    expectedReturn,
    timePeriod
  );
  var result = {
    status: true,
    data: {
      sip_calc_years: sipCalculactionc,
      sip_calc: {
        total_investment:sipCalculactionc[sipCalculactionc.length - 1].total_investment,
        returns: sipCalculactionc[sipCalculactionc.length - 1].returns,
        total_value: sipCalculactionc[sipCalculactionc.length - 1].total_value,
        year:sipCalculactionc[sipCalculactionc.length - 1].year
      },
    },
  };
  return result;
};

const finacialLumpSumModule = async(req) => {
  return {
    status:true
  }
}

module.exports = {
    finacialSpiModule: finacialSpiModule,
    finacialLumpSumModule:finacialLumpSumModule
};
