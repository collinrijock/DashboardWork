import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { Icon } from "@lula-technologies-inc/lux";
import { TableRow } from "../../types/TableRow"

const Table: React.FC = () => {
  const [data, setData] = useState<TableRow[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterInsuranceProgram, setFilterInsuranceProgram] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/generate-mock-data");
      const data = await response.json();
      const formattedData = data.map((row: { createdDate: string | number | Date; }) => ({
        ...row,
        createdDate: new Date(row.createdDate),
      }));

      setData(formattedData);
    };

    fetchData();
  }, []);

  function navigateToApplicantDetailPage(row: TableRow) {
    router.push({
      pathname: "/application/detail",
      query: { ...row, createdDate: row.createdDate.toISOString() },
    });
  }
  
  function generateMockDataLocally() {
    const data = [
      {
        id: 1,
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
        id: i + 1,
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
          filtered = filtered.filter(
            (row) =>
              row.businessName.toLowerCase().includes(lowerSearch) ||
              row.contactName.toLowerCase().includes(lowerSearch) ||
              row.contactEmail.toLowerCase().includes(lowerSearch) ||
              row.contactPhone.toLowerCase().includes(lowerSearch)
          );
        }

        if (filterDate) {
          const selectedDate = new Date(filterDate);
          selectedDate.setMinutes(
            selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
          );
          filtered = filtered.filter((row) => {
            const rowCreatedDate = new Date(row.createdDate);
            console.log("selected date", selectedDate);
            console.log("filter date", filterDate);
            console.log("row date", rowCreatedDate);
            return rowCreatedDate.getTime() === selectedDate.getTime();
          });
        }

        if (filterInsuranceProgram) {
          filtered = filtered.filter(
            (row) => row.insuranceProgram === filterInsuranceProgram
          );
        }

        // Sort by created date
        filtered.sort(
          (a, b) => a.createdDate.getTime() - b.createdDate.getTime()
        );

        setFilteredData(filtered);
      }
    };
    filterAndSortData();
  }, [search, filterDate, filterInsuranceProgram, data]);

  const handleApprove = (index: number) => {
    // Handle approve logic
  };

  const handleDecline = (index: number) => {
    // Handle decline logic
  };
  return (
    <div className="font-sans py-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="relative w-full border-none p-2 bg-primary rounded-sm">
          <Icon
            icon="magnifying-glass"
            className="absolute top-5 left-3.5 h-4 w-4 fa-solid text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by Business Name, Contact Name, Email, Phone..."
            className="w-full box-border pl-10 pr-4 py-2 border-none bg-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="date"
          className="w-full border-none p-2 rounded bg-primary"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="w-full border-none p-2 rounded bg-primary"
          value={filterInsuranceProgram}
          onChange={(e) => setFilterInsuranceProgram(e.target.value)}
        >
          <option value="">Filter by Insurance Program</option>
          <option value="Continuous Coverage">Continuous Coverage</option>
          <option value="ORP">ORP</option>
          <option value="SLI">SLI</option>
        </select>
      </div>
      <table className="table-auto bg-primary w-full rounded-lg text-xs overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-5 text-start font-medium ">CREATED DATE</th>
            <th className="px-4 py-2 text-start font-medium ">STATUS</th>
            <th className="px-4 py-2 text-start font-medium ">BUSINESS NAME</th>
            <th className="px-4 py-2 text-start font-medium " >CONTACT NAME</th>
            <th className="px-4 py-2 text-start font-medium ">INSURANCE PROGRAM</th>
            <th className="px-4 py-2 text-start font-medium ">SOURCE</th>
            <th className="px-4 py-2 text-end"></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr
              key={row.id}
              className="cursor-pointer table-row transition-all duration-50 hover:bg-primary-hover font-medium overflow-hidden"
              onClick={() => navigateToApplicantDetailPage(row)}
            >
              <td className="px-4 py-2">{row.createdDate.toDateString()}</td>
              <td className="px-4 py-2">{row.status}</td>
              <td className="px-4 py-2">{row.businessName}</td>
              <td className="px-4 py-2">{row.contactName}</td>
              <td className="px-4 py-2">{row.insuranceProgram}</td>
              <td className="px-4 py-2">{row.source}</td>
              <td className="flex flex-row justify-around">
                <button
                  className="text-blue-500 bg-blue-100 hover:bg-blue-200 p-2 px-4 duration-75 transition-all border border-blue-500 border-opacity-10 m-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(index);
                  }}
                >
                  Approve
                </button>
                <button
                  className="text-red-500 bg-red-100 hover:bg-red-200 p-2 px-4 duration-75 transition-all border border-red-500 border-opacity-10 m-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecline(index);
                  }}
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
          {filteredData.map((row, index) => (
            <tr key={index}></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
