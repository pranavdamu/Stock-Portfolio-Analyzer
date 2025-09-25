import axios from 'axios';
import { NewsArticle } from '../types';

export class NewsService {
  private apiKey: string;
  private baseUrl: string = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.REACT_APP_NEWS_API_KEY || 'demo';
  }

  async getStockNews(symbol: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: `${symbol} OR "${symbol} stock" OR "${symbol} shares"`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit,
          apiKey: this.apiKey,
        },
      });

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        sentiment: undefined, // Will be calculated by sentiment analysis
        sentimentScore: undefined,
      }));
    } catch (error) {
      console.error('Error fetching news:', error);

      // Fallback to mock data for demo purposes
      return this.getMockNews(symbol);
    }
  }

  async getMarketNews(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: 'stock market OR trading OR finance OR economy',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit,
          apiKey: this.apiKey,
        },
      });

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        sentiment: undefined,
        sentimentScore: undefined,
      }));
    } catch (error) {
      console.error('Error fetching market news:', error);
      return this.getMockMarketNews();
    }
  }

  // Mock data for demo when API is not available
  private getMockNews(symbol: string): NewsArticle[] {
    const now = new Date();
    return [
      {
        title: `${symbol} Reports Strong Quarterly Earnings`,
        description: `${symbol} announced better than expected quarterly results, showing strong revenue growth and improved profit margins.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-earnings`,
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Financial Times',
        sentiment: 'positive',
        sentimentScore: 0.8,
      },
      {
        title: `Analysts Upgrade ${symbol} Price Target`,
        description: `Several Wall Street analysts have raised their price targets for ${symbol} following recent positive developments.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-upgrade`,
        publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'Reuters',
        sentiment: 'positive',
        sentimentScore: 0.7,
      },
      {
        title: `${symbol} Faces Market Volatility Amid Economic Concerns`,
        description: `${symbol} shares experienced volatility as investors weigh economic uncertainties and sector-specific challenges.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-volatility`,
        publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'Bloomberg',
        sentiment: 'neutral',
        sentimentScore: 0.1,
      },
    ];
  }

  private getMockMarketNews(): NewsArticle[] {
    const now = new Date();
    return [
      {
        title: 'Stock Market Reaches New Highs Amid Economic Recovery',
        description: 'Major indices hit record levels as economic indicators show continued growth and investor confidence remains strong.',
        url: 'https://example.com/market-highs',
        publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        source: 'CNN Business',
        sentiment: 'positive',
        sentimentScore: 0.8,
      },
      {
        title: 'Federal Reserve Signals Cautious Approach to Interest Rates',
        description: 'The Fed maintains a careful stance on monetary policy as inflation concerns persist alongside economic growth.',
        url: 'https://example.com/fed-rates',
        publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        source: 'Wall Street Journal',
        sentiment: 'neutral',
        sentimentScore: 0.0,
      },
    ];
  }
}

export const newsService = new NewsService();