import { LineChart, Line, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DualMetricChartProps {
  data1: number[];
  data2: number[];
  color1: string;
  color2: string;
  label1: string;
  label2: string;
  value1?: string;
  value2?: string;
}

export const DualMetricChart = ({ data1, data2, color1, color2, label1, label2, value1, value2 }: DualMetricChartProps) => {
  // Combine both datasets into chart format
  const maxLength = Math.max(data1.length, data2.length);
  const chartData = Array.from({ length: maxLength }, (_, index) => ({
    index,
    [label1]: data1[index] || null,
    [label2]: data2[index] || null,
  }));

  return (
    <div className="space-y-3">
      {/* Display both values */}
      {(value1 || value2) && (
        <div className="flex justify-between items-center">
          {value1 && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">{label1}</div>
              <div className="text-lg font-bold" style={{ color: color1 }}>{value1}</div>
            </div>
          )}
          {value2 && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">{label2}</div>
              <div className="text-lg font-bold" style={{ color: color2 }}>{value2}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Chart */}
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey={label1} 
              stroke={color1} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color1, stroke: color1, strokeWidth: 2 }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey={label2} 
              stroke={color2} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color2, stroke: color2, strokeWidth: 2 }}
              connectNulls={false}
            />
            <Tooltip 
              labelFormatter={(value) => `Reading ${Number(value) + 1}`}
              formatter={(value: any, name: string) => [
                value !== null ? `${value.toFixed(1)}°C` : 'N/A', 
                name
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
    </div>
  );
};
