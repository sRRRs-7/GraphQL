import { Box, Button, Center, Flex } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { urqlClient } from '../../../utils/urqlClient'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import InputField from '../../../components/InputField'
import NavBar from '../../../components/NavBar'
import Wrapper from '../../../components/Wrapper'
import { useGetUserQuery, usePostQuery, useUpdatePostMutation } from '../../../generated/graphql'
import { withApollo } from '../../../utils/apolloClient'


const UpdatePost = () => {
    const router = useRouter()
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : 0
    const [success, setSuccess] = useState(false)
    const [blank, setBlank] = useState(false)
    const [updatePost, {}] = useUpdatePostMutation()
    const { data: userData, loading: userLoading } = useGetUserQuery()
    const { data: postData } = usePostQuery({
        skip: intId === -1,
        variables: {
            postId: intId
        }
    })


    useEffect(() => {
        if (!userLoading && !userData?.getUser) {
            router.push("/login?next=" + router.pathname)
        }
    }, [userLoading, userData, router])


    if (!postData) {
        return (
            <Box>
                postData not found
            </Box>
        )
    }

    return (
        <div>
        <NavBar />

        <Wrapper variant="small">
            <Center
                mb={6}
                bg={"#ffff00"}
                color={"#000"}
                h={10}
                borderRadius={20}
                fontSize={"xl"}
                fontFamily={"serif"}
            >
                Update Post
            </Center>
            <Formik
                initialValues={{
                    title: postData?.post?.title,
                    text: postData?.post?.text
                }}
                onSubmit={async (values) => {
                    console.log(values);
                    if (values?.title?.length === 0) {
                        setBlank(true)
                    } else if (values?.text?.length === 0) {
                        setBlank(true)
                    } else {
                        const  { errors }  = await updatePost({ variables: {
                            updatePostId: intId,
                            title: values.title as string,
                            text: values.text as string,
                        }});
                        if (errors) {
                            router.push("/login")
                        }
                        // values.title = ""
                        // values.text = ""
                        setSuccess(true)
                        router.back()
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
                                Update
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

export default withApollo({ ssr: false }) (UpdatePost)