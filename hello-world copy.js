const express = require('express');
const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');
// 定义schma 查询和类型
// 类型可为基本类型和复杂类型或者自定义参数类型比如（Account）;
const schema  = buildSchema(`
  type Account {
    name: String,
    age: Int,
    sex: String,
  }
  type Query {
    hello: String
    accoutName: Account
  }
`)
// 定义查询对应的处理器
const root = {
  hello: () => {
    return 'hello world';
  },
  accoutName: () => {
    return {
      name: '嘻嘻嘻😬',
      age: 18,
      sex: '男',
    };
  }
}
const app = express();
app.use('/graphql',graphqlHttp({
  schema,
  rootValue: root,
  graphiql:true,
}))
app.listen(3000);