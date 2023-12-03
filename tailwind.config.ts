import plugin from 'tailwindcss/plugin';
import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

const twConfig: Config = {
	// prefix: 'dzyn-app',
	important: true,
	darkMode: ['class'],
	content: [
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/lib/**/*.{js,jsx,ts,tsx}',
		'./src/context/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
			},
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
			},
			borderRadius: {
				xl: `calc(var(--radius) + 4px)`,
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['var(--font-geist-sans)', ...fontFamily.sans],
				mono: ['var(--font-jetbrains-mono)'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	variants: {
		extend: {
			cursor: ['disabled'],
			pointerEvents: ['disabled'],
			opacity: ['disabled'],
			backdropBlur: ['hover', 'focus'],
			gridTemplateAreas: ['responsive'],
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
		require('tailwindcss-animate'),
		require('@tailwindcss/container-queries'),
		require('@tailwindcss/aspect-ratio'),
		require('@savvywombat/tailwindcss-grid-areas'),
		// plugin(({ addVariant }) => {
		// 	addVariant('left-sb-closed', '&[data-left-sidebar-open="false"]');
		// 	addVariant('left-sb-open', '&[data-left-sidebar-open="true"]');
		// 	addVariant('right-sb-closed', '&[data-right-sidebar-open="false"]');
		// 	addVariant('right-sb-open', '&[data-right-sidebar-open="true"]');
		// }),
	],
} satisfies Config;
export default twConfig;
