const KiteTicker = require("kiteconnect").KiteTicker;
require("dotenv").config();
const moment = require("moment");
const { sendMessage } = require("./lib/telegram");

const apikey = process.env.API;
const accessToken = process.env.ACCESS_TOKEN;
console.log(apikey, accessToken);
const ticker = new KiteTicker({
  api_key: apikey,
  access_token: accessToken,
});

const nifty50token = 8961538;
const candleDuration = 1;
let lastCandleTime = moment().startOf("day");
ticker.connect();
let tickscollection = [];
ticker.on("ticks", (ticks) => {
  const now = moment();
  tickscollection.push(...ticks);
    console.log("Ticks", ticks);

  if (now.diff(lastCandleTime, "minutes") >= candleDuration) {
    const candle = calculateCandleStrength(tickscollection);
    console.log(
      `Candle Data (${lastCandleTime.format("HH:mm")} - ${now.format(
        "HH:mm"
      )}):`,
      candle
    );

    let message = "         Candle Update\n";
    message += `Candle Time: ${lastCandleTime.format("HH:mm")} ${now.format(
      "HH:mm"
    )}\n`;
    message += `Candle Range: ${candle.candleRange}\n`;
    message += `Candle Open: ${candle.open}\n`;
    message += `Candle Close: ${candle.close}\n`;
    message += `Candle Color: ${candle.color}\n`;
    message += `Candle Strength: ${candle.strength}\n`;
    message += `Candle Volume: ${candle.totalVolume}\n`;
    message += `Average Traded Price: ${candle.averageTradedPrice}\n\n`;
    // console.log(message);
    sendMessage(6336058307, message);

    tickscollection = [];
    lastCandleTime = now;
  }
});

ticker.on("connect", (ticks) => {
  console.log("Connected");
  ticker.subscribe([nifty50token]);
  ticker.setMode(ticker.modeFull, [nifty50token]);
});

ticker.on("error", (error) => {
  console.log("Error", error);
});

function calculateCandleStrength(ticks) {
  if (ticks.length === 0) {
    return {
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      strength: 0,
      totalVolume: 0,
      averageTradedPrice :0,
      candleRange: 0,
      color: "none",
    };
  }

  const open = ticks[0].last_price;
  const hight = Math.max(...ticks.map((tick) => tick.ohlc.high));
  const low = Math.min(...ticks.map((tick) => tick.ohlc.low));
  const close = ticks[ticks.length - 1].last_price;
  const startVolume = ticks[0].volume_traded;
  const endVolume = ticks[ticks.length - 1].volume_traded;
   const totalVolume = endVolume - startVolume;
  const bodySize = Math.abs(open - close);
  const candleRange = hight - low;
  const strength = candleRange > 0 ? (bodySize / candleRange).toFixed(2) : 0;
  const color = close > open ? "green" : close < open ? "red" : "doji";
  const averageTradedPrice = (ticks.reduce((sum, tick) => sum + tick.average_traded_price, 0) / ticks.length).toFixed(2);
  return {
    open,
    high: hight,
    low,
    close,
    strength,
    color,
    totalVolume,
    averageTradedPrice,
    candleRange
  };
}
// 7631565757:AAFjhB6xhUTJIntH1AGN3ubYIoxSTc5pIzY
