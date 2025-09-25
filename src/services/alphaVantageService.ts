import axios from 'axios';
import { StockData, FundamentalData } from '../types';

const API_KEY = 'demo'; // Users will need to replace with their own API key
const BASE_URL = 'https://www.alphavantage.co/query';

export class AlphaVantageService {
  private apiKey: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
  }

  async getStockQuote(symbol: string): Promise<StockData> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey,
        },
      });

      // Check if we hit API limit or got an error
      if (response.data.Note || response.data['Error Message'] || response.data.Information) {
        console.warn('API limit or error, using mock data for stock quote:', symbol);
        return this.getMockStockData(symbol);
      }

      const quote = response.data['Global Quote'];

      if (!quote || Object.keys(quote).length === 0) {
        console.warn('No quote data found, using mock data for:', symbol);
        return this.getMockStockData(symbol);
      }

      return {
        symbol: quote['01. symbol'],
        name: symbol, // Alpha Vantage doesn't provide company name in quote
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        fiftyTwoWeekHigh: parseFloat(quote['03. high']),
        fiftyTwoWeekLow: parseFloat(quote['04. low']),
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      console.log('Falling back to mock stock data for:', symbol);
      return this.getMockStockData(symbol);
    }
  }

  async getFundamentalData(symbol: string): Promise<FundamentalData> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: this.apiKey,
        },
      });

      // Check if we hit API limit or got an error
      if (response.data.Note || response.data['Error Message'] || response.data.Information) {
        console.warn('API limit or error, using mock fundamental data for:', symbol);
        return this.getMockFundamentalData(symbol);
      }

      const overview = response.data;

      if (!overview || Object.keys(overview).length === 0 || !overview.Symbol) {
        console.warn('No fundamental data found, using mock data for:', symbol);
        return this.getMockFundamentalData(symbol);
      }

      return {
        symbol: overview.Symbol,
        peRatio: parseFloat(overview.PERatio) || 0,
        pegRatio: parseFloat(overview.PEGRatio) || 0,
        priceToBook: parseFloat(overview.PriceToBookRatio) || 0,
        debtToEquity: parseFloat(overview.DebtToEquityRatio) || 0,
        returnOnEquity: parseFloat(overview.ReturnOnEquityTTM) || 0,
        returnOnAssets: parseFloat(overview.ReturnOnAssetsTTM) || 0,
        profitMargin: parseFloat(overview.ProfitMargin) || 0,
        operatingMargin: parseFloat(overview.OperatingMarginTTM) || 0,
        revenueGrowth: parseFloat(overview.QuarterlyRevenueGrowthYOY) || 0,
        earningsGrowth: parseFloat(overview.QuarterlyEarningsGrowthYOY) || 0,
        currentRatio: parseFloat(overview.CurrentRatio) || 0,
        quickRatio: parseFloat(overview.QuickRatio) || 0,
      };
    } catch (error) {
      console.error('Error fetching fundamental data:', error);
      console.log('Falling back to mock fundamental data for:', symbol);
      return this.getMockFundamentalData(symbol);
    }
  }

  async searchSymbols(keywords: string): Promise<Array<{symbol: string, name: string}>> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: keywords,
          apikey: this.apiKey,
        },
      });

      const matches = response.data.bestMatches || [];
      
      return matches.slice(0, 10).map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
      }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  async getHistoricalData(symbol: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    try {
      const functionMap = {
        daily: 'TIME_SERIES_DAILY',
        weekly: 'TIME_SERIES_WEEKLY',
        monthly: 'TIME_SERIES_MONTHLY',
      };

      const response = await axios.get(BASE_URL, {
        params: {
          function: functionMap[period],
          symbol: symbol,
          apikey: this.apiKey,
        },
      });

      // Check if we hit API limit or got an error
      if (response.data.Note || response.data['Error Message'] || response.data.Information) {
        console.warn('API limit or error, using mock data for:', symbol);
        return this.getMockHistoricalData(symbol);
      }

      const timeSeriesKey = Object.keys(response.data).find(key =>
        key.includes('Time Series')
      );

      if (!timeSeriesKey) {
        console.warn('No time series data found, using mock data for:', symbol);
        return this.getMockHistoricalData(symbol);
      }

      const timeSeries = response.data[timeSeriesKey];

      if (!timeSeries || Object.keys(timeSeries).length === 0) {
        console.warn('Empty time series data, using mock data for:', symbol);
        return this.getMockHistoricalData(symbol);
      }

      return Object.entries(timeSeries).map(([date, data]: [string, any]) => ({
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume']),
      })).slice(0, 100); // Limit to last 100 data points
    } catch (error) {
      console.error('Error fetching historical data:', error);
      console.log('Falling back to mock data for:', symbol);
      return this.getMockHistoricalData(symbol);
    }
  }

  // Mock historical data for when API is not available
  private getMockHistoricalData(symbol: string) {
    const basePrice = symbol === 'AAPL' ? 150 : symbol === 'GOOGL' ? 100 : 50;
    const data = [];
    const today = new Date();

    for (let i = 99; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% max change per day
      const price = basePrice * (1 + (Math.sin(i / 10) * 0.1) + randomChange);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      data.push({
        date: date.toISOString().split('T')[0],
        open: price * 0.995,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: volume,
      });
    }

    return data;
  }

  // Mock stock quote data for when API is not available
  private getMockStockData(symbol: string): StockData {
    const stockPrices: { [key: string]: number } = {
      'AAPL': 150.25,
      'GOOGL': 102.75,
      'MSFT': 285.50,
      'TSLA': 195.80,
      'AMZN': 125.30,
      'NVDA': 425.60,
      'META': 295.40,
      'NFLX': 380.90,
    };

    const stockNames: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc.',
      'AMZN': 'Amazon.com Inc.',
      'NVDA': 'NVIDIA Corporation',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
    };

    const basePrice = stockPrices[symbol] || 50 + Math.random() * 100;
    const change = (Math.random() - 0.5) * 10; // ±$5 change
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      name: stockNames[symbol] || `${symbol} Corporation`,
      price: basePrice + change,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 50000000) + 5000000,
      fiftyTwoWeekHigh: basePrice * 1.3,
      fiftyTwoWeekLow: basePrice * 0.7,
    };
  }

  // Mock fundamental data for when API is not available
  private getMockFundamentalData(symbol: string): FundamentalData {
    const fundamentalData: { [key: string]: Partial<FundamentalData> } = {
      'AAPL': {
        peRatio: 28.5,
        pegRatio: 1.2,
        priceToBook: 8.9,
        debtToEquity: 0.6,
        returnOnEquity: 0.45,
        returnOnAssets: 0.18,
        profitMargin: 0.25,
        operatingMargin: 0.28,
        revenueGrowth: 0.08,
        earningsGrowth: 0.12,
        currentRatio: 1.1,
        quickRatio: 0.95,
      },
      'GOOGL': {
        peRatio: 22.3,
        pegRatio: 1.1,
        priceToBook: 4.2,
        debtToEquity: 0.2,
        returnOnEquity: 0.28,
        returnOnAssets: 0.15,
        profitMargin: 0.22,
        operatingMargin: 0.25,
        revenueGrowth: 0.13,
        earningsGrowth: 0.18,
        currentRatio: 2.8,
        quickRatio: 2.8,
      }
    };

    const baseData = fundamentalData[symbol] || {
      peRatio: 15 + Math.random() * 20,
      pegRatio: 0.8 + Math.random() * 1.5,
      priceToBook: 1 + Math.random() * 8,
      debtToEquity: Math.random() * 1.5,
      returnOnEquity: Math.random() * 0.4,
      returnOnAssets: Math.random() * 0.2,
      profitMargin: Math.random() * 0.3,
      operatingMargin: Math.random() * 0.35,
      revenueGrowth: (Math.random() - 0.1) * 0.3,
      earningsGrowth: (Math.random() - 0.1) * 0.4,
      currentRatio: 0.5 + Math.random() * 3,
      quickRatio: 0.3 + Math.random() * 2.5,
    };

    return {
      symbol,
      ...baseData
    } as FundamentalData;
  }
}

export const alphaVantageService = new AlphaVantageService();
