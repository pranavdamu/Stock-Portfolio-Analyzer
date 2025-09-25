import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Newspaper, AlertCircle, AlertTriangle } from 'lucide-react';
import { StockSearch } from './components/StockSearch';
import { StockAnalysisCard } from './components/StockAnalysisCard';
import { NewsCard } from './components/NewsCard';
import { ChartComponent } from './components/ChartComponent';
import { LoadingSpinner } from './components/LoadingSpinner';
import { alphaVantageService } from './services/alphaVantageService';
import { newsService } from './services/newsService';
import { scoringService } from './services/scoringService';
import { StockData, NewsArticle, StockAnalysis } from './types';

function App() {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const analyzeStock = async (symbol: string) => {
    if (!symbol) return;

    setIsLoading(true);
    setError('');
    setSelectedStock(symbol);
    setStockData(null);
    setAnalysis(null);
    setNews([]);
    setHistoricalData([]);

    try {
      // Fetch stock data and fundamental data in parallel
      const [stockQuote, fundamentalData, historical, stockNews] = await Promise.all([
        alphaVantageService.getStockQuote(symbol),
        alphaVantageService.getFundamentalData(symbol),
        alphaVantageService.getHistoricalData(symbol),
        newsService.getStockNews(symbol, 10)
      ]);

      setStockData(stockQuote);
      setHistoricalData(historical);
      setNews(stockNews);

      // Perform comprehensive analysis
      const stockAnalysis = await scoringService.analyzeStock(
        symbol,
        fundamentalData,
        historical,
        stockNews
      );

      setAnalysis(stockAnalysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze stock. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Stock Portfolio Analyzer
                </h1>
                <p className="text-sm text-gray-500">AI-Powered Investment Analysis</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-2 rounded-full shadow-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Technical</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-2 rounded-full shadow-sm">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Fundamental</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-2 rounded-full shadow-sm">
                <Newspaper className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Sentiment</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
              AI-Powered Stock Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Get comprehensive stock analysis combining <span className="font-semibold text-green-600">fundamental</span>,
              <span className="font-semibold text-blue-600"> technical</span>, and
              <span className="font-semibold text-purple-600"> sentiment analysis</span>
              with a smart 0-100 scoring system powered by Alpha Vantage API.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl w-fit mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Technical Analysis</h3>
                <p className="text-sm text-gray-600">RSI, MACD, Moving Averages</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl w-fit mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Fundamental Analysis</h3>
                <p className="text-sm text-gray-600">P/E Ratio, ROE, Financial Health</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl w-fit mx-auto mb-4">
                  <Newspaper className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Sentiment Analysis</h3>
                <p className="text-sm text-gray-600">News Analysis, Market Sentiment</p>
              </div>
            </div>
          </div>

          <StockSearch onSelectStock={analyzeStock} isLoading={isLoading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8">
            <LoadingSpinner size="large" text={`Analyzing ${selectedStock}...`} />
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Fetching stock data, news, and performing comprehensive analysis...</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && analysis && stockData && (
          <div className="space-y-8">
            {/* Stock Analysis Card */}
            <StockAnalysisCard
              analysis={analysis}
              currentPrice={stockData.price}
              change={stockData.change}
              changePercent={stockData.changePercent}
            />

            {/* Chart and News Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Price Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
                <ChartComponent
                  data={historicalData}
                  type="area"
                  height={300}
                />
              </div>

              {/* Recent News */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent News & Sentiment
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {news.length > 0 ? (
                    news.slice(0, 5).map((article, index) => (
                      <NewsCard key={index} article={article} showSentiment={true} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No recent news available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome State */}
        {!isLoading && !analysis && !error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Analyze
              </h3>
              <p className="text-gray-600">
                Search for a stock symbol above to get started with comprehensive analysis
                including fundamental metrics, technical indicators, and sentiment analysis.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Stock Portfolio Analyzer</h3>
                  <p className="text-blue-200">AI-Powered Investment Analysis</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Get comprehensive stock analysis combining fundamental, technical, and sentiment analysis
                with our smart 0-100 scoring system. Make informed investment decisions with AI-powered insights.
              </p>
              <div className="flex space-x-4">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">React</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">TypeScript</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">AI Analysis</span>
                </div>
              </div>
            </div>

            {/* Analysis Types */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Analysis Types</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span>Technical Analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span>Fundamental Analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Newspaper className="h-4 w-4 text-purple-400" />
                  <span>Sentiment Analysis</span>
                </li>
              </ul>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <ul className="space-y-3 text-gray-300">
                <li>Alpha Vantage API</li>
                <li>News API</li>
                <li>Real-time Market Data</li>
                <li>Financial Reports</li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-white/20 pt-8">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-yellow-100 mb-2">Investment Disclaimer</h5>
                  <p className="text-yellow-200 text-sm">
                    This tool provides analysis for educational and informational purposes only. It is not financial advice.
                    Always consult with qualified financial advisors before making investment decisions. Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-400">
              <p className="text-sm">
                © 2024 Stock Portfolio Analyzer. Built with ❤️ using modern web technologies.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
