"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const cors_1 = __importDefault(require("cors"));
const typeormConfig_1 = require("./typeormConfig");
const upVote_1 = require("./resolvers/upVote");
const userLoader_1 = require("./utils/userLoader");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield typeormConfig_1.dbSource.initialize();
        const app = (0, express_1.default)();
        const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
        const redis = new ioredis_1.default(process.env.REDIS_URL);
        app.set("trust proxy", 1);
        app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN.split(" "),
            credentials: true
        }));
        app.use((0, express_session_1.default)({
            name: constants_1.COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 7,
                httpOnly: false,
                sameSite: "lax",
                secure: constants_1.__prod__,
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false,
        }));
        const apolloServer = new apollo_server_express_1.ApolloServer({
            schema: yield (0, type_graphql_1.buildSchema)({
                resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver, upVote_1.UpVoteResolver],
                validate: false,
            }),
            context: ({ req, res }) => ({
                req,
                res,
                redis,
                userLoader: (0, userLoader_1.userLoader)()
            }),
            csrfPrevention: true,
        });
        yield apolloServer.start();
        apolloServer.applyMiddleware({
            app,
            cors: { origin: true }
        });
        app.listen(parseInt(process.env.PORT), () => {
            console.log("server started on localhost:4000");
        });
    });
}
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map