import { dedupExchange, fetchExchange, gql, stringifyVariables } from 'urql';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { GetUserDocument, GetUserQuery, LoginMutation, LogoutMutation, RegisterMutation, VoteMutationVariables } from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';
import { isServer } from './isServer';

const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes("not authenticated")) {
                window.location.href= "/login"
            }
        })
    );
};

const cursorPagination = (): Resolver => {
        return (_parent, fieldArgs, cache, info) => {
            const { parentKey: entityKey, fieldName } = info;
            const allFields = cache.inspectFields(entityKey);
            const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
            const size = fieldInfos.length;
            if (size === 0) {
                return undefined;
            }

            const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
            const isItInTheCache = cache.resolve(
                cache.resolve(entityKey, fieldKey) as string,
                "posts"
                );
            info.partial = !isItInTheCache;
            // console.log("entityKey: ", entityKey)
            // console.log("fieldKey: ", fieldKey)
            // console.log("isItInTheCache: ", isItInTheCache)

            const results: string[] = [];
            let hasMore = true;
            fieldInfos.forEach(field => {
                const key = cache.resolve(entityKey, field.fieldKey) as string
                const posts = cache.resolve(key, "posts") as string[]
                const _hasMore = cache.resolve(key, "hasMore")
                if (!_hasMore) {
                    hasMore = _hasMore as boolean
                }
                console.log(posts)
                results.push(...posts);
            })
            return {
                __typename: "paginatedPosts",
                posts: results,
                hasMore
            }
        };
};

// cache
export const urqlClient = (ssrExchange: any, ctx: any) => {
    let cookie;
    if (isServer()) {
        cookie = ctx?.req?.headers.cookie
    }

    return {
        url: process.env.NEXT_PUBLIC_API_URL as string,
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? {
                cookie,
            } : undefined
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                keys: {
                    paginatedPosts: () => null,
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    },
                },
                updates: {
                    Mutation: {
                        vote: (_result, args, cache, info) => {
                            const { postId, value } = args as VoteMutationVariables
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                        id
                                        points
                                    }
                                `,
                                { id: postId }
                            );
                            console.log("data: ", data)
                            if(data) {
                                const newPoints = (data.points as number) + value;
                                cache.writeFragment(
                                    gql`
                                        fragment _ on Post {
                                            points
                                        }
                                    `,
                                    { id: postId, points: newPoints }
                                );
                            }
                        },
                        // create post -> home -> auto refresh
                        // cache reloading
                        createPost: (_result, args, cache, info) => {
                            const allFields = cache.inspectFields("Query")
                            const fieldInfos = allFields.filter((info) => info.fieldName === "posts")
                            fieldInfos.map((field) => {
                                cache.invalidate("Query", "posts", field.arguments)
                            });
                        },
                        deletePost: (_result, args, cache, info) => {
                            const allFields = cache.inspectFields("Query")
                            const fieldInfos = allFields.filter((info) => info.fieldName === "posts")
                            fieldInfos.map((field) => {
                                cache.invalidate("Query", "posts", field.arguments)
                            });
                        },
                        logout: (_result, args, cache, info) => {
                            betterUpdateQuery<LogoutMutation, GetUserQuery>(
                                cache,
                                { query: GetUserDocument },
                                _result,
                                () => ({getUser: null})
                            )
                        },
                        login: (_result, args, cache, info) => {
                            betterUpdateQuery<LoginMutation, GetUserQuery>(
                                cache,
                                { query: GetUserDocument },
                                _result,
                                (result, query) => {
                                    if (result.login.errors) {
                                        return query;
                                    } else {
                                        return {
                                            getUser: result.login.user,
                                        }
                                    }
                                }
                            );
                        },
                        createUser: (_result, args, cache, info) => {
                            betterUpdateQuery<RegisterMutation, GetUserQuery>(
                                cache,
                                { query: GetUserDocument },
                                _result,
                                (result, query) => {
                                    if (result.createUser.errors) {
                                        return query;
                                    } else {
                                        return {
                                            getUser: result.createUser.user,
                                        }
                                    }
                                });
                        },
                    },
                },
            }),
                errorExchange,
                ssrExchange,
                fetchExchange,
        ],
    }
};