import { StockAnalysis, FundamentalData, NewsArticle } from '../types';
import { sentimentService } from './sentimentService';
import { technicalAnalysisService, TechnicalIndicators, PriceData } from './technicalAnalysisService';

export interface AnalysisScores {
  fundamentalScore: number;
  technicalScore: number;
  sentimentScore: number;
  overallScore: number;
  confidence: number;
  breakdown: {
    fundamental: string[];
    technical: string[];
    sentiment: string[];
  };
}

export class ScoringService {
  // Fundamental Analysis Scoring (0-100)
  scoreFundamentals(data: FundamentalData): { score: number; reasons: string[] } {
    let score = 50; // Start neutral
    const reasons: string[] = [];

    // P/E Ratio Analysis
    if (data.peRatio > 0) {
      if (data.peRatio < 15) {
        score += 15;
        reasons.push('Low P/E ratio indicates potential undervaluation');
      } else if (data.peRatio > 25) {
        score -= 10;
        reasons.push('High P/E ratio may indicate overvaluation');
      } else {
        score += 5;
        reasons.push('Moderate P/E ratio shows reasonable valuation');
      }
    }

    // PEG Ratio Analysis
    if (data.pegRatio > 0) {
      if (data.pegRatio < 1) {
        score += 10;
        reasons.push('PEG ratio below 1 suggests good growth value');
      } else if (data.pegRatio > 2) {
        score -= 8;
        reasons.push('High PEG ratio may indicate expensive growth');
      }
    }

    // Price to Book Analysis
    if (data.priceToBook > 0) {
      if (data.priceToBook < 1) {
        score += 8;
        reasons.push('Price-to-book below 1 indicates potential value');
      } else if (data.priceToBook > 3) {
        score -= 5;
        reasons.push('High price-to-book ratio suggests premium valuation');
      }
    }

    // Debt to Equity Analysis
    if (data.debtToEquity >= 0) {
      if (data.debtToEquity < 0.3) {
        score += 10;
        reasons.push('Low debt-to-equity ratio shows financial strength');
      } else if (data.debtToEquity > 1) {
        score -= 10;
        reasons.push('High debt-to-equity ratio indicates financial risk');
      }
    }

    // Return on Equity Analysis
    if (data.returnOnEquity > 0.15) {
      score += 12;
      reasons.push('Strong ROE indicates efficient use of shareholder equity');
    } else if (data.returnOnEquity < 0.05) {
      score -= 8;
      reasons.push('Low ROE suggests poor capital efficiency');
    }

    // Return on Assets Analysis
    if (data.returnOnAssets > 0.1) {
      score += 8;
      reasons.push('Strong ROA shows efficient asset utilization');
    } else if (data.returnOnAssets < 0.02) {
      score -= 5;
      reasons.push('Low ROA indicates poor asset efficiency');
    }

    // Profit Margin Analysis
    if (data.profitMargin > 0.2) {
      score += 10;
      reasons.push('High profit margin demonstrates strong pricing power');
    } else if (data.profitMargin < 0.05) {
      score -= 8;
      reasons.push('Low profit margin suggests operational challenges');
    }

    // Current Ratio Analysis
    if (data.currentRatio > 1.5) {
      score += 6;
      reasons.push('Strong current ratio indicates good liquidity');
    } else if (data.currentRatio < 1) {
      score -= 10;
      reasons.push('Poor current ratio suggests liquidity concerns');
    }

    // Revenue Growth Analysis
    if (data.revenueGrowth > 0.1) {
      score += 12;
      reasons.push('Strong revenue growth shows business expansion');
    } else if (data.revenueGrowth < -0.05) {
      score -= 10;
      reasons.push('Declining revenue indicates business challenges');
    }

    // Earnings Growth Analysis
    if (data.earningsGrowth > 0.15) {
      score += 10;
      reasons.push('Strong earnings growth demonstrates profitability improvement');
    } else if (data.earningsGrowth < -0.1) {
      score -= 8;
      reasons.push('Declining earnings suggest profitability issues');
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      reasons
    };
  }

  // Create comprehensive stock analysis
  async analyzeStock(
    symbol: string,
    fundamentalData: FundamentalData,
    historicalData: PriceData[],
    newsArticles: NewsArticle[]
  ): Promise<StockAnalysis> {

    // Calculate individual scores
    const fundamentalAnalysis = this.scoreFundamentals(fundamentalData);

    let technicalAnalysis = { score: 50, reasons: ['Insufficient historical data for technical analysis'] };
    if (historicalData && historicalData.length > 20) {
      const indicators = technicalAnalysisService.analyzeStock(historicalData);
      const currentPrice = historicalData[historicalData.length - 1].close;
      const techScore = technicalAnalysisService.technicalToScore(indicators, currentPrice);

      technicalAnalysis = {
        score: techScore,
        reasons: this.getTechnicalReasons(indicators, currentPrice)
      };
    }

    const sentimentAnalysis = sentimentService.calculateOverallSentiment(newsArticles);
    const sentimentScore = sentimentService.sentimentToScore(sentimentAnalysis);

    // Calculate weighted overall score
    const weights = {
      fundamental: 0.4,
      technical: 0.35,
      sentiment: 0.25
    };

    const overallScore = Math.round(
      (fundamentalAnalysis.score * weights.fundamental) +
      (technicalAnalysis.score * weights.technical) +
      (sentimentScore * weights.sentiment)
    );

    // Determine prediction based on overall score
    let prediction: 'buy' | 'sell' | 'hold';
    if (overallScore >= 70) {
      prediction = 'buy';
    } else if (overallScore <= 40) {
      prediction = 'sell';
    } else {
      prediction = 'hold';
    }

    // Calculate confidence based on score consistency
    const scores = [fundamentalAnalysis.score, technicalAnalysis.score, sentimentScore];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const confidence = Math.max(0.3, Math.min(1.0, 1 - (variance / 1000)));

    const allReasons = [
      ...fundamentalAnalysis.reasons,
      ...technicalAnalysis.reasons,
      ...this.getSentimentReasons(sentimentAnalysis, newsArticles.length)
    ];

    return {
      symbol,
      fundamentalScore: fundamentalAnalysis.score,
      technicalScore: technicalAnalysis.score,
      sentimentScore,
      overallScore,
      prediction,
      confidence: Math.round(confidence * 100) / 100,
      reasons: allReasons.slice(0, 8) // Limit to top 8 reasons
    };
  }

  private getTechnicalReasons(indicators: TechnicalIndicators, currentPrice: number): string[] {
    const reasons: string[] = [];

    // RSI analysis
    if (indicators.rsi < 30) {
      reasons.push('RSI indicates oversold conditions, potential buying opportunity');
    } else if (indicators.rsi > 70) {
      reasons.push('RSI shows overbought conditions, may face selling pressure');
    } else {
      reasons.push('RSI in healthy range, no extreme momentum signals');
    }

    // Moving average trend
    if (indicators.sma20 > indicators.sma50) {
      reasons.push('Short-term trend bullish with 20-day MA above 50-day MA');
    } else {
      reasons.push('Short-term trend bearish with 20-day MA below 50-day MA');
    }

    // Price vs moving averages
    if (currentPrice > indicators.sma20 && currentPrice > indicators.sma50) {
      reasons.push('Price trading above key moving averages, showing strength');
    } else if (currentPrice < indicators.sma20 && currentPrice < indicators.sma50) {
      reasons.push('Price below key moving averages, indicating weakness');
    }

    // MACD
    if (indicators.macd > indicators.macdSignal) {
      reasons.push('MACD bullish crossover suggests upward momentum');
    } else {
      reasons.push('MACD bearish signal indicates potential downward pressure');
    }

    // Overall trend
    switch (indicators.trend) {
      case 'bullish':
        reasons.push('Overall technical trend is bullish');
        break;
      case 'bearish':
        reasons.push('Overall technical trend is bearish');
        break;
      default:
        reasons.push('Technical trend is neutral, lacking clear direction');
        break;
    }

    return reasons;
  }

  private getSentimentReasons(sentimentResult: any, articleCount: number): string[] {
    const reasons: string[] = [];

    if (articleCount === 0) {
      reasons.push('No recent news available for sentiment analysis');
      return reasons;
    }

    switch (sentimentResult.sentiment) {
      case 'positive':
        reasons.push(`Positive news sentiment from ${articleCount} recent articles`);
        if (sentimentResult.magnitude > 0.6) {
          reasons.push('Strong positive sentiment indicates market confidence');
        }
        break;
      case 'negative':
        reasons.push(`Negative news sentiment from ${articleCount} recent articles`);
        if (sentimentResult.magnitude > 0.6) {
          reasons.push('Strong negative sentiment suggests market concerns');
        }
        break;
      default:
        reasons.push(`Neutral news sentiment from ${articleCount} recent articles`);
        break;
    }

    return reasons;
  }

  // Get color coding for scores
  getScoreColor(score: number): string {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Get recommendation strength
  getRecommendationStrength(score: number, confidence: number): string {
    const adjustedScore = score * confidence;

    if (adjustedScore >= 75) return 'Strong Buy';
    if (adjustedScore >= 65) return 'Buy';
    if (adjustedScore >= 55) return 'Weak Buy';
    if (adjustedScore >= 45) return 'Hold';
    if (adjustedScore >= 35) return 'Weak Sell';
    if (adjustedScore >= 25) return 'Sell';
    return 'Strong Sell';
  }
}

export const scoringService = new ScoringService();