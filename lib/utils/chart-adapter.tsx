'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from 'recharts';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  color?: string;
}

export function BarChart({
  data,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  color = '#16a34a',
}: BarChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
        <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip />
        <Bar dataKey="value" fill={color} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export interface PieChartProps {
  data: ChartDataPoint[];
  centerLabel?: string;
  height?: number;
}

const DEFAULT_COLORS = ['#16a34a', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export function PieChart({ data, height = 300 }: PieChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export interface LineChartProps {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  color?: string;
}

export function LineChart({
  data,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  color = '#16a34a',
}: LineChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
        <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
