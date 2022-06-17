import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, InputType, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import argon2 from "argon2"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@InputType()
class RequestInput {
    @Field()
    username: string
    @Field()
    email: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];
    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver(User)
export class UserResolver {

    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() {req}: MyContext){
        // current user and its ok to show them own email
        if (req.session.userId === user.id) {
            return user.email
        }
        // not show email
        return ""
    }

    @Query(() => [User])
    getUsers(): Promise<User[]> {
        return User.find();
    }

    @Query(() => User, {nullable: true})
    getUser(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null // not login
        }
        return User.findOne({ where: { id: req.session.userId } })
        }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 4) {
            return { errors: [
                {
                    field: "newPassword",
                    message: "must be at least 4 characters"
                },
            ]};
        };
        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId) {
            return { errors: [
                {
                    field: "token",
                    message: "token expired"
                },
            ]};
        }
        const user = await User.findOne({ where: { id: parseInt(userId) } })
        if (!user) {
            return { errors: [
                {
                    field: "id",
                    message: "user not exists"
                }
            ]}
        }

        await User.update(
            {id: parseInt(userId)},
            {password: await argon2.hash(newPassword)}
        )

        redis.del(key)  // expired token
        req.session.userId = user.id

        return { user }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return true
        }
        const token = v4()
        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            "EX",
            1000 * 60 * 60 * 24 * 3,    // 3days
        )
        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        )
        return true
    }

    @Mutation(() => UserResponse)
    async createUser(
        @Arg("options") options: RequestInput,
        @Ctx() { req }: MyContext
        ): Promise<UserResponse> {
            if (options.username.length <= 2) {
                return {
                    errors: [
                        {
                        field: 'username',
                        message: 'username must be greater than 2 characters'
                        },
                    ],
                };
            }
            if (!options.email.includes("@")) {
                return {
                    errors: [
                        {
                        field: 'email',
                        message: 'invalid email address, required "@"'
                        },
                    ],
                };
            }
            if (options.username.includes("@")) {
                return {
                    errors: [
                        {
                        field: 'username',
                        message: 'cannot include "@" in username'
                        },
                    ],
                };
            }
            if (options.password.length <= 4) {
                return {
                    errors: [
                        {
                        field: 'password',
                        message: 'password must be greater than 4 characters'
                        },
                    ],
                };
            }
            const hashPassword = await argon2.hash(options.password)
            let user
            try {
                const result = await User
                    .createQueryBuilder()
                    .insert()
                    .into(User)
                    .values([
                        {
                            username: options.username,
                            password: hashPassword,
                            email: options.email,
                        },
                    ])
                    .returning("*")
                    .execute();
                    user = result.raw[0]
            } catch (err) {
                console.log("message: ", err)
                if (err.code === "23505" || err.detail.includes("already exists")){
                    return {
                        errors: [
                            {
                            field: "usernameOrEmail",
                            message: "username already exists",
                            },
                        ],
                    };
                }
            }
            req.session.userId = user.id;
            return { user }
        }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
        ): Promise<UserResponse> {
            let user
            if (usernameOrEmail.includes("@")) {
                user = await User.findOne({where: {email: usernameOrEmail} })
            } else if (!usernameOrEmail.includes("@")) {
                user = await User.findOne({where: {username: usernameOrEmail} })
            }
            if (!user) {
                return {
                    errors: [
                        {
                        field: "usernameOrEmail",
                        message: "that username does not exist"
                        },
                    ],
                };
            }
            const valid = await argon2.verify(user.password, password)
            if (!valid) {
                return {
                    errors: [
                        {
                        field: "password",
                        message: "incorrect password"
                        },
                    ],
                };
            }
            req.session.userId = user.id;
            return { user }
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME)
            if (err) {
                console.log(err)
                return resolve(false)
            }
            return resolve(true)
        }))
    }

    @Mutation(() => User, { nullable: true })
    async updateUser(
        @Arg("id") id: number,
        @Arg("options") options: RequestInput,
        ): Promise<User | null> {
            const user = await User.findOne({ where:{ id } })
            if (!user) {
                return null
            }
            if (typeof options.username !== "undefined") {
                user.username = options.username
                await User.update({ id }, { username: options.username })
            }
            if (typeof options.password !== "undefined") {
                user.password = options.password
                await User.update({ id }, { password: options.password })
            }
            return user
        }

        @Mutation(() => User, { nullable: true })
        async deleteUser(@Arg("id") id: number): Promise<boolean> {
            await User.delete({ id })
            return true
            }
}