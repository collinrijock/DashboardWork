import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const token = String(req.headers["x-firebase-auth"]);

  if (!id) {
    return res.status(400).json({ message: "Missing application ID." });
  }

  try {
    const response = await axios({
      method: "post",
      url: "https://api.staging-lula.is/embedded/v1/application/" + id,
        headers: {
          "Content-Type": "application/json",
          ...(token && { 'X-Firebase-Auth': token })
        }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default handler;
