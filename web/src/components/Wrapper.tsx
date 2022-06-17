import { Box } from '@chakra-ui/react';
import * as React from 'react';

type WrapperProps = {
    children: any,
    variant?: "regular" | "small"
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant }) => {
    return (
        <Box
            mt={8}
            mx="auto"
            maxW={variant==="regular" ? "800px" : "400px"}
            w="100%"
        >
            { children }
        </Box>
    );
}

export default Wrapper