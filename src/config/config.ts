import "dotenv/config";
const configs = {
    development: {
        username: process.env.DEVELOPMENT_PG_USER,
        password: process.env.DEVELOPMENT_PG_PASSWORD,
        database: process.env.DEVELOPMENT_PG_DATABASE,
        host: process.env.DEVELOPMENT_PG_HOST,
        dialect: "postgres"
    },
    test: {
        username: process.env.TEST_PG_USER,
        password: process.env.TEST_PG_PASSWORD,
        database: process.env.TEST_PG_DATABASE,
        host: process.env.TEST_PG_HOST,
        dialect: "postgres"
    },
    production: {
        username: process.env.PRODUCTION_PG_USER,
        password: process.env.PRODUCTION_PG_PASSWORD,
        database: process.env.PRODUCTION_PG_DATABASE,
        host: process.env.PRODUCTION_PG_HOST,
        dialect: "postgres"
    }
};

export default configs;
module.exports = configs;