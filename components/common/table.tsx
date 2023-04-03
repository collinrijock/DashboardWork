// pages/Table.tsx
import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";

type TableRow = {
  createdDate: Date;
  status: string;
  businessName: string;
  contactName: string;
  insuranceProgram: string;
  source: string;
  contactEmail: string;
  contactPhone: string;
};

const Table: React.FC = () => {
  const [data, setData] = useState<TableRow[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterInsuranceProgram, setFilterInsuranceProgram] = useState("");

  useEffect(() => {
    // Fetch data from the endpoint and set it to the state
    const fetchData = async () => {
      // Implement data fetching logic here
      setData(generateMockDataLocally());
    };

    fetchData();
  }, []);

  function generateMockDataLocally() {
    const data = [
      {
        createdDate: new Date(2023, 3, 3),
        status: "In Progress",
        businessName: "Collin Cars",
        contactName: "Collin Rijock",
        insuranceProgram: "Continuous Coverage",
        source: "Car Sync",
        contactEmail: "collin@example.com",
        contactPhone: "123-456-7890",
      },
    ];

    for (let i = 1; i < 10; i++) {
      data.push({
        ...data[0],
        businessName: `${data[0].businessName} ${i}`,
        contactName: `${data[0].contactName} ${i}`,
        contactEmail: `collin${i}@example.com`,
        contactPhone: `123-456-78${i}0`,
      });
    }

    return data;
  }

  useEffect(() => {
    const filterAndSortData = () => {
      {
        let filtered = data;
        
          if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(row =>
              row.businessName.toLowerCase().includes(lowerSearch) ||
              row.contactName.toLowerCase().includes(lowerSearch) ||
              row.contactEmail.toLowerCase().includes(lowerSearch) ||
              row.contactPhone.toLowerCase().includes(lowerSearch)
            );
          }
        
          if (filterDate) {
            const selectedDate = new Date(filterDate);
            selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset())
            filtered = filtered.filter(row => {
              const rowCreatedDate = new Date(row.createdDate);
              console.log("selected date", selectedDate)
              console.log("filter date", filterDate)
              console.log("row date", rowCreatedDate)
              return rowCreatedDate.getTime() === selectedDate.getTime();
            });
          }
        
          if (filterInsuranceProgram) {
            filtered = filtered.filter(
              row => row.insuranceProgram === filterInsuranceProgram
            );
          }
        
          // Sort by created date
          filtered.sort(
            (a, b) => a.createdDate.getTime() - b.createdDate.getTime()
          );
        
          setFilteredData(filtered);
        };
    }
    filterAndSortData();
  }, [search, filterDate, filterInsuranceProgram,data]);

  const handleApprove = (index: number) => {
    // Handle approve logic
  };

  const handleDecline = (index: number) => {
    // Handle decline logic
  };
  return (
    <div className="font-lazzer py-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Business Name, Contact Name, Contact Email, or Contact Phone"
          className="w-full border-none p-2rounded bg-background_secondary rounded-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="w-full border-none p-2 rounded bg-background_secondary"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="w-full border-none p-2 rounded bg-background_secondary"
          value={filterInsuranceProgram}
          onChange={(e) => setFilterInsuranceProgram(e.target.value)}
        >
          <option value="">Filter by Insurance Program</option>
          <option value="Continuous Coverage">Continuous Coverage</option>
          <option value="ORP">ORP</option>
          <option value="SLI">SLI</option>
        </select>
      </div>
      <table className="table-auto bg-background_secondary w-full rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 w-1/7 text-start lula">CREATED DATE</th>
            <th className="px-4 py-2 w-1/7 text-start">STATUS</th>
            <th className="px-4 py-2 w-1/7 text-start">BUSINESS NAME</th>
            <th className="px-4 py-2 w-1/7 text-start">CONTACT NAME</th>
            <th className="px-4 py-2 w-1/7 text-start">INSURANCE PROGRAM</th>
            <th className="px-4 py-2 w-1/7 text-start">SOURCE</th>
            <th className="px-4 py-2 w-1/7 text-end"></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-2">
                {row.createdDate.toDateString()}
              </td>
              <td className="px-4 py-2">{row.status}</td>
              <td className="px-4 py-2">{row.businessName}</td>
              <td className="px-4 py-2">{row.contactName}</td>
              <td className="px-4 py-2">{row.insuranceProgram}</td>
              <td className="px-4 py-2">{row.source}</td>
              <td className="flex flex-row">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded mt-2 mr-2"
                  onClick={() => handleApprove(index)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 mt-2 rounded"
                  onClick={() => handleDecline(index)}
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
