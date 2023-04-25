import React, { useEffect, useState } from 'react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceDot,
  Label,
} from 'recharts';
import useDarkMode from '@/hooks/useDarkMode'; // Import your dark mode hook

const data = [
  { name: 'Jan', total: 500 },
  { name: 'Feb', total: 520 },
  { name: 'Mar', total: 530 },
  { name: 'Apr', total: 560 },
  { name: 'May', total: 600 },
  { name: 'Jun', total: 630 },
  { name: 'Jul', total: 640 },
  { name: 'Aug', total: 650 },
];

const TotalVehiclesCard: React.FC = () => {
  const darkMode = useDarkMode();
  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDot(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const lineColor = darkMode ? '#6A69D3' : 'var(--color-lula)';
  const gradientColor = darkMode ? '#8180FFC4' : 'var(--color-lula)';
  const latestDataPoint = data[data.length - 1];

  return (
    <div className={`bg-primary shadow-xl rounded-lg p-6 w-96`}>
      <div className="flex flex-row mb-8">
        <h3 className="font-serif">Total Vehicles</h3>
      </div>

      {/* Add data visualization UI here */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke='var(--color-bg-primary-highlighted)' strokeDasharray="0 0" horizontal={true} vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Area type="monotone" dataKey="total" stroke={lineColor} fill="url(#colorUv)" />
          {showDot && (
            <ReferenceDot
              x={latestDataPoint.name}
              y={latestDataPoint.total}
              r={6}
              fill={lineColor}
              className="animate-fade-in"
              stroke={darkMode ? 'white' : 'var(--color-lula)'}
              strokeWidth={6}
              
            >
              
              <Label
              value={latestDataPoint.total}
              position="top"
              offset={10}
              fill={"var(--color-text-primary)"}
              fontSize={14}
              fontWeight="bold"
              className='font-sans font-normal w-10'
            />
            </ReferenceDot>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalVehiclesCard;
