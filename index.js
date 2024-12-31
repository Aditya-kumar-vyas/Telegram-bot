const KiteConnect = require("kiteconnect").KiteConnect;
require("dotenv").config();
const express = require("express");
const apiKey = process.env.API;
const apiSecret = process.env.API_SECRET;

const fs = require("fs");
const access_token = process.env.ACCESS_TOKEN;

const kc = new KiteConnect({ api_key: apiKey });

const app = express();

app.use(express.json());


app.post("/getinstrumentid", (req, res) => {
  const { name } = req.body;

  if ( !name) {
    res.status(400).json({
      message: "Please provide all the details",
    });
  }
  kc.setAccessToken(access_token);
  kc.getInstruments("NSE")
    .then((response) => {
      console.log(response, "instruments");
      const instrumentjson = JSON.stringify(response, null, 2);
      let filename = "insturments ids";
      filename.replace(/[:\s]/g, "_");
      fs.writeFileSync(filename, instrumentjson, "utf8");
      const reqId = response.find((item) => item.tradingsymbol === name);
      if (reqId) {
        console.log("Instrument Token for" + name, reqId.instrument_token);
        res.status(200).json({
          message: "Instrument Token for" + name,
          instrument_token: reqId.instrument_token,
        });
      } else {
        console.log("No instrument found");
        res.status(500).send("No instrument found");
      }
    })
    .catch(e);
  {
    console.log(error);
  }
});

app.post("/gethistorybyinstrumentid" , async (req, res) => {
  const {
   
    instrumentToken,
    interval,
    fromDate,
    toDate,
    continuous,
  } = req.body;
  if ( !instrumentToken || !interval || !fromDate || !toDate) {
    res.status(400).json({
      message: "Please provide all the details",
    });
  }
  try {
    kc.setAccessToken(access_token);
    const history = await kc.getHistoricalData(instrumentToken, fromDate, toDate, interval);
    res.status(200).json({
      message: "History",
      data: history
    });

    const historyjson = JSON.stringify(history, null, 2);
    let filename = `${instrumentToken}_${fromDate}_${toDate}_${interval}`;
    filename = filename.replace(/[:\s]/g, "_");
    fs.writeFileSync(filename, historyjson, "utf8");

  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }

});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});












//   try {
//     kc.setAccessToken(access_token);
//     const history = await kc.getHistoricalData(
//       instrumentToken,
//       fromDate,
//       toDate,
//       interval,
//       continuous
//     );

//     console.log(history)
//     res.status(200).json({
//       message: "History",
//     });

//     const historyjson = JSON.stringify(history, null, 2);
//     let filename = `${instrumentToken}_${fromDate}_${toDate}_${interval}`;
//     filename.replace(/[:\s]/g, "_");
//     fs.writeFileSync(filename, historyjson, "utf8");
//   } catch (e) {
//     console.log(e);
//     res.status(500).send("Internal server error");
//   }