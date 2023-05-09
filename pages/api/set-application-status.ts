import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = String(req.headers["x-firebase-auth"]);
    console.log('token', token);
    const response = await axios({
      method: 'post',
      url: `${process.env.LULA_API_URL}/embedded/v1/backoffice/statusupdate`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'x-firebase-auth': token }),
      },
      data: {...req.body},
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching data.', error: error.message });
  }
};

export default handler;
