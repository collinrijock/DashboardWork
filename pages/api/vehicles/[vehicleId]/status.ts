import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body);
  const { vehicleId } = req.query;
  if (!vehicleId) return res.status(400);
  if (!body.status) return res.status(400);
  if (!body.accountId) return res.status(400);
  try {
    const paddocksStatus = (status: string) => {
      if(status === 'APPROVED') return 'Approved';
      if(status === 'DECLINED') return 'Declined';
      return 'Under Review';
    }
    
    await axios({
      url: `${process.env.LULA_ONBOARDING_API_URL}/appFlow/${body.accountId}/${vehicleId}`,
      method: 'POST',
      data: { insuranceCriteriaStatus: paddocksStatus(body.status) },
      headers: { 'Authorzation': req.headers.authorization },
    })
    const authorization = req.headers.authorization;
    await axios({
      url: `${process.env.LULA_API_URL}/embedded/v1/backoffice/asset-status-update`,
      method: 'POST',
      data: { assetId: vehicleId, status: body.status, applicationId: body.accountId },
      headers: {
        ...(authorization && { Authorization: authorization }),
      },
    })
    return res.status(200).send("updated");
  } catch(err : any) {
    console.error(err);
    return res.status(500).send(err.message);
  }
  
  return res.status(200);
};

export default handler;
