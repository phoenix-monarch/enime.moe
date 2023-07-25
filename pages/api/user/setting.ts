import { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/lib/auth';
import { boolean, intersection, is, max, min, number, object } from 'superstruct';

const settingOption = object({
    miniProgressBar: boolean(),
    volume: intersection([min(number(), 0), max(number(), 100)])
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const user = await getUser();
        if (!user) return res.json({ message: "Invalid session" });

        const body = req.body;
        if (!is(body, settingOption)) return res.json({ message: "Invalid request" });

        // @ts-ignore
        await prisma.setting.update({
            where: {
                userId: user.id
            },
            data: {
                ...body
            }
        });

        return res.json({ message: "Successful" });
    } else {
        return res.json({ message: "Invalid method" });
    }
}