import { type NextRequest } from 'next/server';
import type { AuthObject } from '@clerk/nextjs/dist/types/server';

export type AuthParams = AuthObject & {
	isPublicRoute: boolean;
	isApiRoute: boolean;
};

export type WithClerkUrl<T> = T & {
	experimental_clerkUrl: NextRequest['nextUrl'];
};

export default (auth: AuthObject) => ({
	isMissingOrg: !auth.orgId && auth.userId,
	hasOrg: auth.orgId && auth.userId,
});
