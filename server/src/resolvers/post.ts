import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { User } from "../entities/User";

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType()
class paginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 20);
    }

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() {userLoader}: MyContext
        ) {
        return userLoader.load(post.creatorId)
    }

    @Query(() => paginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, {nullable: true}) cursor: string | null
    ): Promise<paginatedPosts> {
        const realLimit = Math.min(25, limit);   // select smallest one
        const realLimitPlusOne = realLimit + 1;
        const replacement: any = [realLimitPlusOne]
        if (cursor) {
            replacement.push(new Date(parseInt(cursor)))
        }
        const posts = await Post.query(
            `
            select p.* from post p
            ${cursor ? `where p."createdAt" < $2` : ""}
            order by p."createdAt" DESC
            limit $1
            `,
                replacement
        );
        // const qb = Post
        //     .getRepository()
        //     .createQueryBuilder("p")
        //     .innerJoinAndSelect(
        //         "p.creator",
        //         "u",
        //         'u.id = p."creatorId"'
        //     )
        //     .orderBy('p."createdAt"', "DESC")
        //     .take(realLimitPlusOne)     //equal limit
        //     if (cursor) {
        //         // less than
        //         qb.where('p."createdAt" < :cursor', {
        //             cursor: new Date(parseInt(cursor))
        //         })
        //     }
        //      const posts = await qb.getMany();

            return {
                hasMore: posts.length === realLimitPlusOne,
                posts: posts.slice(0, realLimit),
            }
    }

    @Query(() => Post, {nullable: true})
    post(@Arg("id", () => Int) id: number): Promise<Post | null> {
        return Post.findOne({where: { id: id }});
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
        ): Promise<Post> {
            return Post.create({
                ...input,
                points: 0,
                creatorId: req.session.userId
            }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String) title: string,
        @Arg("text", () => String) text: string,
        @Ctx() { req }: MyContext)
        : Promise<Post | null> {
            const post = await Post.findOne({ where: { id } })
            if (!post) {
                return null
            }
            if (typeof title !== "undefined") {
                post.title = title
                if (typeof text !== "undefined") {
                    post.text = text
                }
                await Post.update({ id: id, creatorId: req.session.userId }, { title, text })
            }
            return post
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
        ): Promise<boolean> {
            await Post.delete({ id, creatorId: req.session.userId })
            return true
    }
}