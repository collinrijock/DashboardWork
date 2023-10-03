import { useState } from 'react';
import Head from 'next/head';
import PolicyForm from '@/components/trucking/Policy';
import TruckingCOIForm from '@/components/trucking/COIGenerator';

const PostPolicy = () => {
  const [activeTab, setActiveTab] = useState('coi');

  return (
    <div className="flex flex-col p-12 animate-fade-in bg-secondary min-h-screen">
      <Head>
        <title>Trucking Portal v0</title>
      </Head>
      <h1 className="w-full text-6xl p-2">Trucking Portal v0</h1>
      <div className="flex border-b border-opacity-20 border-primary-dimmed">
        <button 
          onClick={() => setActiveTab('policy')}
          className={`py-4 px-6 block hover:text-blue-500 focus:outline-none ${activeTab === 'policy' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Policy Form
        </button>
        <button 
          onClick={() => setActiveTab('coi')}
          className={`py-4 px-6 block hover:text-blue-500 focus:outline-none ${activeTab === 'coi' ? 'border-b-2 border-blue-500' : ''}`}
        >
          COI Form
        </button>
      </div>
      {activeTab === 'policy' && <PolicyForm />}
      {activeTab === 'coi' && <TruckingCOIForm />}
    </div>
  );
};

export default PostPolicy;
