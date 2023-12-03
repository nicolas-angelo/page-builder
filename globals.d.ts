import Plugin from 'tailwindcss/plugin';
import resolveConfig from 'tailwindcss/resolveConfig';
import type { Config } from 'tailwindcss';
import type { OptionalConfig } from 'tailwindcss/types/config';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';
import type { DefaultTheme } from 'tailwindcss/types/generated/default-theme';

declare module '*.module.css';

declare global {
	interface Window {
		tailwind: {
			config: Partial<OptionalConfig>;
			plugin: typeof Plugin;
			colors: DefaultColors;
			defaultConfig: Config;
			defaultTheme: DefaultTheme;
			resolveConfig: typeof resolveConfig;
		};
	}
}
