function predictNextDirection(candleData) {
    const resistanceLevels = [];
    const supportLevels = [];

    // Utility function to find trend direction using a moving average for better trend detection
    function detectTrend(data, period = 10) {
        if (data.length < period) return "flat";  // Not enough data for the period
        const movingAverage = data.slice(-period).reduce((sum, candle) => sum + candle.c, 0) / period;
        const lastClose = data[data.length - 1].c;
        return lastClose > movingAverage ? "up" : lastClose < movingAverage ? "down" : "flat";
    }

    // Utility function to detect resistance and support levels
    function detectLevels(data) {
        let resistance = Math.max(...data.map(candle => candle.h));
        let support = Math.min(...data.map(candle => candle.l));
        return { resistance, support };
    }

    // Utility function to check if there's a breakout above resistance or below support
    function isBreakout(data, level, direction) {
        const lastClose = data[data.length - 1].c;
        return direction === "up" ? lastClose > level : lastClose < level;
    }

    // Get trend direction based on the past candles
    const trend = detectTrend(candleData, 10);

    // Detect key levels of resistance and support
    const levels = detectLevels(candleData);
    resistanceLevels.push(levels.resistance);
    supportLevels.push(levels.support);

    // Determine the next direction
    if (trend === "up" && isBreakout(candleData, levels.resistance, "up")) {
        return "up";
    } else if (trend === "down" && isBreakout(candleData, levels.support, "down")) {
        return "down";
    } else {
        return trend;  // Either "up," "down," or "flat"
    }
}


function predictNextCandleDirection(data) {
    if (data.length < 2) {
        throw new Error('Not enough data to make a prediction');
    }

    // Calculate the average change in the last few candles
    let totalChange = 0;
    for (let i = 1; i < data.length; i++) {
        let prevClose = data[i - 1].c;
        let currClose = data[i].c;
        totalChange += currClose - prevClose;
    }

    // Determine the average change
    let avgChange = totalChange / (data.length - 1);

    // Predict direction based on average change
    if (avgChange > 0) {
        return 'up';  // Predict upward movement
    } else if (avgChange < 0) {
        return 'down'; // Predict downward movement
    } else {
        return 'flat'; // No clear trend
    }
}

function predictNextCandleDirectionSecond(data) {
    if (data.length < 2) {
        throw new Error('Not enough data to make a prediction');
    }

    // Calculate the average change in the last few candles
    let totalChange = 0;
    for (let i = 1; i < data.length; i++) {
        let prevClose = data[i - 1].c;
        let currClose = data[i].c;
        totalChange += currClose - prevClose;
    }

    // Determine the average change
    let avgChange = totalChange / (data.length - 1);

    // Predict direction based on average change
    if (avgChange > 0) {
        return 'up';  // Predict upward movement
    } else if (avgChange < 0) {
        return 'down'; // Predict downward movement
    } else {
        return 'flat'; // No clear trend
    }
}

// Helper functions to calculate technical indicators
function calculateWMA(period, data) {
    if (data.length < period) throw new Error("Not enough data to calculate WMA");
    let weightSum = 0, weightedPriceSum = 0;
    for (let i = 0; i < period; i++) {
        const weight = period - i;
        weightedPriceSum += data[i].c * weight;
        weightSum += weight;
    }
    return weightedPriceSum / weightSum;
}

function calculateEMA(period, data) {
    if (data.length < period) throw new Error("Not enough data to calculate EMA");
    const k = 2 / (period + 1);
    let ema = data[0].c; // Initialize EMA with the first closing price
    for (let i = 1; i < data.length; i++) {
        ema = data[i].c * k + ema * (1 - k);
    }
    return ema;
}

function calculateMACD(data, shortPeriod, longPeriod, signalPeriod) {
    if (data.length < Math.max(shortPeriod, longPeriod, signalPeriod)) throw new Error("Not enough data to calculate MACD");
    const shortEMA = calculateEMA(shortPeriod, data);
    const longEMA = calculateEMA(longPeriod, data);
    const macdLine = shortEMA - longEMA;
    const signalLine = calculateEMA(signalPeriod, data.map((_, i) => i === 0 ? macdLine : macdLine));
    return { macdLine, signalLine };
}

function calculateVortex(data, period) {
    if (data.length < period) throw new Error("Not enough data to calculate Vortex");
    let vmPlus = 0, vmMinus = 0;
    for (let i = 1; i < period; i++) {
        vmPlus += Math.abs(data[i].h - data[i - 1].l);
        vmMinus += Math.abs(data[i].l - data[i - 1].h);
    }
    return { vmPlus, vmMinus };
}

// Predict next candle movement (up, down, or flat)
function predictNextCandle(data) {
    // Indicator parameters
    const wmaPeriod = 5;
    const macdParams = { shortPeriod: 3, longPeriod: 5, signalPeriod: 2 };
    const vortexPeriod = 2;

    // Ensure we have enough data
    if (data.length < Math.max(wmaPeriod, macdParams.longPeriod, vortexPeriod)) {
        throw new Error("Not enough candle data to predict");
    }

    // Calculate indicators
    const wma = calculateWMA(wmaPeriod, data);
    const { macdLine, signalLine } = calculateMACD(data, macdParams.shortPeriod, macdParams.longPeriod, macdParams.signalPeriod);
    const { vmPlus, vmMinus } = calculateVortex(data, vortexPeriod);

    // Get the last candle
    const lastCandle = data[data.length - 1];

    // Prediction logic based on indicators
    if (lastCandle.c > wma && macdLine > signalLine && vmPlus > vmMinus) {
        return "up";
    } else if (lastCandle.c < wma && macdLine < signalLine && vmPlus < vmMinus) {
        return "down";
    } else {
        return "flat";
    }
}

// Calculate Simple Moving Average (SMA) for a given period
function calculateSMANews(period, data) {
    if (data.length < period) return null;  // Not enough data for this period
    const relevantData = data.slice(-period);  // Get the last 'period' candles
    const sum = relevantData.reduce((acc, candle) => acc + candle.c, 0);
    return sum / period;
}

// Detect Fractal (using simple high/low conditions)
function detectFractalNews(data, index) {
    if (index < 2) return null;  // Not enough data for a fractal at this index
    const current = data[index];
    const prev1 = data[index - 1];
    const prev2 = data[index - 2];

    // Check for a green fractal (potential downward trend)
    if (prev2.h < prev1.h && prev1.h < current.h) {
        return 'green';  // Bearish signal
    }
    
    // Check for a red fractal (potential upward trend)
    if (prev2.l > prev1.l && prev1.l > current.l) {
        return 'red';  // Bullish signal
    }

    return null;  // No fractal detected
}

// Predict the next direction using fractals and moving averages
function predictNextDirectionNews(candleData) {
    // Indicator Parameters
    const maShortPeriod = 4;
    const maLongPeriod = 8;

    // Calculate current moving averages
    const shortMA = calculateSMANews(maShortPeriod, candleData);
    const longMA = calculateSMANews(maLongPeriod, candleData);

    // Detect the most recent fractal in the data
    const fractal = detectFractalNews(candleData, candleData.length - 1);

    // Calculate the previous moving averages (for crossover detection)
    const shortMA_prev = calculateSMANews(maShortPeriod, candleData.slice(0, -1));
    const longMA_prev = calculateSMANews(maLongPeriod, candleData.slice(0, -1));

    // Check if both moving averages are calculated successfully
    if (shortMA === null || longMA === null || shortMA_prev === null || longMA_prev === null) {
        return 'flat';  // Not enough data to make a prediction
    }

    // Fractal and MA crossover strategy for prediction
    if (fractal === 'green' && shortMA < longMA && shortMA_prev > longMA_prev) {
        return 'down';  // Bearish trend (price drop expected)
    } else if (fractal === 'red' && shortMA > longMA && shortMA_prev < longMA_prev) {
        return 'up';  // Bullish trend (price rise expected)
    } else {
        return 'flat';  // No clear signal, so predict sideways movement
    }
}


// Helper function to calculate moving average
function movingAverage(data, period) {
    return data.slice(-period).reduce((sum, value) => sum + value.c, 0) / period;
}

// Function to calculate the ATR (Average True Range)
function calculateATR(data, period) {
    let atrSum = 0;
    for (let i = 1; i < period; i++) {
        let trueRange = Math.max(
            data[i].h - data[i].l,
            Math.abs(data[i].h - data[i - 1].c),
            Math.abs(data[i].l - data[i - 1].c)
        );
        atrSum += trueRange;
    }
    return atrSum / period;
}

// Main function to predict the next candle movement
function predictNextCandle5(data) {
    const keltnerMultiplier = 2;
    const atrPeriod = 14;
    const emaPeriod = 20;

    // Calculate moving averages
    const ma5 = movingAverage(data, 5);
    const ma10 = movingAverage(data, 10);

    // Calculate Keltner Channel
    const ema = movingAverage(data, emaPeriod);
    const atr = calculateATR(data, atrPeriod);
    const upperKeltner = ema + keltnerMultiplier * atr;
    const lowerKeltner = ema - keltnerMultiplier * atr;

    // Determine the current price
    const currentPrice = data[data.length - 1].c;

    // Decision logic to predict next candle movement
    if (ma5 > ma10 && currentPrice < lowerKeltner) {
        return 'Up';
    } else if (ma5 < ma10 && currentPrice > upperKeltner) {
        return 'Down';
    } else {
        return 'Flat';
    }
}

// Helper function to calculate moving average
function movingAverages(data, period) {
    return data.slice(-period).reduce((sum, value) => sum + value.c, 0) / period;
}

// Helper function to calculate EMA
function calculateEMAs(data, period) {
    let multiplier = 2 / (period + 1);
    let ema = data[0].c; // start EMA with the first close price
    for (let i = 1; i < data.length; i++) {
        ema = ((data[i].c - ema) * multiplier) + ema;
    }
    return ema;
}

// MACD Calculation
function calculateMACDs(data, fastPeriod, slowPeriod, signalPeriod) {
    let fastEMA = calculateEMAs(data, fastPeriod);
    let slowEMA = calculateEMAs(data, slowPeriod);
    let macd = fastEMA - slowEMA;
    let signal = calculateEMAs([{ c: macd }], signalPeriod); // calculating signal line
    return { macd, signal };
}

// Vortex Indicator Calculation
function calculateVortexs(data, period) {
    let positiveVortex = 0;
    let negativeVortex = 0;

    for (let i = 1; i < period; i++) {
        let positiveMovement = Math.abs(data[i].h - data[i - 1].l);
        let negativeMovement = Math.abs(data[i].l - data[i - 1].h);
        positiveVortex += positiveMovement;
        negativeVortex += negativeMovement;
    }

    return { positiveVortex, negativeVortex };
}

// Supertrend (placeholder logic, needs more data for proper calculation)
function calculateSupertrends(data) {
    let trend = "up"; // Assuming we get a trend from an external Supertrend function
    return trend;
}

// Updated main function to predict the next 5-minute candle direction
function predictNextCandleDirection6(data) {
    // Calculate indicators
    const ma100 = movingAverages(data, 100); // 100-period moving average
    const { macd, signal } = calculateMACDs(data, 10, 22, 9); // MACD
    const { positiveVortex, negativeVortex } = calculateVortexs(data, 14); // Vortex indicator
    const supertrend = calculateSupertrends(data); // Supertrend

    // Determine trend direction based on 100-period moving average
    let trendDirection = ma100 > data[data.length - 1].c ? "down" : "up"; // MA direction

    // Decision logic to predict the next 5-minute candle's direction
    if (macd > signal && positiveVortex > negativeVortex && supertrend === "up") {
        return "Up";
    } else if (macd < signal && negativeVortex > positiveVortex && supertrend === "down") {
        return "Down";
    } else {
        return trendDirection; // Default to the trend direction from MA100
    }
}

// Function to calculate RSI
function calculateRSI(data, period = 14) {
    let gains = 0, losses = 0;
    
    for (let i = 1; i < data.length; i++) {
        const change = data[i].c - data[i - 1].c;
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// Function to predict next candle movement
function predictNextCandle7(data) {
    const rsi = calculateRSI(data);
    const lastClose = data[data.length - 1].c;
    const prevClose = data[data.length - 2].c;
    
    // Based on RSI levels
    if (rsi > 70) {
        return "Down (Overbought)";
    } else if (rsi < 30) {
        return "Up (Oversold)";
    } else {
        // Analyze trend by comparing last two candles
        if (lastClose > prevClose) {
            return "Up";
        } else if (lastClose < prevClose) {
            return "Down";
        } else {
            return "Flat";
        }
    }
}

// EMA Calculation function
function calculateEMASecond(prices, period) {
  const multiplier = 2 / (period + 1);
  let ema = [prices[0]];  // Initialize the first EMA value with the first price
  for (let i = 1; i < prices.length; i++) {
    ema.push(((prices[i] - ema[i - 1]) * multiplier) + ema[i - 1]);
  }
  return ema;
}

// Parabolic SAR Calculation
function calculateParabolicSARSecond(candles, accelerationFactor = 0.02, maxAcceleration = 0.2) {
  let sar = candles[0].l;  // Start SAR at the low of the first candle
  let ep = candles[0].h;   // Extreme point (highest high for uptrend)
  let af = accelerationFactor;
  let uptrend = true;
  let parabolicSAR = [];

  for (let i = 1; i < candles.length; i++) {
    sar = sar + af * (ep - sar);

    if (uptrend) {
      if (candles[i].l < sar) {
        uptrend = false;  // Trend reversal
        sar = ep;
        ep = candles[i].l;
        af = accelerationFactor;
      }
      if (candles[i].h > ep) {
        ep = candles[i].h;
        af = Math.min(af + accelerationFactor, maxAcceleration);  // Adjust AF
      }
    } else {
      if (candles[i].h > sar) {
        uptrend = true;  // Trend reversal
        sar = ep;
        ep = candles[i].h;
        af = accelerationFactor;
      }
      if (candles[i].l < ep) {
        ep = candles[i].l;
        af = Math.min(af + accelerationFactor, maxAcceleration);
      }
    }
    parabolicSAR.push(sar);  // Store SAR for this candle
  }
  return parabolicSAR;
}

// Prediction function: Incorporates EMA and Parabolic SAR
function predictNextCandle8(candles) {
  const closes = candles.map(c => c.c);
  
  // Calculate EMAs
  const ema5 = calculateEMASecond(closes, 5);
  const ema20 = calculateEMASecond(closes, 20);
  
  // Calculate Parabolic SAR
  const parabolicSAR = calculateParabolicSARSecond(candles);
  
  // Get latest values for decision-making
  const latestClose = closes[closes.length - 1];
  const latestEMA5 = ema5[ema5.length - 1];
  const latestEMA20 = ema20[ema20.length - 1];
  const latestSAR = parabolicSAR[parabolicSAR.length - 1];
  
  // Determine trend direction based on EMA and Parabolic SAR
  const isUptrend = latestClose > latestSAR;
  
  if (latestEMA5 > latestEMA20 && isUptrend) {
    return "Up";
  } else if (latestEMA5 < latestEMA20 && !isUptrend) {
    return "Down";
  } else {
    return "Flat";
  }
}

// Helper function to calculate EMA
function calculateEMANEW(candles, period) {
  let k = 2 / (period + 1);  // Smoothing factor
  let emaArray = [];
  let prevEMA;

  for (let i = 0; i < candles.length; i++) {
    let closePrice = candles[i].c;
    if (i === 0) {
      prevEMA = closePrice;  // Initialize EMA with the first close
    } else {
      prevEMA = (closePrice - prevEMA) * k + prevEMA;  // EMA calculation
    }
    emaArray.push(prevEMA);
  }
  return emaArray;
}

// Helper function to calculate Bollinger Bands
function calculateBollingerBandsNEW(candles, period = 20, stdDevMultiplier = 2) {
  let movingAvg = calculateEMANEW(candles, period);
  let bollingerBands = [];

  for (let i = 0; i < candles.length; i++) {
    let closePrices = candles.slice(Math.max(i - period + 1, 0), i + 1).map(c => c.c);
    let avg = movingAvg[i];

    // Calculate standard deviation
    let variance = closePrices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / period;
    let stdDev = Math.sqrt(variance);

    // Calculate upper and lower Bollinger Bands
    let upperBand = avg + stdDev * stdDevMultiplier;
    let lowerBand = avg - stdDev * stdDevMultiplier;

    bollingerBands.push({ upperBand, lowerBand, middleBand: avg });
  }
  return bollingerBands;
}

// Main function to predict the next 4-5 minute trend
function predictNextCandleNEW(candles) {
  const shortPeriod = 5;  // Short period EMA (for quick trend detection)
  const longPeriod = 20;  // Long period EMA (for broader trend detection)
  
  // Calculate EMAs
  const shortEMA = calculateEMANEW(candles, shortPeriod);
  const longEMA = calculateEMANEW(candles, longPeriod);
  
  // Calculate Bollinger Bands
  const bollingerBands = calculateBollingerBandsNEW(candles, longPeriod);

  // Get the latest candle and indicator values
  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const currentShortEMA = shortEMA[shortEMA.length - 1];
  const currentLongEMA = longEMA[longEMA.length - 1];
  const currentBollinger = bollingerBands[bollingerBands.length - 1];
  
  // Decision logic based on EMA crossover and Bollinger Bands
  if (currentShortEMA > currentLongEMA && lastCandle.c < currentBollinger.middleBand) {
    return "UP";  // Buy signal if short EMA crosses above long EMA and price is below middle Bollinger Band
  } else if (currentShortEMA < currentLongEMA && lastCandle.c > currentBollinger.middleBand) {
    return "DOWN";  // Sell signal if short EMA crosses below long EMA and price is above middle Bollinger Band
  } else {
    return "FLAT";  // No clear trend
  }
}


// Function to calculate WMA (Weighted Moving Average)
function calculateWMASeconds (candles, period) {
  let weights = [];
  let sumWeights = 0;
  
  for (let i = 1; i <= period; i++) {
    weights.push(i);
    sumWeights += i;
  }
  
  let wmaArray = [];
  for (let i = 0; i <= candles.length - period; i++) {
    let sumProduct = 0;
    for (let j = 0; j < period; j++) {
      sumProduct += candles[i + j].c * weights[j];
    }
    let wma = sumProduct / sumWeights;
    wmaArray.push(wma);
  }
  return wmaArray;
}

// Function to calculate Stochastic Oscillator (based on periods %K and %D)
function calculateStochasticSeconds(candles, periodK = 8, periodD = 45) {
  let stochK = [];
  for (let i = periodK - 1; i < candles.length; i++) {
    let highestHigh = Math.max(...candles.slice(i - periodK + 1, i + 1).map(c => c.h));
    let lowestLow = Math.min(...candles.slice(i - periodK + 1, i + 1).map(c => c.l));
    let closePrice = candles[i].c;
    
    let kValue = ((closePrice - lowestLow) / (highestHigh - lowestLow)) * 100;
    stochK.push(kValue);
  }
  
  let stochD = [];
  for (let i = periodD - 1; i < stochK.length; i++) {
    let avgK = stochK.slice(i - periodD + 1, i + 1).reduce((a, b) => a + b, 0) / periodD;
    stochD.push(avgK);
  }
  
  return { stochK, stochD };
}

// Function to calculate Accelerator Oscillator (AO)
function calculateAOSeconds(candles, shortPeriod = 12, longPeriod = 2, smoothingPeriod = 4) {
  let shortSMA = calculateSMASeconds(candles, shortPeriod);
  let longSMA = calculateSMASeconds(candles, longPeriod);
  let ao = shortSMA.map((val, index) => val - longSMA[index]);
  
  let smoothedAO = calculateSMASeconds(ao, smoothingPeriod);
  return smoothedAO;
}

// Helper function to calculate Simple Moving Average (SMA)
function calculateSMASeconds(candles, period) {
  let smaArray = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = candles.slice(i - period + 1, i + 1).reduce((a, b) => a + b.c, 0);
    smaArray.push(sum / period);
  }
  return smaArray;
}

// Predict the next 3-minute candle movement (Up, Down, or Flat)
function predictNextCandleSeconds(candles) {
  let wma = calculateWMASeconds(candles, 40);  // WMA (white line) with period 40
  let { stochK, stochD } = calculateStochasticSeconds(candles);  // Stochastic Oscillator
  let ao = calculateAOSeconds(candles);  // Accelerator Oscillator (AO)
  
  let lastCandle = candles[candles.length - 1];
  let prevCandle = candles[candles.length - 2];
  let currentWMA = wma[wma.length - 1];
  
  // Check conditions:
  let condition1 = lastCandle.c > currentWMA && prevCandle.c < currentWMA;  // Crossed WMA upwards
  let condition2 = stochD[stochD.length - 1] > 80;  // Overbought (expecting a price drop)
  let condition3 = ao[ao.length - 1] < 0;  // Momentum going negative
  
  if (condition1 && condition2 && condition3) {
    return "DOWN";  // Signal to sell
  } else if (stochD[stochD.length - 1] < 20 && ao[ao.length - 1] > 0) {
    return "UP";  // Signal to buy
  } else {
    return "FLAT";  // No clear signal
  }
}

function predictTrend(data) {
  // Bollinger Bands setup (standard values)
  const bollingerPeriod = 20;
  const bollingerMultiplier = 2;

  // Function to calculate Bollinger Bands
  function calculateBollingerBands(data) {
      const length = data.length;
      if (length < bollingerPeriod) return null;

      let sum = 0;
      for (let i = length - bollingerPeriod; i < length; i++) {
          sum += data[i].c;
      }
      const sma = sum / bollingerPeriod;

      let squaredSum = 0;
      for (let i = length - bollingerPeriod; i < length; i++) {
          squaredSum += Math.pow(data[i].c - sma, 2);
      }
      const variance = squaredSum / bollingerPeriod;
      const stdDev = Math.sqrt(variance);

      return {
          upperBand: sma + bollingerMultiplier * stdDev,
          lowerBand: sma - bollingerMultiplier * stdDev,
          middleBand: sma
      };
  }

  // Function to calculate Parabolic SAR (simplified version)
  function calculateParabolicSAR(data) {
      let sar = data[data.length - 1].c;
      let accelerationFactor = 0.02;
      let trend = 'flat';

      for (let i = data.length - 2; i >= 0; i--) {
          sar += accelerationFactor * (data[i].c - sar);
          accelerationFactor = Math.min(accelerationFactor + 0.02, 0.2);

          if (data[i].c > sar) trend = 'up';
          else if (data[i].c < sar) trend = 'down';
      }
      return trend;
  }

  // Function to calculate ZigZag (with dynamic threshold)
  function calculateZigZag(data) {
      const length = data.length;
      const threshold = 0.001 * data[length - 1].c;

      let trend = 'flat';
      if (length >= 2) {
          const lastClose = data[length - 1].c;
          const secondLastClose = data[length - 2].c;

          if (Math.abs(lastClose - secondLastClose) > threshold) {
              trend = lastClose > secondLastClose ? 'up' : 'down';
          }
      }
      return trend;
  }

  // Function to calculate RSI
  function calculateRSI(data, period = 14) {
      if (data.length < period) return null;

      let gains = 0, losses = 0;

      for (let i = data.length - period; i < data.length; i++) {
          let change = data[i].c - data[i - 1].c;
          if (change > 0) {
              gains += change;
          } else {
              losses -= change; // losses are positive
          }
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;

      if (avgLoss === 0) return 100; // Prevent division by zero
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      return rsi;
  }

  // Step 1: Calculate Bollinger Bands
  const bollingerBands = calculateBollingerBands(data);
  if (!bollingerBands) {
      return "Insufficient data for Bollinger Bands";
  }

  // Step 2: Get latest price close and check against Bollinger Bands
  const latestClose = data[data.length - 1].c;
  let bollingerSignal = 'flat';

  if (latestClose > bollingerBands.upperBand) {
      bollingerSignal = 'down'; // Overbought
  } else if (latestClose < bollingerBands.lowerBand) {
      bollingerSignal = 'up'; // Oversold
  } else if (latestClose > bollingerBands.middleBand) {
      bollingerSignal = 'up';
  } else if (latestClose < bollingerBands.middleBand) {
      bollingerSignal = 'down';
  }

  // Step 3: Calculate Parabolic SAR signal
  const parabolicSARSignal = calculateParabolicSAR(data);

  // Step 4: Calculate ZigZag signal
  const zigZagSignal = calculateZigZag(data);

  // Step 5: Calculate RSI
  const rsi = calculateRSI(data);
  let rsiSignal = 'flat';
  if (rsi !== null) {
      if (rsi > 70) {
          rsiSignal = 'down'; // Overbought
      } else if (rsi < 30) {
          rsiSignal = 'up'; // Oversold
      }
  }

  // Step 6: Combine signals
  let upVotes = 0, downVotes = 0;

  if (bollingerSignal === 'up') upVotes++;
  else if (bollingerSignal === 'down') downVotes++;

  if (parabolicSARSignal === 'up') upVotes++;
  else if (parabolicSARSignal === 'down') downVotes++;

  if (zigZagSignal === 'up') upVotes++;
  else if (zigZagSignal === 'down') downVotes++;

  if (rsiSignal === 'up') upVotes++;
  else if (rsiSignal === 'down') downVotes++;

  // Majority confirmation logic
  if (upVotes > downVotes) return "up";
  if (downVotes > upVotes) return "down";
  return "flat";
}


function analyzeTrend(data) {
  if (data.length < 2) {
      throw new Error("Not enough data to analyze");
  }

  // Helper function to calculate the percentage change
  function percentageChange(start, end) {
      return ((end - start) / start) * 100;
  }

  // Calculate the percentage change from the beginning to the end of the data
  const firstPrice = data[data.length - 1].c; // Closing price of the earliest entry
  const lastPrice = data[0].c; // Closing price of the latest entry

  const change = percentageChange(firstPrice, lastPrice);
  const isUptrend = change > 0;

  // Provide analysis based on trend direction
  return isUptrend ? 'up' : 'down'
}

function calculateEMAThree(prices, period) {
  const k = 2 / (period + 1);
  return prices.reduce((acc, price, index) => {
      if (index === 0) return [price];
      acc.push((price - acc[index - 1]) * k + acc[index - 1]);
      return acc;
  }, []);
}

function macdStrategyThree(data) {
  const closePrices = data.map(candle => candle.c);
  const ema12 = calculateEMAThree(closePrices, 12);
  const ema26 = calculateEMAThree(closePrices, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMAThree(macdLine, 9);
  
  const latestMacd = macdLine[macdLine.length - 1];
  const latestSignal = signalLine[signalLine.length - 1];
  
  if (latestMacd > latestSignal) {
      return 'up';
  } else if (latestMacd < latestSignal) {
      return 'down';
  } else {
      return 'flat';
  }
}

function rsiStrategyThree(data) {
  const closePrices = data.map(candle => candle.c);
  const period = 14;
  let gains = 0, losses = 0;
  
  for (let i = 1; i <= period; i++) {
      const change = closePrices[i] - closePrices[i - 1];
      if (change > 0) {
          gains += change;
      } else {
          losses -= change;
      }
  }
  
  const averageGain = gains / period;
  const averageLoss = losses / period;
  
  const rs = averageGain / averageLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  if (rsi > 70) {
      return 'down';  // Overbought
  } else if (rsi < 30) {
      return 'up';    // Oversold
  } else {
      return 'flat';
  }
}

function bollingerBandsStrategyThree(data) {
  const closePrices = data.map(candle => candle.c);
  const period = 20;
  const sma = closePrices.slice(-period).reduce((a, b) => a + b) / period;
  const squaredDiffs = closePrices.slice(-period).map(price => Math.pow(price - sma, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b) / period);
  
  const upperBand = sma + (stdDev * 2);
  const lowerBand = sma - (stdDev * 2);
  const lastClose = closePrices[closePrices.length - 1];
  
  if (lastClose > upperBand) {
      return 'down';  // Price is outside the upper band
  } else if (lastClose < lowerBand) {
      return 'up';    // Price is outside the lower band
  } else {
      return 'flat';
  }
}


// Function to calculate Parabolic SAR
function calculateParabolicSARTechnical(data, accelerationFactor = 0.02, maxAccelerationFactor = 0.2) {
  let sar = data[0].h; // Initial SAR value
  let af = accelerationFactor;
  let ep = data[0].l; // Extreme point (lowest low in an uptrend)
  let isUptrend = true; // Start with an uptrend

  const sarValues = [];

  for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      // Update SAR
      sar = sar + af * (ep - sar);

      // Update extreme point and acceleration factor
      if (isUptrend) {
          if (curr.l < ep) {
              ep = curr.l;
              af = Math.min(af + accelerationFactor, maxAccelerationFactor);
          }
      } else {
          if (curr.h > ep) {
              ep = curr.h;
              af = Math.min(af + accelerationFactor, maxAccelerationFactor);
          }
      }

      // Check for trend reversal
      if (isUptrend && curr.c < sar) {
          isUptrend = false;
          sar = ep;
          ep = curr.h;
          af = accelerationFactor;
      } else if (!isUptrend && curr.c > sar) {
          isUptrend = true;
          sar = ep;
          ep = curr.l;
          af = accelerationFactor;
      }

      sarValues.push(sar);
  }

  return sarValues;
}

// Function to calculate Rate of Change (ROC)
function calculateROCTechnical(data, period = 14) {
  let rocValues = [];

  for (let i = period; i < data.length; i++) {
      let previousPrice = data[i - period].c;
      let currentPrice = data[i].c;
      let roc = ((currentPrice - previousPrice) / previousPrice) * 100;
      rocValues.push(roc);
  }

  return rocValues;
}

// Function to generate trading signal based on Parabolic SAR and ROC
function generateSignal(data) {
  const sarValues = calculateParabolicSARTechnical(data);
  const rocValues = calculateROCTechnical(data);

  const lastSAR = sarValues[sarValues.length - 1];
  const lastPrice = data[data.length - 1].c;
  const lastROC = rocValues[rocValues.length - 1];

  let signal = 'flat'; // Default signal

  if (lastSAR > lastPrice && lastROC < 0) {
      signal = 'PUT'; // Downward trade
  } else if (lastSAR < lastPrice && lastROC > 0) {
      signal = 'CALL'; // Upward trade
  }

  return signal;
}

function calculateTypicalPrice(high, low, close) {
  return (high + low + close) / 3;
}

// Calculate the CCI
function calculateCCITechnical(data, period = 14) {
  if (data.length < period) return [];

  const cci = [];
  const typicalPrices = data.map(d => calculateTypicalPrice(d.h, d.l, d.c));

  // Calculate SMA of typical prices
  for (let i = period - 1; i < typicalPrices.length; i++) {
      const slice = typicalPrices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b) / period;

      // Mean deviation
      const meanDeviation = slice.reduce((a, b) => a + Math.abs(b - sma), 0) / period;

      // CCI Calculation
      const cciValue = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
      cci.push(cciValue);
  }

  return cci;
}

// Function to predict the signal
function predictSignalTechnical(data) {
  const period = 14;
  const cci = calculateCCITechnical(data, period);
  
  if (cci.length === 0) return 'Flat'; // Not enough data to calculate CCI

  const lastCCI = cci[cci.length - 1];

  // Calculate the Alligator lines (simplified for this example)
  const alligatorLines = {
      greenLine: data[data.length - 1].c, // Replace with actual calculation
      redLine: data[data.length - 2].c,   // Replace with actual calculation
      blueLine: data[data.length - 3].c   // Replace with actual calculation
  };

  // Debugging prints
  console.log("Alligator Lines:", alligatorLines);
  console.log("Last CCI:", lastCCI);

  // Determine crossing logic (simplified for example)
  const greenCrossRed = alligatorLines.greenLine < alligatorLines.redLine;
  const greenCrossBlue = alligatorLines.greenLine < alligatorLines.blueLine;
  const cciBelowZero = lastCCI < 0;

  if (greenCrossRed && greenCrossBlue && cciBelowZero) {
      return 'Down'; // PUT Signal
  } else if (!greenCrossRed && !greenCrossBlue && !cciBelowZero) {
      return 'Up'; // CALL Signal
  } else {
      return 'Flat'; // No clear signal
  }
}

// Utility functions for EMA and MACD
function calculateEMASS(prices, period) {
  const k = 2 / (period + 1);
  let ema = [];
  // Start with the simple moving average (SMA) for the initial value
  let sum = prices.slice(0, period).reduce((acc, val) => acc + val, 0);
  ema.push(sum / period);
  
  for (let i = period; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[ema.length - 1] * (1 - k));
  }
  return ema;
}

function calculateMACDSS(prices) {
  const ema12 = calculateEMASS(prices, 12);
  const ema26 = calculateEMASS(prices, 26);
  const macdLine = ema12.slice(ema12.length - ema26.length).map((value, index) => value - ema26[index]);
  const signalLine = calculateEMASS(macdLine, 9);
  const histogram = macdLine.slice(macdLine.length - signalLine.length).map((value, index) => value - signalLine[index]);
  return { macdLine, signalLine, histogram };
}

function calculateParabolicSARSS(data) {
  const AF = 0.02; // Acceleration Factor
  const maxAF = 0.2; // Maximum Acceleration Factor

  let sar = [data[0].l]; // Initial SAR value
  let trend = 'up'; // Initial trend direction
  let EP = data[0].h; // Extreme Point (high or low)
  let AF_current = AF;

  for (let i = 1; i < data.length; i++) {
      let previousSAR = sar[i - 1];
      if (trend === 'up') {
          sar.push(previousSAR + AF_current * (EP - previousSAR));
          if (data[i].l < sar[i]) {
              trend = 'down';
              EP = data[i].l;
              AF_current = AF;
          } else {
              EP = Math.max(EP, data[i].h);
              AF_current = Math.min(AF_current + AF, maxAF);
          }
      } else {
          sar.push(previousSAR + AF_current * (EP - previousSAR));
          if (data[i].h > sar[i]) {
              trend = 'up';
              EP = data[i].h;
              AF_current = AF;
          } else {
              EP = Math.min(EP, data[i].l);
              AF_current = Math.min(AF_current + AF, maxAF);
          }
      }
  }
  return sar;
}

// Main function to predict the next signal
function predictSignalSS(data) {
  const prices = data.map(d => d.c);

  // Calculate MACD
  const { macdLine, signalLine, histogram } = calculateMACDSS(prices);
  const latestHistogram = histogram[histogram.length - 1];
  const previousHistogram = histogram[histogram.length - 2];

  // Calculate EMA (9-period)
  const ema9 = calculateEMASS(prices, 9);

  // Calculate Parabolic SAR
  const sar = calculateParabolicSARSS(data);

  // Get the latest values
  const latestEMA = ema9[ema9.length - 1];
  const latestSAR = sar[sar.length - 1];
  const latestPrice = data[data.length - 1].c;

  // Determine signal
  let signal = 'flat'; // Default signal

  if (latestHistogram > 0 && previousHistogram <= 0 && latestSAR < latestPrice && latestEMA < latestPrice) {
      signal = 'up'; // Buy signal
  } else if (latestHistogram < 0 && previousHistogram >= 0 && latestSAR > latestPrice && latestEMA > latestPrice) {
      signal = 'down'; // Sell signal
  }

  return signal;
}

function calculateSMAEliza(data, period) {
    const sma = [];
    for (let i = 0; i <= data.length - period; i++) {
        const slice = data.slice(i, i + period);
        const avg = slice.reduce((acc, curr) => acc + curr.c, 0) / period;
        sma.push(avg);
    }
    return sma;
}

function calculateRSIEliza(data, period) {
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < period; i++) {
        const change = data[i].c - data[i - 1].c;
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
}

function predictNextSignalEliza(data) {
    // Define periods for the alligator moving averages
    const alligatorShortPeriod = 5;
    const alligatorMediumPeriod = 8;
    const alligatorLongPeriod = 13;
    const rsiPeriod = 35;
    
    // Calculate SMA for each period
    const shortSMA = calculateSMAEliza(data, alligatorShortPeriod);
    const mediumSMA = calculateSMAEliza(data, alligatorMediumPeriod);
    const longSMA = calculateSMAEliza(data, alligatorLongPeriod);
    
    // Calculate RSI
    const rsi = calculateRSIEliza(data, rsiPeriod);
    
    const lastPrice = data[data.length - 1].c;

    // Alligator Crosses Down (downtrend)
    if (shortSMA[shortSMA.length - 1] < longSMA[longSMA.length - 1] &&
        mediumSMA[mediumSMA.length - 1] < longSMA[longSMA.length - 1] &&
        rsi < 50) {
        return "Down";
    }
    
    // Alligator Crosses Up (uptrend)
    if (shortSMA[shortSMA.length - 1] > longSMA[longSMA.length - 1] &&
        mediumSMA[mediumSMA.length - 1] > longSMA[longSMA.length - 1] &&
        rsi > 50) {
        return "Up";
    }
    
    // No clear trend (sideways)
    return "Flat";
}

function predictSignalSHIH(data) {
    try {
        const PERIOD = 5; // Set the period for Donchian Channel
        let donchianUpper = -Infinity;
        let donchianLower = Infinity;
        let stcCurrent = 0; // A simple STC approximation
        
        // Loop through the data to calculate Donchian Channel
        data.forEach((candle, index) => {
            const high = candle.h;
            const low = candle.l;
            // Donchian upper is the highest high in the given period
            donchianUpper = Math.max(donchianUpper, high);
            // Donchian lower is the lowest low in the given period
            donchianLower = Math.min(donchianLower, low);
        });

        // Get the latest candle (most recent data point)
        const latestCandle = data[data.length - 1];
        const priceClose = latestCandle.c;

        // Calculate mid-level for Donchian channel (could be used in strong trends)
        const donchianMid = (donchianUpper + donchianLower) / 2;

        // STC approximation: Check if price is trending (based on momentum)
        if (priceClose > donchianMid) {
            stcCurrent = 1; // Bullish momentum
        } else if (priceClose < donchianMid) {
            stcCurrent = -1; // Bearish momentum
        }

        // Determine the signal based on the Donchian channel and STC indicator
        let signal = "hold";
        if (priceClose >= donchianUpper && stcCurrent === 1) {
            signal = "sell"; // Sell when price hits the upper channel and STC is bearish
        } else if (priceClose <= donchianLower && stcCurrent === -1) {
            signal = "buy";  // Buy when price hits the lower channel and STC is bullish
        } else if (stcCurrent === 1) {
            signal = "up";   // Uptrend, price expected to go higher
        } else if (stcCurrent === -1) {
            signal = "down"; // Downtrend, price expected to go lower
        }

        return signal;
    } catch (error) {
        console.error("Error predicting signal:", error);
        return { error: "Failed to process the data." };
    }
}

// Function to calculate the SMA
function calculateSMAAVI(data, period) {
    let sum = 0;
    for (let i = data.length - period; i < data.length; i++) {
        sum += data[i].c;
    }
    return sum / period;
}

// Function to calculate MACD
function calculateMACDAVI(data) {
    let ema12 = calculateEMAAVI(data, 12);
    let ema26 = calculateEMAAVI(data, 26);
    let macd = ema12 - ema26;
    let signal = calculateEMAAVI([ {c: macd} ], 9); // Assuming the signal line is calculated on MACD values
    return { macd, signal };
}

// Function to calculate EMA
function calculateEMAAVI(data, period) {
    let multiplier = 2 / (period + 1);
    let ema = data[0].c; // Initialize with the first value
    
    for (let i = 1; i < data.length; i++) {
        ema = ((data[i].c - ema) * multiplier) + ema;
    }
    
    return ema;
}

// Function to predict the next 3-4 minutes
function predictNextMinutes(data) {
    try {
        if (data.length < 22) throw new Error("Insufficient data for SMA calculations.");
        
        // Calculate SMAs
        let sma5 = calculateSMAAVI(data, 5);
        let sma22 = calculateSMAAVI(data, 22);

        // Calculate MACD
        let { macd, signal } = calculateMACDAVI(data);

        // Determine trend based on SMA
        let trend = sma5 > sma22 ? "Up" : "Down";

        // Determine signal
        let macdSignal = macd > signal ? "Buy" : "Sell";

        // Combine signals
        let prediction = (trend === "Up" && macdSignal === "Buy") ? "Up" :
                         (trend === "Down" && macdSignal === "Sell") ? "Down" :
                         "Flat";

        return prediction;

    } catch (error) {
        console.error("Error in prediction:", error.message);
        return "Error";
    }
}


module.exports = {
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
    predictSignalSS,
    predictNextSignalEliza,
    predictSignalSHIH,
    predictNextMinutes
}