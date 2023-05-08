import type { NextApiRequest, NextApiResponse } from "next";

async function fetchSearchResults(searchValue: string, req: NextApiRequest) {
  try {
    const token = String(req.headers["x-firebase-auth"]);
    const url = `https://api.staging-lula.is/embedded/v1/backoffice/search?search=${encodeURIComponent(searchValue)}&sortDirection=desc`;
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

    return await response.json();
  } catch (error) {
    console.error(`Error fetching search results: ${error}`);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const searchValue = req.query.search as string;
    const searchResults = await fetchSearchResults(searchValue, req);
    res.status(200).json(searchResults);
  } catch (error: any) {
    console.error(`Error processing search request: ${error}`);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
