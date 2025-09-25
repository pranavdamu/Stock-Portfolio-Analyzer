# 📈 Stock Portfolio Analyzer

A comprehensive React-based stock analysis platform that combines **Fundamental Analysis**, **Technical Analysis**, and **Sentiment Analysis** to provide AI-powered investment insights with a 0-100 scoring system.

## 🚀 Features

### 📊 **Triple Analysis Approach**
- **Fundamental Analysis**: P/E ratio, ROE, debt-to-equity, profit margins, and more
- **Technical Analysis**: RSI, MACD, Moving Averages, support/resistance levels
- **Sentiment Analysis**: News sentiment scoring using natural language processing

### 🎯 **Smart Scoring System**
- **0-100 scoring scale** for easy comparison
- **Weighted algorithm** combining all three analysis types
- **Confidence indicators** showing analysis reliability
- **Buy/Hold/Sell recommendations** with strength ratings

### 📰 **Real-Time Data Integration**
- **Alpha Vantage API** for stock data and fundamentals
- **News API** for recent news and sentiment analysis
- **Live price updates** with change indicators
- **Historical price charts** with interactive tooltips

### 🎨 **Modern UI/UX**
- **Responsive design** optimized for all devices
- **Interactive charts** powered by Recharts
- **Clean dashboard** with intuitive navigation
- **Real-time search** with popular stock suggestions

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))
- News API key (free at [newsapi.org](https://newsapi.org/))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stock-portfolio-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   REACT_APP_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   REACT_APP_NEWS_API_KEY=your_news_api_key_here
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 API Keys Setup

### Alpha Vantage API
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for free to get your API key
3. Add to `.env` file as `REACT_APP_ALPHA_VANTAGE_API_KEY`

### News API
1. Visit [News API](https://newsapi.org/)
2. Register for free to get your API key
3. Add to `.env` file as `REACT_APP_NEWS_API_KEY`

## 📱 Usage Guide

### 1. **Stock Search**
- Use the search bar to find stocks by symbol or company name
- Select from popular stocks for quick analysis
- Get instant auto-complete suggestions

### 2. **Analysis Dashboard**
- View overall score (0-100) with color-coded indicators
- See breakdown of fundamental, technical, and sentiment scores
- Read key analysis points and recommendations

### 3. **Price Charts**
- Interactive historical price charts
- Hover for detailed price information
- Visual trend indicators (green for up, red for down)

### 4. **News & Sentiment**
- Recent news articles with sentiment analysis
- Color-coded sentiment indicators
- External links to full articles

## 🧮 Scoring Algorithm

### Overall Score Calculation
```
Overall Score = (Fundamental × 40%) + (Technical × 35%) + (Sentiment × 25%)
```

### Fundamental Analysis (40% weight)
- P/E Ratio evaluation
- Growth metrics (revenue, earnings)
- Financial health (debt, liquidity)
- Profitability ratios

### Technical Analysis (35% weight)
- RSI momentum indicators
- Moving average trends
- MACD signals
- Support/resistance levels

### Sentiment Analysis (25% weight)
- News article sentiment scoring
- Weighted by recency and source
- Natural language processing
- Market sentiment indicators

## 🎯 Score Interpretation

| Score Range | Recommendation | Color Code |
|------------|----------------|------------|
| 80-100     | Strong Buy     | 🟢 Green   |
| 60-79      | Buy            | 🟢 Green   |
| 40-59      | Hold           | 🟡 Yellow  |
| 20-39      | Sell           | 🔴 Red     |
| 0-19       | Strong Sell    | 🔴 Red     |

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## ⚠️ Disclaimer

**Important**: This tool provides analysis for educational and informational purposes only. It is not financial advice. Always consult with qualified financial advisors before making investment decisions.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
