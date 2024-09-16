const axios = require("axios");
const fs = require("fs");
const path = require("path");
const {
  predictNextDirection,
  predictNextCandleDirection,
  predictNextCandleDirectionSecond,
  predictNextDirectionNews,
  predictNextCandle5,
  predictNextCandle7,
  predictNextCandle8,
  predictNextCandleNEW,
  predictNextCandleSeconds,
  predictNextCandle,
  predictTrend,
  analyzeTrend,
  macdStrategyThree,
  rsiStrategyThree,
  bollingerBandsStrategyThree,
  generateSignal,
  predictSignalTechnical,
  predictSignalSS
} = require("./predictionFunctions.js");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const fetchLiveData = async (currencies) => {
  try {
    for (const currency of currencies) {
      // Define the API URL based on the currency
      const apiUrl = `https://api.finazon.io/latest/finazon/forex/time_series?ticker=${currency}&interval=1m&page=0&page_size=40&apikey=18535cbd97e2400d93f96802097d83c9af`;

      // Fetch data from the API
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Define the path to the JSON file for each currency
      const filePath = path.join(
        __dirname,
        `data_${currency.replace("/", "_")}.json`
      );

      // Write the data to the file (this will create or overwrite the file)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

      console.log(`Data for ${currency} fetched and written to file.`);
    }

    return true;
  } catch (err) {
    console.error("Error fetching live data:", err);
    return false;
  }
};

const analyzeData = async (currencies) => {
  try {
    let allResults = {};

    for (const currency of currencies) {
      // Define the path to the JSON file for each currency
      const filePath = path.join(
        __dirname,
        `data_${currency.replace("/", "_")}.json`
      );

      if (!fs.existsSync(filePath)) {
        console.error(`Data file for ${currency} not found`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(fileContent);

      // Apply prediction functions
      const results = [
        predictNextDirection(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandleDirection(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandleDirectionSecond(data?.data.sort((a, b) => a.t - b.t)),
        predictNextDirectionNews(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandle5(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandle7(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandle8(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandleNEW(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandleSeconds(data?.data.sort((a, b) => a.t - b.t)),
        predictNextCandle(data?.data.sort((a, b) => a.t - b.t)),
        predictTrend(data?.data.sort((a, b) => a.t - b.t)),
        analyzeTrend(data?.data.sort((a, b) => a.t - b.t)),
        macdStrategyThree(data?.data.sort((a, b) => a.t - b.t)),
        rsiStrategyThree(data?.data.sort((a, b) => a.t - b.t)),
        bollingerBandsStrategyThree(data?.data.sort((a, b) => a.t - b.t)),
        generateSignal(data?.data.sort((a, b) => a.t - b.t)),
        predictSignalTechnical(data?.data.sort((a, b) => a.t - b.t)),
        predictSignalSS(data?.data.sort((a, b) => a.t - b.t))
      ];

      // Initialize counters for each direction
      let upCount = 0;
      let downCount = 0;
      let flatCount = 0;

      // Count the occurrences of "up", "down", and "flat"
      results.forEach((result) => {
        if (result.toLowerCase() === "up") {
          upCount++;
        } else if (result.toLowerCase() === "down") {
          downCount++;
        } else if (result.toLowerCase() === "flat") {
          flatCount++;
        }
      });

      // Store results in an object
      allResults[currency] = {
        results,
        counts: {
          upCount,
          downCount,
          flatCount,
        },
      };
    }

    // Send the response (you can adapt this to fit your needs)
    console.log("Analysis complete:", allResults);

    return allResults;
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong during analysis");
  }
};

const analyzeDataJob = async () => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ind8588@gmail.com",
        pass: "ngma guzm wneh kmtk",
      },
    });

    const currencies = ["EUR/USD", "GBP/USD", "AUD/USD"];
    const analysisResults = await analyzeData(currencies);

    // Format the message for the email
    let emailContent = "<h3>Analysis Results:</h3>";
    for (const [currency, result] of Object.entries(analysisResults)) {
      emailContent += `
        <h4>${currency}</h4>
        <p><strong>Up Count:</strong> ${result.counts.upCount}</p>
        <p><strong>Down Count:</strong> ${result.counts.downCount}</p>
        <p><strong>Flat Count:</strong> ${result.counts.flatCount}</p>
      `;
    }

    // Send the email via Nodemailer
    const mailOptions = {
      from: "ind8588@gmail.com", // Sender's email
      to: "shihabshaikh96@gmail.com", // Recipient's email
      subject: "Forex Data Analysis Results",
      html: emailContent,
    };

    console.log("Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (err) {
    console.error("Error analyzing data or sending email:", err);
  }
};

const runJob = async () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running scheduled task...");

    try {
      // Define the list of currencies
      const currencies = ["EUR/USD", "GBP/USD", "AUD/USD"];

      // Fetch live data and analyze it
      const liveDataResult = await fetchLiveData(currencies);

      if (liveDataResult) {
        console.log("Live data fetched successfully.");
        await analyzeDataJob(); // Await the email sending process
      } else {
        console.log("Failed to fetch live data.");
      }
    } catch (err) {
      console.error("Error during cron job execution:", err);
    }
  });
};

module.exports = { fetchLiveData, analyzeData, runJob, analyzeDataJob };
