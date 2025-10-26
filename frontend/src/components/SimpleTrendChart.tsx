import type { TrendDataPoint } from '../types';

interface SimpleTrendChartProps {
  data: TrendDataPoint[];
  metricKey: keyof TrendDataPoint;
  title: string;
  color?: string;
}

export default function SimpleTrendChart({
  data,
  metricKey,
  title,
  color = '#0ea5e9',
}: SimpleTrendChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const values = data.map((d) => Number(d[metricKey]) || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const getY = (value: number) => {
    const normalized = (value - minValue) / range;
    return 100 - normalized * 80; // 80% of height for data, 20% for padding
  };

  const points = data.map((point, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = getY(Number(point[metricKey]) || 0);
    return { x, y, point };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <svg viewBox="0 0 100 100" className="w-full h-64" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.2"
          />
        ))}

        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1"
            fill={color}
            vectorEffect="non-scaling-stroke"
          >
            <title>
              {p.point.month}/{p.point.year}: {Number(p.point[metricKey]).toLocaleString()}
            </title>
          </circle>
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>
          {data[0]?.month}/{data[0]?.year}
        </span>
        <span>
          {data[data.length - 1]?.month}/{data[data.length - 1]?.year}
        </span>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <span className="text-gray-600">Min: </span>
          <span className="font-semibold">{minValue.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-600">Max: </span>
          <span className="font-semibold">{maxValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
