import DataLoader from "dataloader"
import { User } from "../entities/User"
import { In } from "typeorm"

export const userLoader = () => new DataLoader<number, User>( async (userIds) => {
    const users = await User.findBy({id: In(userIds as number[])})
    const userIdToUser: Record<number, User> = {}
    users.map((u) => {
        userIdToUser[u.id] = u;
    });
    const loadUser = userIds.map((userId) => userIdToUser[userId]);
    console.log("userIds", userIds)
    console.log("map", userIdToUser)
    console.log("loadUser", loadUser)
    return loadUser
})