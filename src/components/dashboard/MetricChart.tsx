import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface MetricChartProps {
  data: number[];
  color: string;
  unit?: string;
}

export const MetricChart = ({ data, color, unit = '' }: MetricChartProps) => {
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
            activeDot={{ r: 4, fill: color, stroke: color, strokeWidth: 2 }}
          />
          <Tooltip 
            labelFormatter={(value) => `Reading ${Number(value) + 1}`}
            formatter={(value: any) => [
              value !== null && value !== undefined ? `${value.toFixed(1)}${unit}` : 'N/A', 
              'Value'
            ]}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};