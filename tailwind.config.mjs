
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ['selector'],
	theme: {
		extend: {
			fontSize:{
				32: '2rem',
			},
			maxHeight:{
				'4/5': '80%',
			},
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
				deepgray:{
					light: '#424242ff',
					night: '#ffffffff',
				},
			},
			animation:{
				'animate-bounce-left': 'bounce-left 1s infinite',
				'animate-bounce-right': 'bounce-right 1s infinite',
			},
			keyframes:{
				'bounce-left': {
					'0%, 100%': {
						transform: 'translateX(0)',
					},
					'50%': {
						transform: 'translateX(-25%)',
					},
				},
				'bounce-right': {
					'0%, 100%': {
						transform: 'translateX(0)',
					},
					'50%': {
						transform: 'translateX(25%)',
					},
				},
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	],
}
