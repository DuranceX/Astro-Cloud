
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ['selector'],
	theme: {
		extend: {
			colors:{
				red:{
					night: '#ef44442e',
				},
				emerald:{
					night: '#10b9812e',
				},
				blue:{
					night: '#3b82f62e',
				},
				purple:{
					night: '#a855f72e',
				},
				amber:{
					night: '#f59e0b2e',
				},
				pink:{
					night: '#ec48992e',
				},
				indigo:{
					night: '#6366f12e',
				},
				fuchsia:{
					night: '#d946ef2e',
				},
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	],
}
