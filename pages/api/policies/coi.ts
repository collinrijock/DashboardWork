import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const requestBody = req.body;
    const authorization = req.headers.authorization;

    const axiosConfig = {
      responseType: "arraybuffer", 
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
    };

    const response = await axios.post(
      `${process.env.LULA_API_URL}/policy/docs/generate`,
      requestBody,
      // @ts-ignore
      axiosConfig
    );

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(response.data);
  } catch (error: any) {
    console.error("Error generating document:", error.message);

    if (error.response) {
      res.status(error.response.status).json({
        message:
          error.response.data.message ||
          "Failed to generate the document. Please try again.",
      });
    } else if (error.request) {
      console.error("No response was received:", error.request);
      res.status(500).json({
        message: "No response received from the server. Please try again.",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message:
          "An error occurred while generating the document. Please try again.",
        error: error.message,
      });
    }
  }
}
