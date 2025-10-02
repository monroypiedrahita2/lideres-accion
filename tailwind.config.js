/** @type {import('tailwindcss').Config} */

const screens = {
  sm: [
    {
      min: "300px",
      max: "599px",
    },
    {
      min: "300px",
    },
  ],
  md: [
    {
      min: "600px",
      max: "767px",
    },
    {
      min: "600px",
    },
  ],
  lg: [
    {
      min: "768px",
      max: "1023px",
    },
    {
      min: "768px",
    },
  ],
  xl: [
    {
      min: "1024px",
      max: "1368px",
    },
    {
      min: "1024px",
    },
  ],
  "2xl": [
    {
      min: "1369px",
      max: "1920px",
    },
    {
      min: "1369px",
    },
  ],
  "3xl": [
    {
      min: "1921px",
    },
  ],
};

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    screens: screens,
    extend: {
      colors: {
        'primary': '#0c82c7',
        'secundary': '#1ca6e6',
        'tertiary': '#ffce00',
        'base': "white",
        'base-two': "gray-500",
      },
      backgroundImage: {
        'azulmira-gradient': 'linear-gradient(to bottom, white 5%, #your-azulmira-color 5%)',
      },
      fontFamily: {
        primary: ["Genos", "sans-serif"],
        secundary: ["kalam", "sans-serif"],
      },
      fontSize: {
        'sm-text': ['12px', '16px'], // Tamaño de texto para pantallas pequeñas
        'lg-text': ['18px', '24px'], // Tamaño de texto para pantallas grandes
      },
    },
  },
  plugins: [],
}

