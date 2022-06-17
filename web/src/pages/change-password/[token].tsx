import { Box, Button, Center, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql';
import { urqlClient } from '../../utils/urqlClient';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link'
import { withApollo } from '../../utils/apolloClient';

const ChangePassword = () => {
    const [tokenError, setTokenError] = useState("")
    const router = useRouter()
    const [changePassword, {}] = useChangePasswordMutation()

    return (
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
                Change Password
            </Center>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    console.log(values);
                    const res = await changePassword({variables: {
                        newPassword: values.newPassword,
                        token:
                            typeof router.query.token === "string"
                            ? router.query.token
                            : ""
                    }});
                    if (res.data?.changePassword.errors) {
                        const errorMap = toErrorMap(res.data.changePassword.errors)
                        if ("token" in errorMap) {
                            setTokenError(errorMap.token)
                        }
                        setErrors(errorMap);
                    } else if (res.data?.changePassword.user) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                label='New Password'
                                textarea={false}
                                placeholder='new Password'
                                name='newPassword'
                            />
                            {
                                tokenError &&
                                    <Flex>
                                        <Box mr={8} color={"red"}>{tokenError}</Box>
                                        <NextLink href="/forgot-password">
                                            <Link
                                                color={"blue"}
                                                ml={"auto"}
                                            >
                                                publish token again
                                            </Link>
                                        </NextLink>
                                    </Flex>
                            }
                            <Button
                                isLoading={isSubmitting}
                                mt={6}
                                type='submit'
                                colorScheme='cyan'
                                size="md"
                                variant="solid"
                            >
                                change password
                            </Button>
                        </Form>
                    )}
                    </Formik>
                </Wrapper>
    )
}

export default withApollo({ ssr: false }) (ChangePassword)