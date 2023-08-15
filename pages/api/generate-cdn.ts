import { NextApiRequest, NextApiResponse } from 'next';
import { enimeApi } from '@/lib/constant';
import weightedRandom from '@/lib/random';

const CDN_HOSTS = [
    "cdn.nade.me",
    "cdn2.nade.me"
]

const CDN_WEIGHTS = [
    5,
    5
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const body = req.body || undefined;

        if (!body) return res.send("Trolling");

        const source = await fetch(`${enimeApi}/source/${body}`);

        if (!source.ok) return res.send("Trolling");

        let r = await source.json();
        let referer = r.referer;
        let origin = referer ? `https://${new URL(referer).host}/` : undefined;

        let host = weightedRandom(CDN_HOSTS, CDN_WEIGHTS)?.item;

        let proxied = await fetch(`https://${host}/generate?url=${encodeURIComponent(r.url)}`, {
            // @ts-ignore
            headers: {
                "x-origin": origin || "none",
                "x-referer": referer || "none",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; SM-J810F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Mobile Safari/537.36",
                "x-api-key": process.env.API_KEY
            }
        });

        let url = await proxied.text();

        return res.send(url);
    } else {
        return res.json({ message: "Invalid method" });
    }
}