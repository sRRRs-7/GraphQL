import React from 'react'
import NextLink from "next/link"
import { Button } from '@chakra-ui/react'

type PostUpdateButtonProps = {
  id: number
}

const PostUpdateButton: React.FC<PostUpdateButtonProps>= ({ id }) => {
  return (
    <>
      <NextLink href={`http://localhost:3000/post/update/${id}`}>
        <Button bg={"#ffff00"}>
          Update
        </Button>
      </NextLink>
    </>

  )
}

export default PostUpdateButton