import React from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import TotalVehiclesCard from '../components/cards/totalVehiclesCard';

export default function Home() {
  const { user } = useFirebaseAuth();
  const firstName = user?.displayName?.split(" ")[0] || "";

  return (
    <div className="flex flex-col p-12 animate-fade-in bg-secondary min-h-screen">
      <h1 className="w-full text-6xl p-2">Welcome {firstName}</h1>
      <div >
        <h2 className='font-serif text-2xl mt-12 p-2'>
          What&#39;s happening
        </h2>
        <div className='flex flex-row mt-4'>
          <TotalVehiclesCard />
        </div>
        
      </div>
    </div>
  );
}
