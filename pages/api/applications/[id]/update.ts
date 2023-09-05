import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const { id, token } = req.query;
    const { applicationData } = req.body;
    console.log("applicationData", applicationData);
    try {
      const response = await axios({
        method: "PUT",
        url: `${process.env.LULA_API_URL}/embedded/v1/application/application-data`,
        data: { id, applicationData },
        headers: {
          "x-source": "dashboard",
          ...(token && { "x-firebase-auth": token }),
        },
      });

      if (response.status === 200) {
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
  } else {
    res.status(405).json({ error: "Method not allowed" }); // Handle methods other than PUT
  }
}
