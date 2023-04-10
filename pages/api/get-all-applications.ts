// pages/api/get-all-applications.ts
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { TableRow } from '../../types/TableRow';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.staging-lula.is/embedded/v1/backoffice/',
      headers: {
        'Authorization': 'Bearer 1eJ9AIIMZ9KQF70BlAipo6EPeIVte0Gr',
        'Content-Type': 'application/json',
      },
      data: {},
    });

    

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data.' });
  }
};

export default handler;
