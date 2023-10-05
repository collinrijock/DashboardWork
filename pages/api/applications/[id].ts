import axios from "axios";

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const authorization = req.headers.authorization;
  const url = `${process.env.LULA_API_URL}/embedded/v1/application/${id}`;

  try {
    console.log("Fetching application: ", url);
    const response = await axios.get(url, {
      headers: {
        ...(authorization && { Authorization: authorization }),
      },
    });
    console.log("Fetching application status history: ", url);
    const reponseStatusHistory = await axios.get(
      `${process.env.LULA_API_URL}/embedded/v1/backoffice/application/${id}/status-history`,
      {
        headers: {
          ...(authorization && { Authorization: authorization }),
        },
      }
    );
    const data = { ...response.data, statusHistory: reponseStatusHistory.data };
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching application:", error?.message);
    res.status(500).json({ error: "Error fetching application" });
  }
}
