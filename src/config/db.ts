import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import path from "path";
import configs from "./config";

dotenv.config({
    path: path.join(__dirname, "../../.env"),
});

const env = (process.env.NODE_ENV || "development") as keyof typeof configs;
const configFile = configs[env];

const sequelize: Sequelize = new Sequelize({
    database: configFile.database,
    dialect: "postgres",
    username: configFile.username,
    password: configFile.password,
    host: configFile.host,
    models: [],
    logging: false,
});

export default sequelize;