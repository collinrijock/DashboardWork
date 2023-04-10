import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { Icon } from "@lula-technologies-inc/lux";
import { TableRow } from "../../types/TableRow"

const Table: React.FC = () => {
  const [data, setData] = useState<TableRow[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterInsuranceProgram, setFilterInsuranceProgram] = useState("");
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/get-all-applications");
      const rawData = await response.json();
      setRawData(rawData);

      const formattedData: TableRow[] = rawData.map((item: any) => {
        const {
          id,
          createdOn,
          status,
          content,
          insuranceProgram,
          requester,
        } = item;

        return {
          id,
          createdDate: new Date(createdOn),
          status,
          businessName: content.asJson.businessName || '',
          contactName: `${content.asJson.applicant?.firstName || ''} ${content.asJson.applicant?.lastName || ''}`.trim(),
          insuranceProgram: insuranceProgram.name,
          source: requester.source,
          contactEmail: content.asJson.applicant?.email || '',
          contactPhone: content.asJson.applicant?.phone || '',
        };
      });
      setData(formattedData);
    };

    fetchData();
  }, []);

  function navigateToApplicantDetailPage(row: TableRow) {
    router.push({
      pathname: "/application/detail",
      query: { id: row.id },
    });
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
            <th className="px-4 py-5 text-start text-primary-dimmed uppercase tracking-widest font-normal">CREATED DATE</th>
            <th className="px-4 py-2 text-start text-primary-dimmed uppercase tracking-widest font-normal">STATUS</th>
            <th className="px-4 py-2 text-start text-primary-dimmed uppercase tracking-widest font-normal">BUSINESS NAME</th>
            <th className="px-4 py-2 text-start text-primary-dimmed uppercase tracking-widest font-normal" >CONTACT NAME</th>
            <th className="px-4 py-2 text-start text-primary-dimmed uppercase tracking-widest font-normal">INSURANCE PROGRAM</th>
            <th className="px-4 py-2 text-start text-primary-dimmed uppercase tracking-widest font-normal">SOURCE</th>
            <th className="px-4 py-2 text-end"></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr
              key={row.id}
              className="cursor-pointer table-row transition-all duration-50 hover:bg-primary-hover font-normal overflow-hidden"
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
