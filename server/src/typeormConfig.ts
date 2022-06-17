import { DataSource } from "typeorm"

export const dbSource = new DataSource({
    url: process.env.POSTGRES_URL,
    type: "postgres",
    logging: true,
    synchronize: true,
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
})