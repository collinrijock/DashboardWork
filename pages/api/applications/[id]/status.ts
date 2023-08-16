import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, status } = req.body;
    const data = {
      id, status,
      ...(req.body?.statusNote && {statusNote: req.body.statusNote})
    }  

    try {
      await axios({
        method: 'post',
        url: `${process.env.NEXT_PUBLIC_LULA_API_URL}/embedded/v1/backoffice/statusupdate`,
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-auth': req.headers['x-firebase-auth'] as string,
          'x-source': 'dashboard'
        },
        data: data
      });
      res.status(200).json({ message: 'Successfully updated status' });
    } catch (error : any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to make API request', message: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' }); // Handle methods other than POST
  }
}
