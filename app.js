var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const cors = require("cors")
var indexRouter = require("./routes")

var app = express()

app.use("/static", express.static(path.join(__dirname, "public")))

app.use(logger("dev"))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// Body Parser
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))

// Array Of Cors (Domains)
app.use(
    cors({
        origin: process.env.CORS_DOMAIN.split(","),
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
        credentials: true
    })
)

// Router
app.use("/", indexRouter)

// Server Listening To Port Number
app.listen(process.env.PORT, function () {
    console.log(`Server started at ${process.env.PORT}`)
})

module.exports = app
