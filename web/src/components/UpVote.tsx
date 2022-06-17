import { StarIcon } from '@chakra-ui/icons'
import { Flex, Heading, Icon, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import React, { useState } from 'react'
import { PostsQuery, useVoteMutation } from '../generated/graphql'

type UpVoteProps = {
    post: PostsQuery["posts"]["posts"][0]
}

const UpVote: React.FC<UpVoteProps> = ({ post }) => {
    const[voteState, setVoteState] = useState<boolean>(false)
    const [{ fetching, operation }, vote] = useVoteMutation()

    console.log(fetching, operation)

    return (
    <Flex>
        <NextLink href={`/post/${post.id}`}>
            <Link>
                <Heading fontSize='4xl'>{post.title}</Heading>
            </Link>
        </NextLink>
        <Flex ml={"auto"} textAlign={"center"}>

            <Text fontSize={"2xl"}>{post.points}</Text>

            {
            post.points === 1 ?
            <Icon
                as={StarIcon}
                mx={5}
                w={10}
                h={10}
                color={"#ffff00"}
                _hover={{boxSize: 12}}
                onClick={async() => {
                    await vote({
                        value: -1,
                        postId: post.id
                    });
                    setVoteState(!voteState)
                }}
            />
            :
            <Icon
                as={StarIcon}
                mx={5}
                w={8}
                h={8}
                color={"#fff"}
                _hover={{boxSize: 10}}
                onClick={async() => {
                    await vote({
                        value: 1,
                        postId: post.id
                    });
                    setVoteState(!voteState)
                }}
            />
            }
        </Flex>
    </Flex>
    )
}

export default UpVote