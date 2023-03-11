const express = require("express")
const router = express.Router()

const calculateController = async(req,res) => {
    return res.render("index");
}

const calculateSipController = async(req,res) => {
    return res.render("sip") 
}

const calculateLumpsumController = async(req,res) => {
    return res.render("lumpsum") 
}

const calculateCarLoanController = async(req,res) => {
    return res.render("carloan") 
}

const calculateCompundController = async(req,res) => {
    return res.render("compund")
}

const calculateCarPlaningController = async(req,res) => {
    return res.render("carplaning")
}

const calculateNavController = async(req,res) => {
    return res.render("navfinder")
}

const calculateTopPerformanceController = async(req,res) => {
    return res.render("topperformance")
}



module.exports = {
    calculateController:calculateController,
    calculateSipController:calculateSipController,
    calculateLumpsumController:calculateLumpsumController,
    calculateCarLoanController:calculateCarLoanController,
    calculateCompundController:calculateCompundController,
    calculateCarPlaningController:calculateCarPlaningController,
    calculateNavController:calculateNavController,
    calculateTopPerformanceController:calculateTopPerformanceController
}
