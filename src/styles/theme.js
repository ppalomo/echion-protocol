import { extendTheme } from "@chakra-ui/react";

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

        
        customWhite: {
            100: "#F7ECF4",
            200: "#FFFFFF",
        },
        pink: {
            100: "#E6007A",
        },
        green: {
            100: "#2ca58d",
        },
        blue: {
            100: "#4f86c6"
        }
    },
    styles: {
        global: (props) => ({
            'html, body': {
                bgColor: props.colorMode === 'dark' ? 'black.200' : 'white.200',
                color: props.colorMode === 'dark' ? 'white.100' : 'black.100',
            }
        }),
    },
});