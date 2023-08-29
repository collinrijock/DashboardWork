// pages/applications/index.tsx
import Table from '@/components/table';
import Head from 'next/head';

const Applications = () => {
  return (
    <div className="flex flex-col p-12 animate-fade-in min-h-screen bg-secondary">
      <Head>
        <title>Applications</title>
      </Head>
      <h1 className="w-full text-6xl p-2">Applications</h1>
      <p className="p-2 text-primary-dimmed">
        Click on the <span className="underline">arrow at the end of a table row</span> to view more
        details on an application.
      </p>
      <Table />
    </div>
  );
};

export default Applications;
