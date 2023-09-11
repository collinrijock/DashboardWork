import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { id } = req.query;
    const authorization = req.headers.authorization;
    const url = `${process.env.LULA_API_URL}/embedded/v1/application/${id}/assets`;
    let assets = [];
    try {
      const response = await axios({
        method: "GET",
        url,
        headers: {
          "X-Source": "dashboard",
          ...(authorization && { Authorization: authorization }),
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });
      if (response.status === 200) {
        assets = response.data;
      }
      res.status(200).json(assets);
    } catch (error: any) {
      console.error(JSON.stringify(error));
      res
        .status(500)
        .json({ error: "Failed to make API request", message: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" }); // Handle methods other than POST
  }
}
