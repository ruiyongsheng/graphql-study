const express = require('express');
const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');
// 定义schma 查询和类型
// 类型可为基本类型和复杂类型或者自定义参数类型比如（Account）;
const schema  = buildSchema(`
  input AccountInput {
    name:String
    age:Int
    sex:String
    department: String
  }
  type Mutation {
    createAccount(input:AccountInput):Account
    updateAccount(id:ID!,input:AccountInput):Account
  }
  type Account {
    name: String,
    age: Int,
    sex: String,
    department: String,
  }
  type Query {
    accounts: [Account]
  }
`)
// 定义查询对应的处理器
const fakeDb = {};
const root = {
  accounts(){
    var arr = [];
    for (const key in fakeDb) {
      if (fakeDb.hasOwnProperty(key)) {
        const element = fakeDb[key];
        arr.push(element);
      }
    }
    return arr;
  },
  createAccount({input}){
    // 相当于数据库的保存
    fakeDb[input.name] = input;
    // 返回保存结果
    return fakeDb[input.name]
  },
  updateAccount({id,input}){
    const updatedAccount = Object.assign({},fakeDb[id],input);
    fakeDb[id] = updatedAccount;
    return updatedAccount;
  }
}
const app = express();
app.use('/graphql',graphqlHttp({
  schema,
  rootValue: root,
  graphiql:true,
}))
app.listen(3000);