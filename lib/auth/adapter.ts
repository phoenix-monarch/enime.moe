import type { PrismaClient, Prisma } from "@prisma/client"
import type { Adapter, AdapterAccount } from "next-auth/adapters"

export function PrismaAdapter(p: PrismaClient): Adapter {
    return {
        // @ts-ignore
        createUser: async (data) => {
            return await p.user.create({ data: {
                    ...data,
                    setting: {
                        create: {}
                    },
                    profile: {
                        create: {}
                    }
            } })
        },
        // @ts-ignore
        getUser: (id) => p.user.findUnique({ where: { id }, include: { setting: true, profile: true } }),
        // @ts-ignore
        getUserByEmail: (email) => p.user.findUnique({ where: { email }, include: { setting: true, profile: true } }),
        // @ts-ignore
        async getUserByAccount(provider_providerAccountId) {
            const account = await p.account.findUnique({
                where: { provider_providerAccountId },
                select: { user: true },
            })
            return account?.user ?? null
        },
        // @ts-ignore
        updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }),
        // @ts-ignore
        deleteUser: (id) => p.user.delete({ where: { id } }),
        linkAccount: (data) =>
            p.account.create({ data }) as unknown as AdapterAccount,
        unlinkAccount: (provider_providerAccountId) =>
            p.account.delete({
                where: { provider_providerAccountId },
            }) as unknown as AdapterAccount,
        // @ts-ignore
        async getSessionAndUser(sessionToken) {
            const userAndSession = await p.session.findUnique({
                where: { sessionToken },
                include: { user: { include: { setting: true, profile: true } } },
            })
            if (!userAndSession) return null
            const { user, ...session } = userAndSession
            return { user, session }
        },
        createSession: (data) => p.session.create({ data }),
        updateSession: (data) =>
            p.session.update({ where: { sessionToken: data.sessionToken }, data }),
        deleteSession: (sessionToken) =>
            p.session.delete({ where: { sessionToken } }),
        async createVerificationToken(data) {
            const verificationToken = await p.verificationToken.create({ data })
            return verificationToken
        },
        async useVerificationToken(identifier_token) {
            try {
                const verificationToken = await p.verificationToken.delete({
                    where: { identifier_token },
                })
                return verificationToken
            } catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
                    return null
                throw error
            }
        },
    }
}