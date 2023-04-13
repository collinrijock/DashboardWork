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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const router = useRouter();

  const clearFilters = () => {
    setSearch("");
    setFilterDate("");
    setFilterInsuranceProgram("");
    setFilterStatus("");
  };

  const handleRowSelection = (id: string, isChecked: boolean) => {
    const newSelectedRows = new Set(selectedRows);

    if (isChecked) {
      newSelectedRows.add(id);
    } else {
      newSelectedRows.delete(id);
    }

    setSelectedRows(newSelectedRows);
  };

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
            rowCreatedDate.setHours(0, 0, 0, 0);
            return rowCreatedDate.getTime() === selectedDate.getTime();
          });
        }
        if (filterInsuranceProgram) {
          filtered = filtered.filter(
            (row) => row.insuranceProgram === filterInsuranceProgram
          );
        }
        if (filterStatus) {
          filtered = filtered.filter((row) => row.status === filterStatus);
        }
    
        if (filterSource) {
          filtered = filtered.filter((row) => row.source === filterSource);
        }
        // Sort by created date
        filtered.sort(
          (a, b) => a.createdDate.getTime() - b.createdDate.getTime()
        );

        setFilteredData(filtered);
      }
    };
    filterAndSortData();
  }, [search, filterDate, filterInsuranceProgram, filterStatus, filterSource, data]);

  const approveSelectedRows = () => {
    // Handle logic for approving selected rows
    console.log("Approved rows:", Array.from(selectedRows));
  };

  const declineSelectedRows = () => {
    // Handle logic for declining selected rows
    console.log("Declined rows:", Array.from(selectedRows));
  };

  const requestMoreInfoSelectedRows = () => {
    // Handle logic for requesting more information for selected rows
    console.log("Requested more info for rows:", Array.from(selectedRows));
  };

  return (
    <div className="font-sans py-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="relative w-full col-span-2 border-none px-2 bg-primary rounded-sm">
          <Icon
            icon="magnifying-glass"
            className="absolute top-3 left-3.5 h-4 w-4 fa-solid text-gray-500"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full box-border pl-10 pr-4 border-none bg-primary "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="date"
          placeholder="dd/mm/yyyy"
          className="w-full border-none px-2 rounded bg-primary grid place-content-center"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="w-full border-none p-2 rounded bg-primary text-sm"
          value={filterInsuranceProgram}
          onChange={(e) => setFilterInsuranceProgram(e.target.value)}
        >
          <option value="">Filter by Insurance Program</option>
          <option value="ContinuousCoverage">Continuous Coverage</option>
          <option value="ORP">ORP</option>
          <option value="SLI">SLI</option>
        </select>
        <select
          className="w-full border-none p-2 rounded bg-primary text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Filter by Application Status</option>
          <option value="New">New</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>
        <select
          className="w-full border-none p-2 rounded bg-primary text-sm"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">Filter by Source</option>
          <option value="OnBoarding">On Boarding</option>
          <option value="CAVF">CAVF</option>
        </select>
      </div>
      <div className="flex justify-between items-center mb-4">
        <button
          className="font-normal bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-2002"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
        <div className="flex gap-x-2">
          <button
            className="font-normal bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200"
            onClick={approveSelectedRows}
          >
            Approve selected
          </button>
          <button
            className="font-normal bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200"
            onClick={declineSelectedRows}
          >
            Decline selected
          </button>
          <button
            className="font-normal bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200"
            onClick={requestMoreInfoSelectedRows}
          >
            Request more info
          </button>
        </div>
      </div>
      <table className="table-auto bg-primary w-full rounded-lg text-xs overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-5 text-start text-primary-dimmed uppercase tracking-widest font-normal">
              <input
                type="checkbox"
                className="cursor-pointer"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const newRowSelection  = isChecked
                    ? new Set(filteredData.map((row) => row.id))
                    : new Set();
                  setSelectedRows(newRowSelection);
                }}
              />
            </th>
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
              className="table-row transition-all duration-50 hover:bg-primary-hover font-normal overflow-hidden"
            >
              <td className="px-4 py-2">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleRowSelection(String(row.id), e.target.checked);
                  }}
                />
              </td>
              <td className="px-4 py-2">{row.createdDate.toLocaleDateString()}</td>
              <td className="px-4 py-2">{row.status}</td>
              <td className="px-4 py-2">{row.businessName}</td>
              <td className="px-4 py-2">{row.contactName}</td>
              <td className="px-4 py-2">{row.insuranceProgram}</td>
              <td className="px-4 py-2">{row.source}</td>
              <td className="px-4 py-2 grid place-content-center" onClick={() => navigateToApplicantDetailPage(row)}>
                <Icon
                  icon="arrow-right-to-line solid"
                  className="cursor-pointer mr-1"
                  size={2}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
