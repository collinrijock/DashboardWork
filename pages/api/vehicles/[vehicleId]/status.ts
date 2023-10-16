import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body);
  const { vehicleId } = req.query;
  if (!vehicleId) return res.status(400);
  if (!body.status) return res.status(400);
  if (!body.accountId) return res.status(400);
  try {
    await axios({
      url: `${process.env.LULA_ONBOARDING_API_URL}/api/appFlow/${body.accountId}/${vehicleId}`,
      method: 'POST',
      data: { insuranceCriteriaStatus: body.status },
      headers: { 'Authorzation': req.headers.authorization },
    });
  } catch(err) {
    console.error(err);
    return res.statu(500).send('Onboarding App Failed');
  }
  return res.status(200);
};

export default handler;
