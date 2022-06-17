import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import { urqlClient } from '../../utils/urqlClient'
import { useRouter } from 'next/router'
import React from 'react'
import NavBar from '../../components/NavBar'
import Wrapper from '../../components/Wrapper'
import { useDeletePostMutation, useGetUserQuery, usePostQuery } from '../../generated/graphql'
import { isServer } from '../../utils/isServer'
import PostUpdateButton from '../../components/PostUpdateButton'
import { withApollo } from '../../utils/apolloClient'


const PostDetail = () => {
  const router = useRouter()
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  const { data: postData, loading: postsLoading } = usePostQuery({
    skip: intId === -1,
    variables: {
      postId: intId,
    }
  })
  const [ deletePost, {}] = useDeletePostMutation()
  const { data: userData } = useGetUserQuery({
    fetchPolicy: 'cache-first',
    skip: isServer(),
});


  if (postsLoading) {
    return (
      <Box>
        loading...
      </Box>
    )
  }

  if(!postData?.post) {
    return (
      <div>
      <NavBar />
      <Wrapper variant="regular">
        not found
      </Wrapper>
    </div>
    )
  }

  return (
    <div>
      <NavBar />

      <Wrapper variant="regular">
        <Box bg={"#00ff00"} p={7}>
          <Heading>{postData?.post?.title}</Heading>
          <Text fontSize={"2xl"}>{postData?.post?.text}</Text>
          <Text fontSize={"xl"}>{postData?.post?.creator.username}</Text>
          <Text fontSize={"xl"}>{postData?.post?.points}</Text>
          <Flex>
            <Box ml={"auto"}>
            {
              postData?.post?.creator.id === userData?.getUser?.id &&
                <PostUpdateButton id={intId} />
            }
            {
              postData?.post?.creator.id === userData?.getUser?.id && (
                  <Button
                  onClick={async () => {
                    if (window.confirm('Are you sure you wish to delete this item?')) {
                      await deletePost({ variables: { deletePostId: intId }})
                      router.push("/")
                    } else {
                      null
                    }
                  }}
                  mx={4}
                  bg={"#ff0044"}
                  color={"#fff"}
                >
                  Delete
                </Button>)
            }
            </Box>
          </Flex>
        </Box>
      </Wrapper>
    </div>
  )
}

export default withApollo({ ssr:true }) (PostDetail)