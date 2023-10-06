import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import {IncomingHttpHeaders} from "http";

const syncBack = async (
    id: string,
    status: string,
    headers: IncomingHttpHeaders,
    res: NextApiResponse<any>,
    data: any
) => {
    try {
      const response = await axios({
        method: "PUT",
        url: `${process.env.LULA_ONBOARDING_API_URL}/account/${id}/sync-back`,
        data,
        headers: {
          "X-Source": "dashboard",
          ...(headers.authorization && { Authorization: headers.authorization }),
        },
      });

      if (response.status < 400) {
        res.status(200).json({ message: "Successfully synced data" });
      } else {
        console.log("response", response);
        res.status(400).json({ error: "Failed to sync data" });
      }
    } catch (error: any) {
      console.error(error);
      res
          .status(500)
          .json({ error: "Failed to make API request", message: error.message });
    }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const {id, applicationData } = req.body;
    const authorization = req.headers.authorization;
    const data = { id, applicationData: JSON.stringify(applicationData) };
    console.log("applicationData", data);
    try {
      const response = await axios({
        method: "PUT",
        url: `${process.env.LULA_API_URL}/embedded/v1/application/application-data`,
        data,
        headers: {
          "X-Source": "dashboard",
          ...(authorization && { Authorization: authorization }),
        },
      });
      
      if (response.status < 400) {
        res.status(200).json({ message: "Successfully updated" });
      } else {
        console.log("response", response);
        res.status(400).json({ error: "Failed to update" });
      }
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to make API request", message: error.message });
    }
    syncBack(id, status, req.headers, res, data.applicationData)
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
