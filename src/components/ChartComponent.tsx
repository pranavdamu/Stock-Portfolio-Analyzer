import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface PriceDataPoint {
  date: string;
  close: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

interface ChartComponentProps {
  data: PriceDataPoint[];
  type?: 'line' | 'area';
  height?: number;
  showVolume?: boolean;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  type = 'area',
  height = 300,
  showVolume = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  // Sort data by date and prepare for chart
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      formattedDate: format(parseISO(item.date), 'MMM d'),
      shortDate: format(parseISO(item.date), 'MM/dd'),
    }));

  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const priceRange = maxPrice - minPrice;
  const yAxisMin = Math.max(0, minPrice - (priceRange * 0.1));
  const yAxisMax = maxPrice + (priceRange * 0.1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.formattedDate}</p>
          <div className="mt-1 space-y-1">
            <p className="text-sm">
              <span className="text-gray-600">Close: </span>
              <span className="font-medium">${data.close.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">High: </span>
              <span className="font-medium text-green-600">${data.high.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Low: </span>
              <span className="font-medium text-red-600">${data.low.toFixed(2)}</span>
            </p>
            {showVolume && (
              <p className="text-sm">
                <span className="text-gray-600">Volume: </span>
                <span className="font-medium">{data.volume.toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine if the overall trend is up or down
  const firstPrice = chartData[0].close;
  const lastPrice = chartData[chartData.length - 1].close;
  const isUpTrend = lastPrice > firstPrice;

  if (type === 'area') {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 12, fill: '#666' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isUpTrend ? "#10B981" : "#EF4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isUpTrend ? "#10B981" : "#EF4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="close"
              stroke={isUpTrend ? "#10B981" : "#EF4444"}
              strokeWidth={2}
              fill="url(#colorPrice)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="shortDate"
            tick={{ fontSize: 12, fill: '#666' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yAxisMin, yAxisMax]}
            tick={{ fontSize: 12, fill: '#666' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke={isUpTrend ? "#10B981" : "#EF4444"}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};