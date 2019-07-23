const express = require('express');
const graphql = require('graphql');
const graphqlHttp = require('express-graphql');

// 1. 使用 GraphQLObjectType 定义 type(类型)

let AccountType = new graphql.GraphQLObjectType({
  name:'Account',
  fields:{
    name:{type: graphql.GraphQLString },
    age:{type: graphql.GraphQLInt },
    sex:{type: graphql.GraphQLString },
    department:{type: graphql.GraphQLString },
  }
})
// 2. 使用 GraphQLObjectType 定义 query（查询）
let queryType = new graphql.GraphQLObjectType({
  name:'Query',
  fields:{
    account:{
      type: AccountType,
      args:{
        username: { type: graphql.GraphQLString }
      },
      resolve:function (_,{username}) {
        const name = username;
        const sex = 'man';
        const age = 18;
        const department = '开发部';
        return {
          name,
          sex,
          age,
          department
        }
      }
    }
  }
})
// 3. 创建 schema
let schema = new graphql.GraphQLSchema({query:queryType});

const app = express();
app.use('/graphql',graphqlHttp({
  schema,
  rootValue: global,
  graphiql:true,
}))
app.listen(3000);