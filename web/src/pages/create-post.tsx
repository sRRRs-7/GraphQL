import { Box, Button, Center, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import InputField from '../components/InputField';
import NavBar from '../components/NavBar';
import Wrapper from '../components/Wrapper';
import { useCreatePostMutation, useGetUserQuery } from '../generated/graphql';
import { urqlClient } from '../utils/urqlClient';


const CreatePost: React.FC<{}> = ({}) => {
    const [success, setSuccess] = useState(false)
    const [blank, setBlank] = useState(false)
    const [{ data, fetching }] = useGetUserQuery()
    const [_, createPost] = useCreatePostMutation()
    const router = useRouter()

    useEffect(() => {
        if (!fetching && !data?.getUser) {
            router.push("/login?next=" + router.pathname)
        }
    }, [fetching, data, router])

    return (
        <div>
            <NavBar />

            <Wrapper variant="small">
                <Center
                    mb={6}
                    bg={"purple"}
                    color={"white"}
                    h={10}
                    borderRadius={20}
                    fontSize={"xl"}
                    fontFamily={"serif"}
                >
                    Post
                </Center>
                <Formik
                    initialValues={{ title: "", text: "" }}
                    onSubmit={async (values) => {
                        console.log(values);
                        if (values.title.length === 0) {
                            setBlank(true)
                        } else if (values.text.length === 0) {
                            setBlank(true)
                        } else {
                            const { error } = await createPost({ input: values });
                            if (error) {
                                router.push("/login")
                            }
                            // values.title = ""
                            // values.text = ""
                            setSuccess(true)
                            router.push("/")
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                label='Title'
                                textarea={false}
                                placeholder='title'
                                name='title'
                            />
                            <Box mt={5}>
                            <InputField
                                label='Text'
                                textarea={true}
                                placeholder='What is doing...'
                                name='text'
                            />
                            </Box>
                            {
                                blank && (
                                    <Box color={"red"}>
                                        cannot blank field
                                    </Box>)
                            }
                            <Flex>
                                <Button
                                    isLoading={isSubmitting}
                                    mt={6}
                                    type='submit'
                                    colorScheme='cyan'
                                    size="md"
                                    variant="solid"
                                >
                                    POST
                                </Button>
                                {
                                    success
                                    ? <Box
                                        ml={"auto"}
                                        mt={6}
                                        fontSize={"lg"}
                                        color={"#0000ff"}
                                    >
                                        Successfully
                                    </Box>
                                    : null
                                }
                            </Flex>

                        </Form>

                    )}
                </Formik>
            </Wrapper>
        </div>
    )
}

export default withUrqlClient(urqlClient, {ssr: false}) (CreatePost)