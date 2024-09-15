const express = require("express");
const { fetchLiveData, analyzeData, analyzeDataJob } = require("../controller/data");
const Router = express.Router();



Router.get("/test", (req,res,next)=>{
    res.send("hello user, you are logged in")
  })


  Router.get("/fetchdata", fetchLiveData)
  Router.get("/analyzeData",analyzeDataJob)


  module.exports = Router