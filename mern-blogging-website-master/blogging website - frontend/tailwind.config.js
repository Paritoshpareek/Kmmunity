/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        
        colors: {
            'white': '#FFFFFF',
            'black': '#242424',
            'grey': '#F3F3F3',
            'dark-grey': '#6B6B6B',
            'red': '#FF4E4E',
             'youtube': '#1DA1F2',
            'twitter': '#1DF26E',
            'instagram': '#F21DA1',
            'facebook': '#FF4E4E',
            'github': '#FF4E4E',
            'purple': '#8B46FF',
            'transparent': 'transparent',
           
        },

        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },
        corePlugins: {
            aspectRatio: false,
          },

        extend: {
            fontFamily: {
              inter: ["'Inter'", "sans-serif"],
              gelasio: ["'Gelasio'", "serif"]
            },
        },

    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
      ],
};