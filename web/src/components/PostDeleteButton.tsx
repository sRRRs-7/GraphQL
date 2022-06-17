import { Button } from '@chakra-ui/react'
import React from 'react'

type PostDeleteButtonProps = {
  id: number
  deletePost: any
}

const PostDeleteButton: React.FC<PostDeleteButtonProps> = ({ id, deletePost }) => {
  return (
    <>
      <Button
        onClick={async () => {
          window.confirm('Are you sure you wish to delete this item?')
            && deletePost({ deletePostId: id})
        }}
        mx={4}
        bg={"#ff0044"}
        color={"#fff"}
      >
        Delete
      </Button>
    </>
  )
}

export default PostDeleteButton