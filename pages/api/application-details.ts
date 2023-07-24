import axios from 'axios';

export default async function handler(req : any, res : any) {
  const { id, token } = req.query;

  const url = `${process.env.LULA_API_URL}/embedded/v1/application/${id}`;

  try {
    const response = await axios.get(url, {
      headers: {
        ...(token && { 'x-firebase-auth': token })
      },
    });

    res.status(200).json(response.data);
  } catch (error:any) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Error fetching application' });
  }
}
