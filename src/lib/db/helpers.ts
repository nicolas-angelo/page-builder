import prisma from '@/lib/db';
import { env } from '@/env.mjs';

export const getStaticPaths = async () => {
	const allSites = await prisma.site.findMany({
		select: { subdomain: true, customDomain: true },
	});

	const allPaths = allSites
		.flatMap(({ subdomain, customDomain }) => [
			subdomain && {
				domain: `${subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`,
			},
			customDomain && {
				domain: customDomain,
			},
		])
		.filter(Boolean);
	return allPaths;
};
