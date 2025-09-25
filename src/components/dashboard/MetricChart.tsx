import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricChartProps {
  data: number[];
  color: string;
}

export const MetricChart = ({ data, color }: MetricChartProps) => {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};