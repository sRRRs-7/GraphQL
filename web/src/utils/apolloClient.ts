import { ApolloClient, InMemoryCache } from "@apollo/client";
import { PaginatedPosts } from '../generated/graphql';
import { withApollo as withApolloClient } from "next-apollo";

const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL as string,
    ssrMode: true,
    credentials: "include",
    cache: new InMemoryCache({
    // typePolicies: {
    //     Query: {
    //     fields: {
    //         posts: {
    //         keyArgs: ["limit"],
    //         merge(
    //             existing: PaginatedPosts | undefined,
    //             incoming: PaginatedPosts
    //             ): PaginatedPosts {
    //             console.log(existing, incoming);
    //             return {
    //                 ...incoming,
    //                 posts: [
    //                 ...(existing?.posts || []),
    //                 ...incoming.posts
    //                 ]
    //             };
    //         },
    //         },
    //     },
    //     },
    // },
    })
});

export const withApollo = withApolloClient(client);