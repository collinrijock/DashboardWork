import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
async function handler(req: NextApiRequest, res: NextApiResponse) {

        const lulaApi = process.env.LULA_API_URL;
        const authUrl = process.env.MARKETPLACE_AUTH0_TOKEN_URL;

        const atoken = await axios.post(`${authUrl}`,{
            "grant_type": "client_credentials",
            "client_id": process.env.MARKETPLACE_AUTH0_CLIENT_ID,
            "client_secret": process.env.MARKETPLACE_AUTH0_CLIENT_SECRET,
            "audience": process.env.MARKETPLACE_AUTH0_AUDIENCE
        });
    
        const accessToken = atoken.data.access_token;
        
        const insurers = await axios.get(`${lulaApi}/marketplace/api/insurers`, {      
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
       
        res.status(200).json(insurers.data);
}
export default handler;