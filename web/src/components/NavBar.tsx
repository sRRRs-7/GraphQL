import { Box, Button, Flex, Link } from '@chakra-ui/react'
import NextLink from "next/link"
import { useRouter } from 'next/router'
import { PacmanLoader } from 'react-spinners'
import { useGetUserQuery, useLogoutMutation } from '../generated/graphql'
import { isServer } from '../utils/isServer'


type NavBarProps = {}

const NavBar: React.FC<NavBarProps> = ()=> {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useGetUserQuery({
        requestPolicy: 'cache-first',
        pause: isServer(),
    });
    const router = useRouter();
    let body = null;

    if (fetching) {
        // mpt login
    } else if (!data?.getUser) {
        body = (
            <>
            <Link
                href='/'
                color={"white"}
                mr={4}
                _hover={{ fontSize: 20 }}
            >
                Home
            </Link>
            <Link
                href='/login'
                color={"white"}
                mr={4}
                _hover={{ fontSize: 20 }}
            >
                Login
            </Link>
            <Link
                href='/register'
                color={"white"}
                _hover={{ fontSize: 20 }}
            >
                Register
            </Link>
            </>
        )
        } else {
        body = (
            <Flex align={"center"}>
                <Link
                    href='/'
                    color={"white"}
                    mr={4}
                    _hover={{ fontSize: 20 }}
                >
                    Home
                </Link>
                <Link
                    href='/create-post'
                    color={"cyan"}
                    _hover={{ fontSize: 25 }}
                    mr={7}
                >
                    Post
                </Link>
                <Box
                    mx={5}
                    color={"yellow"}
                >
                    {data?.getUser?.username}
                </Box>
                <Button
                    onClick={ async () => {
                        await logout()
                        router.reload()
                    }}
                    isLoading={logoutFetching}
                    colorScheme={"red"}
                    size={"sm"}
                >
                    logout
                </Button>
            </Flex>
        )
    }

    return (
        <Flex
            bg="green"
            zIndex={1}
            p={4}
            h={16}
            position={"sticky"}
            top={0}
        >
            <Flex flex={1} maxW={900} mx={"auto"} align={"center"}>
                <NextLink href={"/"}>
                    <Link fontSize={"4xl"} mx={5} color={"white"}>sRRRs</Link>
                </NextLink>
                {
                    fetching ?
                        <PacmanLoader
                            color={"cyan"}
                            loading={fetching}
                            size={30}
                        />
                    :
                    <Box ml={"auto"}>
                        {body}
                    </Box>
                }
            </Flex>
        </Flex>
    )
}

export default NavBar