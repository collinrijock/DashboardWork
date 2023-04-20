// pages/applications/index.tsx
import Table from '@/components/common/table';

const Applications = () => {
  return (
    <div className="flex flex-col p-12 animate-fade-in">
      <h1 className="w-full text-6xl p-2">Applications</h1>
      <p className="p-2">
        Click on the <span className="underline">arrow at the end of a table row</span> to view more
        details on an application.
      </p>
      <Table />
    </div>
  );
};

export default Applications;
