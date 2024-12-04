/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layout/**/*.{js,ts,jsx,tsx,mdx}"

  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
      }
    },
    colors:{
      "gray-100":"#121212",
      "gray-200":"#B3B3B3",
      "gray-300":"#535353",
      "gray-500":"#282828",
      "gray-600":"#465A7E66",

      // black

      "black-100":"#000000",

      // green
      "green-100":"#3BE477",
      "green-200":"#1DE760",
    },
  },
  plugins: []
};
