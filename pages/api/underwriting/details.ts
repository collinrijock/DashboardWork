import axios from "axios";

export default async function handler(req: any, res: any) {
  const { vin } = req.query;
  const authorization = req.headers.authorization;

  const url = `${process.env.LULA_API_URL}/underwriting/v1/underwriting/trails/vin/${vin}`;

  try {
    const response = await axios.get(url, {
      headers: {
        ...(authorization && { Authorization: authorization }),
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching underwriting details:", error.message);
    console.log("Url: ", url);
    res.status(500).json({
      error: "Error fetching underwriting details",
      message: error.message,
    });
  }
}
