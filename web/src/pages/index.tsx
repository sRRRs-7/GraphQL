import NavBar from "../components/NavBar"
import { withUrqlClient } from "next-urql"
import { urqlClient } from "../utils/urqlClient"
import { useDeletePostMutation, useGetUserQuery, usePostsQuery} from "../generated/graphql"
import { PacmanLoader } from "react-spinners"
import Wrapper from "../components/Wrapper"
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { useState } from "react"
import UpVote from "../components/UpVote"
import { isServer } from "../utils/isServer"
import PostUpdateButton from "../components/PostUpdateButton"
import PostDeleteButton from "../components/PostDeleteButton"

const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: "" });
  const [_, deletePost] = useDeletePostMutation()
  const [{ data: postsData, fetching: postsFetching, error }] = usePostsQuery({
    variables,
  });
  const [{ data: userData }] = useGetUserQuery({
    requestPolicy: 'cache-first',
    pause: isServer(),
});

  if (!postsData && !postsFetching) {
    console.log(error)
    return (
      <div>
        <Wrapper variant="regular">
          <div>you cannot get data for some reason</div>
          <div>{error?.message}</div>
        </Wrapper>
      </div>
    )
  }

  return (
    <div>
      <NavBar />

      <Wrapper variant="regular">
        <Flex px={3} align={"center"}>
          <Heading>sRRRs</Heading>
          <NextLink href="/create-post">
            <Button
              bg={"#00aaff"}
              fontSize={"lg"}
              p={3}
              borderRadius={8}
              ml={"auto"}
            >
              create post
            </Button>
          </NextLink>
        </Flex>
        {
          !postsData && postsFetching
          ? <PacmanLoader color={"#00aaff"}/>
          : postsData?.posts.posts.map((p) => (
            <Stack
              key={p.id}
              mt={7}
              bg={"#33ffff"}
              _hover={{bg:"#7f2"}}
              borderRadius={"3xl"}
            >
                <Box p={10} shadow={"lg"} borderRadius={"3xl"}>

                  <UpVote post={p}/>

                  <Text my={2}>{p.textSnippet}</Text>
                  <Flex>
                    <Text ml={"auto"}>posted by {p.creator.username}</Text>
                  </Flex>
                  <Text ml={"auto"}>{p.id}</Text>
                  <Flex>
                    <Box ml={"auto"}>
                    {
                      p.creator.id === userData?.getUser?.id &&
                        <PostUpdateButton id={ p.id } />
                    }
                    {
                      p.creator.id === userData?.getUser?.id &&
                          <PostDeleteButton id={ p.id } deletePost={ deletePost } />
                    }
                    </Box>
                  </Flex>
                </Box>
            </Stack>
          ))
        }
        { postsData && postsData?.posts.hasMore &&
          <Flex>
            <Button
              onClick={() => setVariables({
                limit: variables.limit,
                cursor: postsData.posts.posts[postsData.posts.posts.length - 1].createdAt
              })}
              isLoading={postsFetching}
              my={8}
              mx={"auto"}
              bg={"#44ff00"}
            >
              Load more
            </Button>
          </Flex>
        }
      </Wrapper>
    </div>
  )
}

export default withUrqlClient(urqlClient, { ssr: true }) (Index);
