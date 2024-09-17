const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/index.js");
const { runJob } = require("./controller/data.js");

app.use(cors());
app.use(express.json());

app.use("/api/v1", userRoute);

app.listen(process.env.PORT || 5000, async () => {
    // await runJob()
    console.log("Backend server is running!");
  });