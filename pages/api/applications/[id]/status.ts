import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { IncomingHttpHeaders } from "http";


const sendEmail = async (id: string, status: string, headers: IncomingHttpHeaders ) => {
  const url = `${process.env.LULA_ONBOARDING_API_URL}/account/${id}/application`;
  if(status.toLowerCase() === 'approved' || status.toLowerCase() === "rejected") {
    const data = { applicationApproved: status.toLowerCase() === 'approved' ? true : false };
    try {
      await axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${headers["x-firebase-auth"] as string}`,
        },
        data,
      });
      return true;
    } catch (error: any) {
      console.error(JSON.stringify(error));
      return false;
    }
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id, status, statusNote } = req.body;
    const data = {
      id,
      status,
      ...(statusNote?.length > 0 && { statusNote }),
    };
    const url = `${process.env.LULA_API_URL}/embedded/v1/backoffice/statusupdate`;

    try {
      await axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json",
          "x-firebase-auth": req.headers["x-firebase-auth"] as string,
          "x-source": "dashboard",
        },
        data,
      });
      await sendEmail(id, status, req.headers);
      res.status(200).json({ message: "Successfully updated status" });
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to make API request", message: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" }); // Handle methods other than POST
  }
}
