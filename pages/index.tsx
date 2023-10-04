// pages/applications/index.tsx
import Table from '@/components/table';
import { Icon } from '@lula-technologies-inc/lux';
import Head from 'next/head';

const Applications = () => {
  return (
    <div className="flex flex-col px-12 py-4 animate-fade-in min-h-screen bg-secondary">
      <Head>
        <title>Applications</title>
      </Head>
      <h1 className="w-full text-6xl py-2">Applications</h1>
      <p className="text-primary-dimmed text-sm opacity-75 ml-2">
        <Icon
          icon="circle-info"
          title="Info Circle"
          className="text-primary-dimmed aria-hidden mr-2"
        />
        Click on the <span className="underline">arrow at the end of a table row</span> to view more
        details on an application.
      </p>
      <Table />
    </div>
  );
};

export default Applications;
