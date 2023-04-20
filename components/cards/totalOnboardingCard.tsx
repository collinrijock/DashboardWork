import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  // Add other relevant props as needed for data visualization
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full sm:w-1/2 md:w-1/4">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="text-3xl font-bold">{value}</div>
      {/* Add data visualization UI here */}
    </div>
  );
};

export default StatsCard;
