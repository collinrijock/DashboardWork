import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = String(req.headers["x-firebase-auth"]);
    
    // Create a URLSearchParams instance from req.query
    const queryParams = new URLSearchParams(req.query as { [key: string]: string });

    const url = `${process.env.LULA_API_URL}/embedded/v1/backoffice/search?${queryParams}`;
    const response = await fetch(
      url,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { 'x-firebase-auth': token })
        },
      }
    );

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const searchResults = await response.json();
    res.status(200).json(searchResults);
  } catch (error: any) {
    console.error(`Error processing search request: ${error}`);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export default handler;
