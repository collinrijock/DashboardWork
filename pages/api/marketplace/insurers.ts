import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
async function handler(req: NextApiRequest, res: NextApiResponse) {

        const atoken = await axios.post("https://lula-staging.us.auth0.com/oauth/token", {
            "grant_type":"client_credentials",
            "client_id": "BkuELIXjPASqG8aGIHQR7kUZVViuZKiB",
            "client_secret": "KYxJgAeHF3_n8_eUjjobePo5m4WNOA_KiG8z7yxgXijjod9aO9Rcd9tTg6VGM_-C",
            "audience": "https://staging.marketplace.lula.com/"
        });
        const accessToken = atoken.data.access_token;
        
        const insurers = await axios.get("https://api.staging-lula.is/marketplace/api/insurers", {      
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
       
        res.status(200).json(insurers.data);
}
export default handler;