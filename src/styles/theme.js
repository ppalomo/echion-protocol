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
            100: "#EFF2EF",
            900: "#171923"
        },
        border: {
            100: "#CBD5E0",
            900: "#2D3748",
        },
        pink: {
            100: "#E6007A",
        },
    },
    styles: {
        global: (props) => ({
            'html, body': {
                bgColor: props.colorMode === 'dark' ? 'black.200' : 'white.200',
                color: props.colorMode === 'dark' ? 'white.100' : 'black.100',
            },
            a: {
                color: props.colorMode === "light" ? "text.100" : "text.900",
                _hover: {
                    color: "pink.100",
                    textDecoration: 'none',
                }
            }
        }),
    },
    components: {
        Button: {
            baseStyle: (props) => ({
                // color: props.colorMode === "light" ? "text.100" : "text.900",
                // _hover: {
                //     color: "pink.100",
                //     textDecoration: 'none',
                // }
            })
        }
    }
});