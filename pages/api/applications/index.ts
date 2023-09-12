import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authorization = req.headers.authorization;

    // Create a URLSearchParams instance from req.query
    const queryParams = new URLSearchParams(
      req.query as { [key: string]: string }
    );
    // if status is not provided, send every status as a seperate param except for draft
    if (!queryParams.has("status")) {
      queryParams.append("status", "new");
      queryParams.append("status", "underreview");
      queryParams.append("status", "approved");
      queryParams.append("status", "rejected");
      queryParams.append("status", "cancelled");
      queryParams.append("status", "incomplete");
    }

    const url = `${process.env.LULA_API_URL}/embedded/v1/backoffice/search?${queryParams}`;
    console.log(`Sending request to ${url}`);
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { authorization: authorization }),
      },
    });

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const searchResults = await response.json();
    res.status(200).json(searchResults);
  } catch (error: any) {
    console.error(`Error processing search request: ${error}`);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

export default handler;
