import type { AuthMethod } from 'generated/prisma'

export type TProviderAuth = {
	providerAccountId: string,
	provider: string,
  email: string,
  name: string,
  picture: string,
  method: AuthMethod
}