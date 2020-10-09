import knex from "knex";
import setupPaginator from "knex-paginator";

const connection = {
  host: "localhost",
  port: "3306",
  user: "tv",
  password: "123456!@",
  database: "fr_db",
  insecureAuth : true
};

const queryBuilder = knex({
  connection,
  client: "mysql"
});
setupPaginator(queryBuilder);

export default queryBuilder;
