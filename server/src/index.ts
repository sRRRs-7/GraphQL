import "reflect-metadata"
import "dotenv-safe/config"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis"
import session from "express-session"
import connectRedis from "connect-redis"
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import cors from "cors"
import { dbSource } from "./typeormConfig";
import { UpVoteResolver } from "./resolvers/upVote";
import { userLoader } from "./utils/userLoader";

async function main () {
    await dbSource.initialize()

    //await dbSource.runMigrations();

    // await Post
    // .createQueryBuilder()
    // .delete()
    // .from(Post)
    // .execute();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);

    app.set("trust proxy", 1);

    app.use(
        cors({
            origin:process.env.CORS_ORIGIN.split(" "),
            credentials: true
        })
    );
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis as any,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 7,  // seven years
                httpOnly: false,
                sameSite: "lax",    // csrf
                secure: __prod__,    //cookie only works in https
                //domain: __prod__ ? "codepomder.com" : undefined
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ HelloResolver,PostResolver, UserResolver, UpVoteResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({
            req,
            res,
            redis,
            userLoader: userLoader()
        }),
        csrfPrevention: true,
    });

    await apolloServer.start();  //  http://localhost:4000/graphql
    apolloServer.applyMiddleware({
        app,
        cors: { origin: true }
    });

    app.listen(parseInt(process.env.PORT), () => {
        console.log("server started on localhost:4000")
    })
}

main().catch((err) => {
    console.log(err)
})
