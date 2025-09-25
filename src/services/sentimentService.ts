import { NewsArticle } from '../types';

export interface SentimentResult {
  score: number; // -1 to 1 (-1 most negative, 1 most positive)
  magnitude: number; // 0 to 1 (strength of sentiment)
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class SentimentAnalysisService {
  private positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'outstanding', 'fantastic', 'wonderful',
    'profit', 'growth', 'increase', 'rise', 'gain', 'bull', 'bullish', 'strong',
    'upgrade', 'buy', 'recommend', 'positive', 'optimistic', 'robust', 'solid',
    'beat', 'exceed', 'outperform', 'success', 'successful', 'milestone',
    'breakthrough', 'achievement', 'record', 'high', 'soar', 'surge', 'rally',
    'boom', 'expansion', 'innovative', 'advance', 'progress', 'opportunity',
    'dividend', 'earnings', 'revenue', 'sales', 'launch', 'partnership',
    'acquisition', 'merger', 'deal', 'contract', 'approval', 'recovery'
  ];

  private negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'weak',
    'loss', 'decline', 'decrease', 'fall', 'drop', 'bear', 'bearish', 'crash',
    'downgrade', 'sell', 'avoid', 'negative', 'pessimistic', 'concern', 'worry',
    'miss', 'below', 'underperform', 'failure', 'failed', 'risk', 'threat',
    'warning', 'alert', 'problem', 'issue', 'challenge', 'difficulty', 'crisis',
    'recession', 'bankruptcy', 'debt', 'lawsuit', 'investigation', 'scandal',
    'volatile', 'volatility', 'uncertainty', 'plunge', 'tumble', 'slump'
  ];

  private intensifiers = [
    'very', 'extremely', 'highly', 'significantly', 'substantially', 'greatly',
    'tremendously', 'remarkably', 'exceptionally', 'considerably', 'dramatically'
  ];

  analyzeSentiment(text: string): SentimentResult {
    if (!text) {
      return { score: 0, magnitude: 0, sentiment: 'neutral' };
    }

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    let score = 0;
    let magnitude = 0;
    let wordCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';

      // Check for intensifiers
      const intensifier = this.intensifiers.includes(prevWord) ? 1.5 : 1;

      if (this.positiveWords.includes(word)) {
        score += 1 * intensifier;
        magnitude += 0.5 * intensifier;
        wordCount++;
      } else if (this.negativeWords.includes(word)) {
        score -= 1 * intensifier;
        magnitude += 0.5 * intensifier;
        wordCount++;
      }
    }

    // Normalize scores
    if (wordCount > 0) {
      score = Math.max(-1, Math.min(1, score / wordCount));
      magnitude = Math.max(0, Math.min(1, magnitude / wordCount));
    }

    // Determine sentiment category
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (score > 0.1) {
      sentiment = 'positive';
    } else if (score < -0.1) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    return { score, magnitude, sentiment };
  }

  analyzeNews(articles: NewsArticle[]): NewsArticle[] {
    return articles.map(article => {
      const titleSentiment = this.analyzeSentiment(article.title);
      const descriptionSentiment = this.analyzeSentiment(article.description);

      // Weight title more heavily than description
      const combinedScore = (titleSentiment.score * 0.7) + (descriptionSentiment.score * 0.3);
      const combinedMagnitude = Math.max(titleSentiment.magnitude, descriptionSentiment.magnitude);

      let sentiment: 'positive' | 'negative' | 'neutral';
      if (combinedScore > 0.1) {
        sentiment = 'positive';
      } else if (combinedScore < -0.1) {
        sentiment = 'negative';
      } else {
        sentiment = 'neutral';
      }

      return {
        ...article,
        sentiment,
        sentimentScore: combinedScore,
      };
    });
  }

  calculateOverallSentiment(articles: NewsArticle[]): SentimentResult {
    if (!articles || articles.length === 0) {
      return { score: 0, magnitude: 0, sentiment: 'neutral' };
    }

    const analyzedArticles = this.analyzeNews(articles);

    // Calculate weighted average based on recency (more recent = higher weight)
    const now = new Date().getTime();
    let totalScore = 0;
    let totalWeight = 0;
    let totalMagnitude = 0;

    analyzedArticles.forEach(article => {
      const articleTime = new Date(article.publishedAt).getTime();
      const hoursAgo = (now - articleTime) / (1000 * 60 * 60);

      // Weight decreases with age (24 hours = weight 1, 168 hours = weight 0.1)
      const weight = Math.max(0.1, Math.exp(-hoursAgo / 48));

      totalScore += (article.sentimentScore || 0) * weight;
      totalWeight += weight;
      totalMagnitude += (Math.abs(article.sentimentScore || 0) * weight);
    });

    const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const averageMagnitude = totalWeight > 0 ? totalMagnitude / totalWeight : 0;

    let sentiment: 'positive' | 'negative' | 'neutral';
    if (averageScore > 0.1) {
      sentiment = 'positive';
    } else if (averageScore < -0.1) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    return {
      score: averageScore,
      magnitude: averageMagnitude,
      sentiment,
    };
  }

  // Convert sentiment score to 0-100 scale for scoring system
  sentimentToScore(sentimentResult: SentimentResult): number {
    // Convert from -1 to 1 scale to 0 to 100 scale
    // Also factor in magnitude (confidence)
    const baseScore = ((sentimentResult.score + 1) / 2) * 100;
    const confidenceMultiplier = 0.5 + (sentimentResult.magnitude * 0.5);

    return Math.round(Math.max(0, Math.min(100, baseScore * confidenceMultiplier)));
  }
}

export const sentimentService = new SentimentAnalysisService();