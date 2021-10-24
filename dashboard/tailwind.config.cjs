module.exports = {
    purge: [],
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
                }
            },
            animation: {
                rotate360: "rotate360 0.6s both"
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
                    DEFAULT: "#FF5555"
                },
                green: {
                    DEFAULT: "#55AA55"
                },
                yellow: {
                    DEFAULT: "#FFAA00"
                },
                blue: {
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