import React from 'react';
import { ExternalLink, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NewsArticle } from '../types';
import { format, parseISO } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
  showSentiment?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, showSentiment = true }) => {
  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentBorder = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-green-500';
      case 'negative':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <article className={`bg-white rounded-lg border border-l-4 ${getSentimentBorder(article.sentiment)} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">{article.source}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(article.publishedAt)}</span>
              <span className="text-gray-400">{formatTime(article.publishedAt)}</span>
            </div>
          </div>

          {showSentiment && article.sentiment && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)} flex items-center space-x-1`}>
              {getSentimentIcon(article.sentiment)}
              <span className="capitalize">{article.sentiment}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">
            {article.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {article.sentimentScore !== undefined && showSentiment && (
            <div className="text-xs text-gray-600">
              Sentiment Score: {(article.sentimentScore * 100).toFixed(0)}%
            </div>
          )}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <span>Read more</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
};