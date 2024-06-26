const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const request = require("request");
const constant = require("../../../helpers/constant");
const libfunction = require("../../../helpers/libfunction");

const finacialSpiModule = async (req) => {
  var monthlySipAmount = req.body.monthly_sip_amount;
  var expectedReturn = req.body.expected_return;
  var timePeriod = req.body.time_period;
  monthlySipAmount = parseInt(monthlySipAmount);
  expectedReturn = parseInt(expectedReturn);
  timePeriod = parseInt(timePeriod);
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
    var currentYear = new Date().getFullYear();
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
        year: nextYear,
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

  if (sipCalculactionc.length == 0) {
    return {
      status: false,
      error: constant.requestMessages.ERR_INVALID_BODY,
    };
  }

  var result = {
    status: true,
    data: {
      sip_calc_years: sipCalculactionc,
      sip_calc: sipCalculactionc[sipCalculactionc.length - 1],
    },
  };
  return result;
};

const finacialLumpSumModule = async (req) => {
  var totleInvestment = req.body.totle_investment;
  var expectedReturn = req.body.expected_return;
  var timePeriod = req.body.time_period;

  if (
    totleInvestment == undefined ||
    totleInvestment == "" ||
    totleInvestment == null ||
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
  totleInvestment = parseInt(totleInvestment);
  expectedReturn = parseInt(expectedReturn);
  timePeriod = parseInt(timePeriod);
  async function lumSumCalculaction(
    totleInvestment,
    expectedReturn,
    timePeriod
  ) {
    var currentYear = new Date().getFullYear();
    var dataArray = [];

    for (let i = 1; i < timePeriod + 1; i++) {
      var intrestRate = expectedReturn / 100;
      var midalValue = 1 + intrestRate;
      var endValue = midalValue ** i;
      var totle_value = Math.round(totleInvestment * endValue);
      var totle_investment = totleInvestment;
      var returns = totle_value - totle_investment;
      var nextYear = currentYear + i;
      var result = {
        totle_investment: totle_investment.toLocaleString(),
        totle_value: totle_value.toLocaleString(),
        returns: returns.toLocaleString(),
        year: nextYear,
      };
      dataArray.push(result);
    }

    return dataArray;
  }
  var lumsumValue = await lumSumCalculaction(
    totleInvestment,
    expectedReturn,
    timePeriod
  );
  var result = {
    status: true,
    data: {
      lumsum_calc_year: lumsumValue,
      lumsum_calc: lumsumValue[lumsumValue.length - 1],
    },
  };
  return result;
};

const finacialCarloneModule = async (req) => {
  var lonaAmount = req.body.loan_amount;
  var intrestRate = req.body.intrest_rate;
  var tenure = req.body.tenure_year;

  if (
    lonaAmount == undefined ||
    lonaAmount == "" ||
    lonaAmount == null ||
    intrestRate == "" ||
    intrestRate == null ||
    intrestRate == undefined ||
    tenure == null ||
    tenure == "" ||
    tenure == undefined
  ) {
    return {
      status: false,
      error: constant.requestMessages.ERR_INVALID_BODY,
    };
  }
  async function carLoanEmiCalculator(lonaAmount, intrestRate, tenure) {
    var P = lonaAmount;
    const R = intrestRate / 100 / 12;
    const N = tenure * 12;
    const EMI = (P * R * (1 + R) ** N) / ((1 + R) ** N - 1);

    const totleAmount = EMI * N;
    const totleIntrest = totleAmount - lonaAmount;

    var changeLoanAmount = lonaAmount;
    var dataArray = [];
    var date = new Date();
    for (let i = 0; i < N; i++) {
      var monthDate = await libfunction.formateDateLib(
        date.setMonth(date.getMonth() + 1)
      );
      var month = `${monthDate.split("-")[1]}-${monthDate.split("-")[2]}`;
      var intrest_charge = R * changeLoanAmount;
      var principal_paid = EMI - intrest_charge;
      var changeLoanAmount = changeLoanAmount - principal_paid;
      var result = {
        intrest_charge: Math.round(intrest_charge).toLocaleString(),
        principal_paid: Math.round(principal_paid).toLocaleString(),
        changeLoanAmount: Math.round(changeLoanAmount).toLocaleString(),
        month,
      };
      dataArray.push(result);
    }

    var result = {
      monthly_emi: Math.round(EMI),
      totle_amount: Math.round(totleAmount),
      totle_intrest: Math.round(totleIntrest),
      principal_amount: lonaAmount,
      dataArray,
    };
    return result;
  }
  lonaAmount = parseInt(lonaAmount);
  intrestRate = parseInt(intrestRate);
  tenure = parseInt(tenure);
  var carLoanEmiCalc = await carLoanEmiCalculator(
    lonaAmount,
    intrestRate,
    tenure
  );
  return { status: true, data: carLoanEmiCalc };
};

// compoundInterst Calculaction

async function compoundInterast(
  principalAmount,
  intrestRate,
  timePeriod,
  compounDingFreq
) {
  if (compounDingFreq == "year") {
    var compoundInterast =
      principalAmount * (1 + intrestRate / 100) ** timePeriod;
    return compoundInterast;
  }
  if (compounDingFreq == "halfyear") {
    var compoundInterast =
      principalAmount * (1 + intrestRate / 100 / 2) ** (timePeriod * 2);
    return compoundInterast;
  }
  if (compounDingFreq == "quarterly") {
    var compoundInterast =
      principalAmount * (1 + intrestRate / 100 / 4) ** (timePeriod * 4);
    return compoundInterast;
  }
}

const finacialCompoundInterestModule = async (req) => {
  var principalAmount = req.body.principal_amount;
  var intrestRate = req.body.intrest_rate;
  var timePeriod = req.body.time_period;
  var compounDingFreq = req.body.compounding_frequency;

  principalAmount = parseInt(principalAmount);
  intrestRate = parseInt(intrestRate);
  timePeriod = parseInt(timePeriod);

  if (
    principalAmount == undefined ||
    principalAmount == null ||
    principalAmount == "" ||
    intrestRate == null ||
    intrestRate == undefined ||
    intrestRate == "" ||
    timePeriod == undefined ||
    timePeriod == null ||
    timePeriod == ""
  ) {
    return {
      status: false,
      error: constant.requestMessages.ERR_DATE_OUT_OF_BOUND,
    };
  }

  var compoundInterastValue = await compoundInterast(
    principalAmount,
    intrestRate,
    timePeriod,
    compounDingFreq
  );
  var compound_interast = Math.round(compoundInterastValue).toLocaleString();
  var subtract = compoundInterastValue - principalAmount
  var total_interast = Math.round(subtract).toLocaleString();
  var principal_amount = Math.round(principalAmount).toLocaleString();
  var result = {
    status: true,
    data: {
      compound_interast,
      principal_amount,
      total_interast
    },
  };
  return result;
};

const finacialCarPlaninfModule = async (req) => {
  var afterYear = req.body.after_years;
  var costOfThing = req.body.cost_of_thing;
  var inflectionRate = req.body.inflection_rate;
  var expectedReturn = req.body.expected_return;

  async function generate_pdf(afterYear, costOfThing,inflectionRate,expectedReturn) {
    var dataArray = []

      var lumsum_value
      var sip_value
      var cage = afterYear;
      var period = afterYear * 12;
      var cmexp = costOfThing;
      var inte = inflectionRate / 400;
      var exret = expectedReturn / 400;
      var duration = (cage * 12) / 3;
      let principal = parseInt(cmexp);
      let rate = parseFloat(inte, 10);
      period = parseFloat(period, 10);
      var graphname = "Car Price";
      var planname = "Car Planning";
      let a1 = 1 + exret;
      a1 = Math.pow(a1, duration);
      a1 = Math.round(cmexp * a1, 10);
      let a = 1 + inte;
      a = Math.pow(a, duration);
      drem_thing_cost = Math.round(cmexp * a, 10);
      let b = 1 + exret;
      b = Math.pow(b, duration);
      lumsum_value = Math.round(drem_thing_cost / b, 10);
      //l=l.toFixed(2);
      let n = duration;
      let i = exret;
      let as = 1 + i;

      as = Math.pow(as, n);
      as = as - 1;

      let bs = 1 + i;
      bs = Math.pow(bs, -1 / 3);
      bs = 1 - bs;
      sip_value = Math.round((drem_thing_cost * bs) / as, 10);
      console.log(sip_value)
      let total_interest = a1 - cmexp;

      var investment_summary = {
        drem_thing_cost,
        lumsum_value,
        sip_value,
        total_interest
      }
      
    
  return investment_summary
  }
  var result =  await generate_pdf(afterYear, costOfThing,inflectionRate,expectedReturn);
  return {status:true,data:result}
};

module.exports = {
  finacialSpiModule: finacialSpiModule,
  finacialLumpSumModule: finacialLumpSumModule,
  finacialCarloneModule: finacialCarloneModule,
  finacialCompoundInterestModule: finacialCompoundInterestModule,
  finacialCarPlaninfModule: finacialCarPlaninfModule,
};
