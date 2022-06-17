import {
    Entity,
    BaseEntity,
    ManyToOne,
    PrimaryColumn,
    Column
} from 'typeorm';
import { Field, Int, ObjectType } from "type-graphql";
import { User } from './User';
import { Post } from './Post';

// many to many
// User -> UpVote <- Post

@ObjectType()
@Entity()
export class UpVote extends BaseEntity {

    @Field(() => Int)
    @Column({type: "int"})
    value: number;

    @Field(() => Int)
    @PrimaryColumn()
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.upVote, { onDelete: 'CASCADE' })
    user: User;

    @Field(() => Int)
    @PrimaryColumn()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.upVote, { onDelete: 'CASCADE' })
    post: Post;
}