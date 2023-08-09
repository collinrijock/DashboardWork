import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { id } = req.query;
    const authorization = req.headers.authorization;
    let comments = [];
    try {
      const response = await axios({
        method: "GET",
        url: `${process.env.LULA_API_URL}/embedded/v1/backoffice/application/${id}/comments`,
        headers: {
          "x-source": "dashboard",
          ...(authorization && { Authorization: authorization }),
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });
      if (response.status === 200) {
        comments = response.data;
      }
      res.status(200).json(comments);
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
