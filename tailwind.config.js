/** @type {import('tailwindcss').Config} */
export default {
  // curriculumData.js contém classes (SUBJECT_PALETTE, STATUS) — precisa estar aqui
  // ou o purge remove as cores das disciplinas/status.
  content: [
    "./index.html",
    "./*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
