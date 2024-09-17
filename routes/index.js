const express = require("express");
const { fetchNewLiveData, analyzeData, analyzeDataJob } = require("../controller/data");
const Router = express.Router();



Router.get("/test", (req,res,next)=>{
    res.send("hello user, you are logged in")
  })


  Router.get("/fetchdata", fetchNewLiveData)
  Router.get("/analyzeData",analyzeData)


  module.exports = Router