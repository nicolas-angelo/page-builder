// import './src/env.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// esmExternals: true,
		urlImports: ['https://zrsvey8isijorokf.public.blob.vercel-storage.com'],
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*',
			},
		],
	},
	reactStrictMode: false,
};

export default nextConfig;
