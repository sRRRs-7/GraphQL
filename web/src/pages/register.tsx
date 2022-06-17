import { Box, Button, Center } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import * as React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from "next-urql";
import { urqlClient } from '../utils/urqlClient';
import NavBar from '../components/NavBar';


const Register = () => {
    const router = useRouter();
    const [{}, register] = useRegisterMutation()

    return (
        <div>
            <NavBar />

            <Wrapper variant="small">
                <Center
                    mb={6}
                    bg={"blue"}
                    color={"white"}
                    h={10}
                    borderRadius={20}
                    fontSize={"xl"}
                    fontFamily={"serif"}
                >
                    Register
                </Center>
                <Formik
                    initialValues={{ username:"", email:"", password:"" }}
                    onSubmit={async (values, { setErrors }) => {
                        console.log(values);
                        const res = await register({ options:values });
                        if (res.data?.createUser.errors) {
                            console.log(res.data?.createUser.errors)
                            setErrors(toErrorMap(res.data?.createUser.errors));
                        } else if (res.data?.createUser.user) {
                            router.push("/");
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                label='Username'
                                textarea={false}
                                placeholder='username'
                                name='username'
                            />
                            <Box mt={5}>
                                <InputField
                                    label='Email'
                                    textarea={false}
                                    placeholder='email'
                                    name='email'
                                    type='email'
                                />
                            </Box>
                            <Box mt={5}>
                                <InputField
                                    label='Password'
                                    textarea={false}
                                    placeholder='password'
                                    name='password'
                                    type='password'
                                />
                            </Box>
                                <Button
                                    isLoading={isSubmitting}
                                    mt={6}
                                    type='submit'
                                    colorScheme='cyan'
                                    size="md"
                                    variant="solid"
                                >
                                    register
                                </Button>
                        </Form>

                    )}
                </Formik>
            </Wrapper>
        </div>
    );
}

export default withUrqlClient(urqlClient, { ssr: false }) (Register);
