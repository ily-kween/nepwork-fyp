/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        screens: {
            tablet: "640px",
            // => @media (min-width: 640px)
            pc: "1200px",
        },
        extend: {
            backgroundImage: {
                'signUpPattern': "url(src/assets/SignUp.svg)"
            },
            boxShadow: {
                custom_shadow: "4px 0px 2px 0px rgba(0, 0, 0, 0.3)",
            },
            colors: {
                // New brand theme colors
                primary: "#1E40AF",      // Primary: Blue
                secondary: "#64748B",    // Secondary: Slate Gray
                tertiray: "#10B981",     // Tertiary: Emerald Green
                //red
                danger: "#d64343",
                //white text
                primaryText: "#FFFFFF",
                //black text
                secondaryText: "#505050",

                error_color: "#cb3b3b",

                green_border: "#10B981",
                hover_button: "#059669",
                focus_color: "#10B981",
                nav_border_color: "#AEAEAE",
                greentext: "#10B981",
            },
        },
    },
    plugins: [],
};

