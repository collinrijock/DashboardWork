import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id, token } = req.query;
    const { comment } = req.body;
    try {
      await axios({
        method: "POST",
        url: `${process.env.LULA_API_URL}/embedded/v1/backoffice/application/${id}/comments`,
        headers: {
          "x-source": "dashboard",
          ...(token && { "x-firebase-auth": token }),
        },
        data: {
            comment,
        },
      });
        res.status(200).json({ message: "Comment added successfully" });
        
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
