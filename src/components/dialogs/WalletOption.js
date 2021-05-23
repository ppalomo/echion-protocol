import {
    Flex,
    Image,
    Text,
    useColorModeValue,
  } from '@chakra-ui/react';

export default function WalletOption(props) {
    const hoverColor = useColorModeValue('gray.100', 'gray.600');

    return (
        <Flex
            alignItems="center"
            borderRadius="base"
            my="0.5rem"
            p="1rem 1.5rem"
            textAlign="center"
            transition="all 0.3s ease 0s"
            boxShadow="rgba(0, 0, 0, 0.15) 0px 2px 8px"
            bgColor={useColorModeValue('gray.50', 'gray.500')}
            cursor='pointer'
            _hover={
                {
                    bgColor: hoverColor,
                    textDecoration: 'none',
                }
            }
            onClick={props.onClick}
            >
            <Image 
                src={props.image}
                boxSize="30px"
                objectFit="cover" />
            <Text fontSize="1.25rem" fontWeight="600" m="0" userSelect="none" ml="1.5rem">
                {props.name}
            </Text>
        </Flex>
    );

}