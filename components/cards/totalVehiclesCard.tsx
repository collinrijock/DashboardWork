import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Defs, LinearGradient, Stop } from 'recharts';

const data = [
  { name: 'Jan', total: 500 },
  { name: 'Feb', total: 520 },
  { name: 'Mar', total: 530 },
  { name: 'Apr', total: 560 },
  { name: 'May', total: 600 },
  { name: 'Jun', total: 630 },
  { name: 'Jul', total: 640 },
  { name: 'Aug', total: 650 },
  // Add more data points as needed
];

const TotalVehiclesCard: React.FC = () => {
  return (
    <div className="bg-primary shadow-xl rounded-lg p-6 w-96">
      <div className="flex flex-row">
        <h3 className="font-serif">Total Vehicles</h3>
        <h3 className="font-serif ml-auto text-6xl">650</h3>
      </div>

      {/* Add data visualization UI here */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Defs>
            <LinearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="5%" stopColor="#FF6666" stopOpacity={0.8} />
              <Stop offset="95%" stopColor="#FF6666" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
          <Line type="monotone" dataKey="total" stroke="#FF6666" dot={false} />
          <Area type="monotone" dataKey="total" stroke="#FF6666" fillOpacity={1} fill="url(#colorTotal)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalVehiclesCard;
