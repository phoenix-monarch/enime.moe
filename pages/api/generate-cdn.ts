import { NextApiRequest, NextApiResponse } from 'next';
import { enimeApi } from '@/lib/constant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const body = req.body || undefined;

        if (!body) return res.send("Trolling");

        const source = await fetch(`${enimeApi}/source/${body}`);

        if (!source.ok) return res.send("Trolling");

        let r = await source.json();
        let referer = r.referer;
        let origin = referer ? `https://${new URL(referer).host}/` : undefined;

        let proxied = await fetch(`https://cdn.nade.me/generate?url=${encodeURIComponent(r.url)}`, {
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