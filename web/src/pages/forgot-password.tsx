import { Box, Button, Center } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react'
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { urqlClient } from '../utils/urqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false)
    const [_, forgotPassword] = useForgotPasswordMutation();

    return (
        <div>
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
                    Forget Password
                </Center>
                <Formik
                    initialValues={{ email:"" }}
                    onSubmit={async (values) => {
                        forgotPassword(values)
                        setComplete(true)
                    }}
                >
                    {({ isSubmitting }) => complete ? (
                        <Box mx={14}>
                            <p>
                                if an account with that email exists,
                            </p>
                            <p>
                                we can sent you can email
                            </p>
                        </Box>
                        ) : (
                        <Form>
                            <InputField
                                label='Email'
                                textarea={false}
                                placeholder='email'
                                name='email'
                                type='email'
                            />
                            <Button
                                isLoading={isSubmitting}
                                mt={6}
                                type='submit'
                                colorScheme='cyan'
                                size="md"
                                variant="solid"
                            >
                                send email
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </div>
    )
}

export default withUrqlClient(urqlClient, { ssr: false }) (ForgotPassword)