const dsPreset = require('@navikt/ds-tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [dsPreset],
    content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
};
