import { TableRow } from "../../types/TableRow";
import React, { useState } from "react";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";

type ApplicationDetailProps = {
  row: TableRow;
};

const ApplicationDetail: React.FC<ApplicationDetailProps> = () => {
  const router = useRouter();
  const initialRow: TableRow = {
    id: Number(router.query.id),
    createdDate: new Date(router.query.createdDate as string),
    status: router.query.status as string,
    businessName: router.query.businessName as string,
    contactName: router.query.contactName as string,
    insuranceProgram: router.query.insuranceProgram as string,
    source: router.query.source as string,
    contactEmail: router.query.contactEmail as string,
    contactPhone: router.query.contactPhone as string,
  };
  const [editableRow, setEditableRow] = useState<TableRow>(initialRow);

  const handleSave = () => {
    // Call an endpoint to save the data
    console.log("Saving data:", editableRow);
  };

  const handleApprove = () => {
    // Handle approve logic
  };

  const handleDecline = () => {
    // Handle decline logic
  };

  return (
    <div className="font-lazzer p-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block font-semibold mb-2" htmlFor="businessName">
            Business Name
          </label>
          <input
            type="text"
            id="businessName"
            value={editableRow.businessName}
            onChange={(e) =>
              setEditableRow({ ...editableRow, businessName: e.target.value })
            }
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2" htmlFor="contactName">
            Contact Name
          </label>
          <input
            type="text"
            id="contactName"
            value={editableRow.contactName}
            onChange={(e) =>
              setEditableRow({ ...editableRow, contactName: e.target.value })
            }
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2" htmlFor="contactEmail">
            Contact Email
          </label>
          <input
            type="email"
            id="contactEmail"
            value={editableRow.contactEmail}
            onChange={(e) =>
              setEditableRow({ ...editableRow, contactEmail: e.target.value })
            }
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2" htmlFor="contactPhone">
            Contact Phone
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={editableRow.contactPhone}
            onChange={(e) =>
              setEditableRow({ ...editableRow, contactPhone: e.target.value })
            }
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          className="text-blue-500 p-2 px-4 border-gray-500 duration-75 transition-all hover:bg-white border-2 border-opacity-10 m-1 rounded-full"
          onClick={handleApprove}
        >
          Approve
        </button>
        <button
          className="text-red-500 p-2 px-4 border-gray-500 duration-75 transition-all hover:bg-white border-2 border-opacity-10 m-1 rounded-full"
          onClick={handleDecline}
        >
          Decline
        </button>
        <button
          className="bg-blue-500 text-white p-2 px-4 rounded-full"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ApplicationDetail;
