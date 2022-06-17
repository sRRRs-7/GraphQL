import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    BaseEntity,
    ManyToOne,
    OneToMany
} from 'typeorm';
import { Field, Int, ObjectType } from "type-graphql";
import { User } from './User';
import { UpVote } from './UpVote';

@ObjectType()
@Entity()
export class Post extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ nullable: false })
    title!: string;

    @Field(() => String)
    @Column({ nullable: false })
    text!: string;

    @Field(() => Int)
    @Column()
    creatorId: number;

    @Field(() => Int)
    @Column()
    points: number

    @Field()
    @ManyToOne(() => User, (user) => user.posts)
    creator: User

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => [UpVote])
    @OneToMany(() => UpVote, (upVote) => upVote.post)
    upVote: UpVote[];
}