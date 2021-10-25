module.exports = {
    purge: [
        /*
        "./dashboard/views/*.ejs",       
        "./dashboard/views/utils/*.ejs"
        */
    ],
    darkMode: "class",
    theme: {
        extend: {
            keyframes: {
                rotate360: {
                    "0%": {
                        transform: "rotate(0deg)"
                    },
                    "100%": {
                        transform: "rotate(360deg)"
                    }
                },
                rightToLeft: {
                    "0%": {
                        transform: "translateX(200%)"
                    },
                    "100%": {
                        transform: "translateX(0)"
                    }
                },
                leftToRight: {
                    "0%": {
                        transform: "translateX(0)"
                    },
                    "100%": {
                        transform: "translateX(200%)"
                    }
                }
            },
            animation: {
                rotate360: "rotate360 0.6s both",
                rightToLeft: "rightToLeft 2s ease",
                leftToRight: "leftToRight 2s ease"
            },
            colors: {
                blurple: {
                    DEFAULT: "#5865F2"
                },
                instagram: {
                    one: "#F09433",
                    two: "#F09433",
                    three: "#E6683C",
                    four: "#DC2743",
                    five: "#CC2366",
                    six: "#BC1888"
                },
                red: {
                    dark: "#FF1414",
                    DEFAULT: "#FF5555"
                },
                green: {
                    dark: "#3B763B",
                    DEFAULT: "#55AA55"
                },
                yellow: {
                    dark: "#CE8900",
                    DEFAULT: "#FFAA00"
                },
                blue: {
                    dark: "#1212FC",
                    DEFAULT: "#5555FD"
                },
                gray: {
                    DEFAULT: "#808080",
                    primary: "#37393F",
                    secondary: "#202225"
                },
                white: {
                    DEFAULT: "#FFFFFF",
                    primary: "#FFFFFF",
                    secondary: "#E3E5E8"
                }
            }
        }
    },
    variants: {
        extend: {
            display: ["dark"],
            animation: ["hover", "group-hover"] 
        }
    },
    plugins: []
}