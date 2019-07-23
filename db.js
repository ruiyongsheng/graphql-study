const express = require('express');
const {
  buildSchema
} = require('graphql');
const graphqlHttp = require('express-graphql');
const mysql = require('mysql');

// 建立数据库连接
let pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'test',
})
// 定义schma 查询和类型
// 类型可为基本类型和复杂类型或者自定义参数类型比如（Account）;
const schema = buildSchema(`
  input AccountInput {
    name:String
    age:Int
    sex:String
    department: String
  }
  type Mutation {
    createAccount(input:AccountInput):Account
    deleteAccount(id:ID!):Boolean
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

const root = {
  // 查询数据
  accounts() {
    return new Promise((resolve, reject) => {
      pool.query('select name,age,sex,department from account', (err, res) => {
        if (err) {
          console.log(err.message);
          return;
        }
        var arr = [];
        for (let i = 0; i < res.length; i++) {
          arr.push({
            name: res[i].name,
            sex: res[i].sex,
            age: res[i].age,
            department: res[i].department,
          })
        }
        resolve([...new Set(arr)]);
      })
    })

  },
  //  添加或者叫创建数据
  createAccount({
    input
  }) {
    // 相当于数据库的保存
    const data = {
      name: input.name,
      sex: input.sex,
      age: input.age,
      department: input.department
    }
    return new Promise((resolve, reject) => {
      pool.query('insert into account set ?', data, (err) => {
        if (err) {
          console.log(err.message);
          return;
        }
        resolve(data);
      })
    })
  },
  // 修改数据
  updateAccount({
    id,
    input
  }) {
    const data = input;
    return new Promise((resolve, reject) => {
      pool.query('update account set ? where name = ?', [data, id], (err) => {
        if (err) {
          console.log(err.message);
          return;
        }
        resolve(data);
      })
    })
  },
  // 删除数据
  deleteAccount({
    id
  }) {
    return new Promise((resolve, reject) => {
      pool.query('delete from account where name = ?', [id], (err) => {
        if (err) {
          console.log('出错了' + err.message);
          reject(false);
          return;
        }
        resolve(true);
      })
    })
  }
}
const app = express();
app.use('/graphql', graphqlHttp({
  schema,
  rootValue: root,
  graphiql: true,
}))
app.listen(3000);