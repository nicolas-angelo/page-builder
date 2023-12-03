import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		OPENAI_API_KEY: z.string(),
		DATABASE_URL: z.string(),
		DIRECT_URL: z.string(),
	},
	client: {
		NEXT_PUBLIC_API_URL: z.string(),
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
		NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
		NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1),
		NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1),
		NEXT_PUBLIC_ROOT_DOMAIN: z.string(),
	},
	shared: {
		NODE_ENV: z.enum(['development', 'production']),
		PORT: z.string(),
	},
	experimental__runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		PORT: process.env.PORT,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
		NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
		NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
			process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
		NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
			process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
		NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});

// declare global {
// 	namespace NodeJS {
// 		interface ProcessEnv extends z.infer<typeof envVars> {}
// 	}
// }

// export const isDev = process.env.NODE_ENV === ENVIRONMENT.DEV;
// export const isProd = process.env.NODE_ENV === ENVIRONMENT.PROD;
