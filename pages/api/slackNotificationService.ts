import {WebClient, LogLevel} from '@slack/web-api';

const token = process.env.SLACK_TOKEN || "xoxb-689534098087-5989767517556-Zmh68GfsRWxL6qkPARnuHPuW";
const client = new WebClient(token, {
    logLevel: LogLevel.DEBUG,
});

const channelId = process.env.SLACK_CHANNEL_ID || "C05UM2L0WKH";

export const sendSlackNotification = async (message: string, ts: string, by: string) => {
    try {
        console.log(ts)
        await client.chat.postMessage({
            channel: channelId || "",
            text: message,
            username: by,
            thread_ts: ts,
        });
    } catch (error) {
        console.error(error);
    }
}