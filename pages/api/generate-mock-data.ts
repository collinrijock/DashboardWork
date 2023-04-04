import { TableRow } from "@/types/TableRow";
import { NextApiRequest, NextApiResponse } from "next";

function generateMockData() {
  const data: TableRow[] = [
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

const generateMockDataHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const data = generateMockData();
  res.status(200).json(data);
};

export default generateMockDataHandler;
