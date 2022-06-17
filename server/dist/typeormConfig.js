"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbSource = void 0;
const typeorm_1 = require("typeorm");
exports.dbSource = new typeorm_1.DataSource({
    url: process.env.POSTGRES_URL,
    type: "postgres",
    logging: true,
    synchronize: true,
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
});
//# sourceMappingURL=typeormConfig.js.map