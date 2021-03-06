import knex from "knex";
import setupPaginator from "knex-paginator";
import moment from "moment";

const connection = {
  host: "localhost",
  port: "3306",
  user: "tv",
  password: "123456!@",
  database: "fr_db_test1",
  insecureAuth : true,
  typeCast: function (field, next) {
  if (field.type == 'DATE') {
        return moment(field.string()).format('YYYY-MM-DD');
     }
     return next();
   }  
};

const queryBuilder = knex({
  connection,
  client: "mysql"
});
setupPaginator(queryBuilder);

export default queryBuilder;
