import { extendTheme, useColorModeValue } from "@chakra-ui/react";

export default extendTheme({
    initialColorMode: "dark",
    useSystemColorMode: false,
    colors: {
        text: {
            100: "#171923",
            900: "#EFF2EF"
        },
        header: {
            100: "#F7EBF3",
            900: "#171923"
        },
        bg: {
            100: "#FFFFFF",
            900: "#1A202C"
        },
        border: {
            100: "#CBD5E0",
            900: "#2D3748",
        },
        primary: {
            100: "#FF048A",
            500: "#E6007A",
            900: "#E6007A",
        },
    },
    styles: {
        global: (props) => ({
            'html, body': {
                bgColor: props.colorMode === 'dark' ? 'black.200' : 'white.200',
                color: props.colorMode === 'dark' ? 'white.100' : 'black.100',
            },
            "a.top-menu-link": {
                color: props.colorMode === "light" ? "text.100" : "text.900",
                fontWeight: props.colorMode === "light" ? "500" : "400",
                _hover: {
                    color: props.colorMode === "light" ? "gray.500" : "gray.300",
                    textDecoration: 'none',
                }
            },
            "a.top-menu-link-selected": {
                color: props.colorMode === "light" ? "primary.900" : "primary.100",
                fontWeight: props.colorMode === "light" ? "500" : "400",
                _hover: {
                    color: props.colorMode === "light" ? "primary.100" : "primary.900",
                    textDecoration: 'none',
                }
            },
            "a.top-menu-mobile": {
                color: props.colorMode === "light" ? "text.100" : "text.900",
                w: "100%"
            }
        }),
    },
    components: {
        Button: {
            baseStyle: (props) => ({
            })
        }
    }
});