import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function getSession(req = undefined, res = undefined) {
    if (req && res) return unstable_getServerSession(req, res, authOptions);

    return unstable_getServerSession(authOptions);
}

export async function getUser() {
    const session = await getSession();
    // @ts-ignore
    return await prisma.user.findUnique({ where: { id: session.userId }, include: { setting: true, profile: true }});
}