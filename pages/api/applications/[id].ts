import axios from "axios";

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const authorization = req.headers.authorization;
  const url = `${process.env.LULA_API_URL}/embedded/v1/application/${id}`;

  try {
    const response = await axios.get(url, {
      headers: {
        ...(authorization && { Authorization: authorization }),
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching application:", error?.message);
    res.status(500).json({ error: "Error fetching application" });
  }
}
