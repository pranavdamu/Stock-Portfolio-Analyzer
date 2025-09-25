export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class TechnicalAnalysisService {
  // Simple Moving Average
  calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Exponential Moving Average
  calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  // Relative Strength Index
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        gains += changes[i];
      } else {
        losses += Math.abs(changes[i]);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate subsequent averages using smoothing
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // MACD (Moving Average Convergence Divergence)
  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;

    // For signal line, we need MACD history (simplified here)
    const signal = macd * 0.9; // Simplified signal calculation
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  // Bollinger Bands
  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period);

    if (prices.length < period) {
      return { upper: 0, middle: sma, lower: 0 };
    }

    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
    };
  }

  // Support and Resistance levels
  calculateSupportResistance(data: PriceData[]): { support: number; resistance: number } {
    if (data.length < 10) {
      const prices = data.map(d => d.close);
      return {
        support: Math.min(...prices),
        resistance: Math.max(...prices),
      };
    }

    const prices = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);

    // Find local maxima and minima
    const resistanceLevels: number[] = [];
    const supportLevels: number[] = [];

    for (let i = 2; i < data.length - 2; i++) {
      // Local maxima (resistance)
      if (highs[i] > highs[i-1] && highs[i] > highs[i+1] &&
          highs[i] > highs[i-2] && highs[i] > highs[i+2]) {
        resistanceLevels.push(highs[i]);
      }

      // Local minima (support)
      if (lows[i] < lows[i-1] && lows[i] < lows[i+1] &&
          lows[i] < lows[i-2] && lows[i] < lows[i+2]) {
        supportLevels.push(lows[i]);
      }
    }

    const currentPrice = prices[prices.length - 1];

    // Find nearest support and resistance
    const nearestResistance = resistanceLevels
      .filter(level => level > currentPrice)
      .sort((a, b) => a - b)[0] || Math.max(...prices);

    const nearestSupport = supportLevels
      .filter(level => level < currentPrice)
      .sort((a, b) => b - a)[0] || Math.min(...prices);

    return {
      support: nearestSupport,
      resistance: nearestResistance,
    };
  }

  // Volatility calculation
  calculateVolatility(prices: number[], period: number = 20): number {
    if (prices.length < period) return 0;

    const recentPrices = prices.slice(-period);
    const returns = [];

    for (let i = 1; i < recentPrices.length; i++) {
      returns.push(Math.log(recentPrices[i] / recentPrices[i - 1]));
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;

    // Annualized volatility (assuming 252 trading days)
    return Math.sqrt(variance * 252) * 100;
  }

  // Determine trend direction
  determineTrend(data: PriceData[]): 'bullish' | 'bearish' | 'neutral' {
    if (data.length < 3) return 'neutral';

    const prices = data.map(d => d.close);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const currentPrice = prices[prices.length - 1];

    // Check price vs moving averages
    const aboveSMA20 = currentPrice > sma20;
    const aboveSMA50 = currentPrice > sma50;
    const sma20AboveSMA50 = sma20 > sma50;

    // Check recent price momentum
    const recentPrices = prices.slice(-5);
    const priceIncrease = recentPrices[recentPrices.length - 1] > recentPrices[0];

    if (aboveSMA20 && aboveSMA50 && sma20AboveSMA50 && priceIncrease) {
      return 'bullish';
    } else if (!aboveSMA20 && !aboveSMA50 && !sma20AboveSMA50 && !priceIncrease) {
      return 'bearish';
    } else {
      return 'neutral';
    }
  }

  // Main analysis function
  analyzeStock(data: PriceData[]): TechnicalIndicators {
    if (!data || data.length === 0) {
      throw new Error('No data provided for technical analysis');
    }

    const prices = data.map(d => d.close);
    const { support, resistance } = this.calculateSupportResistance(data);
    const { macd, signal, histogram } = this.calculateMACD(prices);
    const bollinger = this.calculateBollingerBands(prices);

    return {
      sma20: this.calculateSMA(prices, 20),
      sma50: this.calculateSMA(prices, 50),
      ema12: this.calculateEMA(prices, 12),
      ema26: this.calculateEMA(prices, 26),
      rsi: this.calculateRSI(prices),
      macd,
      macdSignal: signal,
      macdHistogram: histogram,
      bollinger,
      support,
      resistance,
      trend: this.determineTrend(data),
      volatility: this.calculateVolatility(prices),
    };
  }

  // Convert technical analysis to 0-100 score
  technicalToScore(indicators: TechnicalIndicators, currentPrice: number): number {
    let score = 50; // Start neutral

    // RSI scoring (30-70 is good range)
    if (indicators.rsi > 30 && indicators.rsi < 70) {
      score += 10;
    } else if (indicators.rsi < 30) {
      score += 15; // Oversold - potential buy
    } else if (indicators.rsi > 70) {
      score -= 15; // Overbought - potential sell
    }

    // Moving average trend
    if (indicators.sma20 > indicators.sma50) {
      score += 15; // Bullish crossover
    } else {
      score -= 15; // Bearish crossover
    }

    // Price vs moving averages
    if (currentPrice > indicators.sma20) score += 10;
    if (currentPrice > indicators.sma50) score += 5;

    // MACD
    if (indicators.macd > indicators.macdSignal) {
      score += 10; // Bullish MACD
    } else {
      score -= 10; // Bearish MACD
    }

    // Trend direction
    switch (indicators.trend) {
      case 'bullish':
        score += 20;
        break;
      case 'bearish':
        score -= 20;
        break;
      default:
        // neutral - no change
        break;
    }

    // Volatility penalty for high volatility
    if (indicators.volatility > 50) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export const technicalAnalysisService = new TechnicalAnalysisService();