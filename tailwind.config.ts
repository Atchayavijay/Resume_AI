import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: 'class',
	content: [
		'./src/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: '#2563eb', // blue-600
				secondary: '#9333ea', // purple-600
				accent: '#f59e42', // orange-400
				muted: '#64748b', // gray-500
				background: '#ffffff',
				foreground: '#1e293b',
			},
		},
	},
	plugins: [],
};

export default config;
