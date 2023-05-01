import type { NextApiRequest, NextApiResponse } from "next";

async function fetchSearchResults(queryParams: string, req: NextApiRequest) {
  const token = String(req.headers["x-firebase-auth"]);
  const response = await fetch(
    `https://api.staging-lula.is/embedded/v1/backoffice/search?${queryParams}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { 'X-Firebase-Auth': token })
      },
    }
  );

  if (!response.ok) {
    throw new Error(`An error occurred: ${response.statusText}`);
  }

  return await response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const queryParams = req.url?.split("?")[1] || "";
    const searchResults = await fetchSearchResults(queryParams, req);
    res.status(200).json(searchResults);
  } catch (error : any) {
    res.status(500).json({ message: error.message });
  }
}
