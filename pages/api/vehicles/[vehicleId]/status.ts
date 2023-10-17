import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body);
  const { vehicleId } = req.query;
  if (!vehicleId) return res.status(400);
  if (!body.status) return res.status(400);
  if (!body.accountId) return res.status(400);
  try {
    console.log('sending request to onboarding bff')
    await axios({
      url: `${process.env.LULA_ONBOARDING_API_URL}/api/appFlow/${body.accountId}/${vehicleId}`,
      method: 'POST',
      data: { insuranceCriteriaStatus: body.status },
      headers: { 'Authorzation': req.headers.authorization },
    })
    console.log('request sent to onboarding bff')
    console.log('sending request to embedded api')
    await axios({
      url: `${process.env.LULA_API_URL}/embedded/v1/backoffice/asset-status-update`,
      method: 'POST',
      data: { assetId: vehicleId, status: body.status, applicationId: body.accountId },
      headers: { 'Authorzation': req.headers.authorization },
    })
    console.log('request sent to embedded api')
  } catch(err : any) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
  return res.status(200);
};

export default handler;
