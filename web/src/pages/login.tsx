import { Box, Button, Center, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import * as React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from "next-urql"
import { urqlClient } from '../utils/urqlClient';
import NextLink from 'next/link';
import NavBar from '../components/NavBar';

type LoginProps = {}

const Login: React.FC<LoginProps> = () => {
    const router = useRouter()
    const [_, login] = useLoginMutation()

    return (
        <div>
            <NavBar />

            <Wrapper variant="small">
                <Center
                    mb={6}
                    bg={"tomato"}
                    color={"white"}
                    h={10}
                    borderRadius={20}
                    fontSize={"xl"}
                    fontFamily={"serif"}
                >
                    Login
                </Center>
                <Formik
                    initialValues={{ usernameOrEmail:"", password:"" }}
                    onSubmit={async (values, { setErrors }) => {
                        console.log(values);
                        const res = await login(values)
                        if (res.data?.login.errors) {
                            setErrors(toErrorMap(res.data?.login.errors));
                        } else if (res.data?.login.user) {
                            if (typeof router.query.next === 'string') {
                                router.push(router.query.next);
                            } else {
                                router.push("/");
                            }
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                label='UsernameOrEmail'
                                textarea={false}
                                placeholder='usernameOrEmail'
                                name='usernameOrEmail'
                            />
                            <Box mt={5}>
                                <InputField
                                    label='Password'
                                    textarea={false}
                                    placeholder='password'
                                    name='password'
                                    type='password'
                                />
                                <Flex>
                                    <NextLink
                                        href="/forgot-password"
                                    >
                                        <Link
                                            color={"blue"}
                                            ml={"auto"}
                                        >
                                            forgot password
                                        </Link>
                                    </NextLink>
                                </Flex>
                            </Box>
                            <Button
                                isLoading={isSubmitting}
                                mt={6}
                                type='submit'
                                colorScheme='cyan'
                                size="md"
                                variant="solid"
                            >
                                Login
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </div>
    );
}

export default withUrqlClient(urqlClient, {ssr: true}) (Login);
