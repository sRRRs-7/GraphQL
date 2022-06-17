import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    BaseEntity,
    OneToMany
} from 'typeorm';
import { Field, ObjectType } from "type-graphql";
import { Post } from './Post';
import { UpVote } from './UpVote';

@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ unique: true, nullable: true  })
    username!: string;

    @Field(() => String)
    @Column({ unique: true, nullable: true })
    email!: string;

    @Column({ nullable: false })
    password!: string;

    @Field(() => Boolean)
    @Column({ nullable: false, default: false })
    hasVote: boolean;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => [Post])
    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];

    @Field(() => [UpVote])
    @OneToMany(() => UpVote, (upVote) => upVote.user)
    upVote: UpVote[];
}