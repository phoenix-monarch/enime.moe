import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import prisma from '@/lib/database/prisma';
import { PrismaAdapter } from '@/lib/auth/adapter';

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            // @ts-ignore
            clientId: process.env.DISCORD_CLIENT_ID,
            // @ts-ignore
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token, user }) {
            delete user.setting["id"];
            delete user.setting["userId"];
            delete user.profile["id"];
            delete user.profile["userId"];

            session.setting = user.setting;
            session.profile = user.profile;
            session.userId = user.id;

            return session;
        }
    }
}

export default NextAuth(authOptions);