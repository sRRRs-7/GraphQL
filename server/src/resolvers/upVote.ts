import { Post } from "../entities/Post";
import { UpVote } from "../entities/UpVote";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";

@Resolver()
export class UpVoteResolver {

    @Query(() => [UpVote])
    getUpVote(): Promise<UpVote[]> {
        return UpVote.find();
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
        ) {
            const userId = req.session.userId
            const isUpVote = value !== -1
            const realValue = isUpVote ? 1 : -1

            const upVote = await UpVote.findOne({where: {postId, userId}})

            if (upVote && upVote.value !== realValue) {
                await UpVote.query(
                    `
                    update up_vote
                    set value = ${realValue}
                    where "postId" = ${postId} and "userId" = ${userId};
                    `,
                )
                await Post.query(
                    `
                    update post
                    set points = points + ${realValue}
                    where id = ${postId};
                    `,
                )
            } else if (!upVote) {
                await UpVote.create({
                    value: realValue,
                    postId: postId,
                    userId: userId
                }).save();
                await Post.query(
                    `
                    START TRANSACTION;
                    update post
                    set points = points + ${realValue}
                    where id = ${postId};
                    COMMIT;
                    `,
                )
            }
            return true
    }
}