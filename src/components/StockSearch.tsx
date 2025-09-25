import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { alphaVantageService } from '../services/alphaVantageService';

interface SearchResult {
  symbol: string;
  name: string;
}

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
  isLoading?: boolean;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Popular stocks for quick access
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await alphaVantageService.searchSymbols(searchQuery);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSelectStock = (symbol: string) => {
    setQuery(symbol);
    setShowResults(false);
    onSelectStock(symbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectStock(query.trim().toUpperCase());
      setShowResults(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search stocks (e.g., AAPL, Apple, Microsoft)..."
            className="block w-full pl-16 pr-40 py-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg placeholder-gray-400 transition-all duration-200 hover:shadow-xl focus:shadow-xl"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Analyze'
              )}
            </div>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (results.length > 0 || isSearching) && (
          <div className="absolute z-10 w-full mt-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="px-6 py-4 text-center text-gray-500 flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectStock(result.symbol)}
                  className="w-full px-6 py-4 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-150 group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{result.symbol}</div>
                      <div className="text-sm text-gray-600 truncate group-hover:text-blue-600 transition-colors">{result.name}</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </form>

      {/* Popular Stocks */}
      {!showResults && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Popular Stocks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock.symbol)}
                disabled={isLoading}
                className="group p-6 text-left bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-white/80 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{stock.symbol}</div>
                  <TrendingUp className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
                <div className="text-xs text-gray-600 truncate group-hover:text-gray-700 transition-colors">{stock.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};