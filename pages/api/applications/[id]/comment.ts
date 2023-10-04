import type {NextApiRequest, NextApiResponse} from "next";
import axios from "axios";
import {sendSlackNotification} from "../../slackNotificationService";
import { Redis } from '@upstash/redis'

const getSlackThread = async (id: string) : Promise<string | null> => {
    const redis = new Redis({
        url: `${process.env.UPSTASH_REDIS_SLACK_URL}`,
        token: `${process.env.UPSTASH_REDIS_SLACK_TOKEN}`
    })
    return await redis.get<string>(id);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const {id} = req.query;
        const {comment} = req.body;
        const authorization = req.headers.authorization;
        try {
            await axios({
                method: "POST",
                url: `${process.env.LULA_API_URL}/v1/backoffice/application/${id}/comments`,
                headers: {
                    "x-source": "dashboard",
                    ...(authorization && {Authorization: authorization}),
                },
                data: {
                    comment,
                },
            });
            try {
                const slackThread = await getSlackThread(id as string);
                if(slackThread)
                    sendSlackNotification(comment, slackThread, "Dashboard");
            } catch (error: any) {
                console.error("Error fetching slack thread:", error?.message);
            }

            res.status(200).json({message: "Comment added successfully"});
        } catch (error: any) {
            console.error(error);
            res
                .status(500)
                .json({error: "Failed to make API request", message: error.message});
        }
    } else {
        res.status(405).json({error: "Method not allowed"}); // Handle methods other than POST
    }
}
