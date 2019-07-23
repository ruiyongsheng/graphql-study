const express = require('express')
const { buildSchema } = require('graphql')
const graphqlHttp = require('express-graphql')
// 定义schma 查询和类型
// 类型可为基本类型和复杂类型或者自定义类型比如（Account）;
const schema = buildSchema(`
  type Account {
    name: String,
    age: Int,
    sex: String,
    department: String,
    salary(city:String): Int,
  }
  type Query {
    getClassMates(classNo:Int!):[String]
    account(username:String):Account
  }
`)
// 定义查询对应的处理器
const root = {
  getClassMates ({ classNo }) {
    const obj = {
      31: ['张三', '李四', '王五'],
      61: ['张大三', '李大四', '王大五']
    }
    return obj[classNo]
  },
  account({username}) {
    const name = username;
    const sex = 'man';
    const age = 18;
    const department = '开发部';
    const salary = ({city}) => {
      if (city==='北京' ||city==='上海' || city==='广州' || city==='深圳') {
        return 10000;
      }
      return 3000;
    }
    return {
      name,
      sex,
      age,
      department,
      salary,
    }
  }
}
const app = express()
app.use(
  '/graphql',
  graphqlHttp({
    schema,
    rootValue: root,
    graphiql: true
  })
)
// 公开文件夹，供用户访问静态资源
app.use(express.static('public'));
app.listen(3000)
