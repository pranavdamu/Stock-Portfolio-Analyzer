import React from 'react';
import { TrendingUp, TrendingDown, Activity, Minus, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { StockAnalysis } from '../types';

interface StockAnalysisCardProps {
  analysis: StockAnalysis;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

export const StockAnalysisCard: React.FC<StockAnalysisCardProps> = ({
  analysis,
  currentPrice,
  change,
  changePercent
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'buy':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'sell':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'buy':
        return 'text-green-600 bg-green-100';
      case 'sell':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.6) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>

        <div className="relative flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{analysis.symbol}</h2>
              {currentPrice && (
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
                  {change !== undefined && changePercent !== undefined && (
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${change >= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                {getPredictionIcon(analysis.prediction)}
              </div>
              <span className="text-xl font-bold uppercase tracking-wide">{analysis.prediction}</span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              {getConfidenceIcon(analysis.confidence)}
              <span className="text-sm font-medium">
                Confidence: <span className="font-bold">{(analysis.confidence * 100).toFixed(0)}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="px-8 py-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Overall Score</h3>
          <div className="relative inline-block">
            <div className={`w-32 h-32 rounded-full ${getScoreBgColor(analysis.overallScore)} flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300`}>
              <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600 shadow-lg">
              /100
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center group">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Fundamental</div>
              <div className={`text-3xl font-bold ${getScoreColor(analysis.fundamentalScore)}`}>
                {analysis.fundamentalScore}
              </div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Technical</div>
              <div className={`text-3xl font-bold ${getScoreColor(analysis.technicalScore)}`}>
                {analysis.technicalScore}
              </div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Sentiment</div>
              <div className={`text-3xl font-bold ${getScoreColor(analysis.sentimentScore)}`}>
                {analysis.sentimentScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Reasons */}
      <div className="px-8 py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl mr-3">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          Key Analysis Points
        </h3>
        <div className="grid gap-4">
          {analysis.reasons.slice(0, 6).map((reason, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-gray-700 font-medium">{reason}</span>
            </div>
          ))}
        </div>

        {analysis.reasons.length > 6 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-center text-blue-700 font-medium">
              +{analysis.reasons.length - 6} more analysis points available
            </div>
          </div>
        )}
      </div>

      {/* Prediction Badge */}
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700">Final Recommendation</span>
          </div>
          <div className={`px-6 py-3 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200 ${getPredictionColor(analysis.prediction)}`}>
            {analysis.prediction.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};