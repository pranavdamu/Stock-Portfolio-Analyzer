export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividend?: number;
  beta?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface FundamentalData {
  symbol: string;
  peRatio: number;
  pegRatio: number;
  priceToBook: number;
  debtToEquity: number;
  returnOnEquity: number;
  returnOnAssets: number;
  profitMargin: number;
  operatingMargin: number;
  revenueGrowth: number;
  earningsGrowth: number;
  currentRatio: number;
  quickRatio: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
}

export interface StockAnalysis {
  symbol: string;
  fundamentalScore: number;
  technicalScore: number;
  sentimentScore: number;
  overallScore: number;
  prediction: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasons: string[];
}

export interface PortfolioStock {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  analysis?: StockAnalysis;
}

export interface Portfolio {
  id: string;
  name: string;
  stocks: PortfolioStock[];
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  createdAt: string;
  updatedAt: string;
}
