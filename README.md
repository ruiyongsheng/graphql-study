# graphql-study
#### Graphql使用方式
```
1. npm init -y
2. npm install express graphql express-graphql -S
3. npm install -g nodemon  // 监听node进程

i. 定义schma 查询和类型
ii. 定义查询对应的处理器
详见 hello-world.js
```

### 在Graphql中，
#### 基本参数类型
```
基本类型： String,Int,Float,Boolean和ID.可以在shema声明的时候直接使用

[类型]代表数组，例如：[Int]代表整形数组
```
#### 参数传递
```
1. 和js传递参数一样，小括号内定义形参，但是注意：参数需要定义类型
2. !(叹号)代表参数不能为空
eg. type Query {
  rollDice(numDice:Int!,numSides:Int):[Int]
}

详见 baseType.js
```
结果如图所示
![](https://user-gold-cdn.xitu.io/2019/7/22/16c18e073f3fc0d9?w=1874&h=332&f=png&s=81167)
#### 如何在客户端访问graphql的接口
1. 获取到静态文件资源，在 baseType.js中添加
```
// 公开文件夹，供用户访问静态资源
app.use(express.static('public'));
```
2. 创建html文件
```
i. 定义query语句,查询表里的值
const query = `
  query Account($username:String,$city:String){
    account(username:$username){
      name
      age
      sex
      salary(city:$city)
    }
  }
`;
ii. 定义变量，也就是查询条件
const variables = { username : '李大四', city: '北京'};
详见  /public/index.html
```
结果如图所示：
![](https://user-gold-cdn.xitu.io/2019/7/22/16c18df37599aa82?w=1086&h=264&f=png&s=56458)

#### 使用Mutations修改数据
查询数据用query,修改数据用 Mutations
```
示例：
<!-- 定义类型 -->
input AccountInput {
  name:String
  age:Int
  sex:String
  department: String
  salary: Int
}
type Mutation {
  createAccount(input:AccountInput):Account
  updateAccount(id:ID!,input:AccountInput):Account
}
<!-- 定义查询的类型 -->
type Account {
  name: String,
  age: Int,
  sex: String,
  department: String,
}
type Query {
  accounts: [Account]
}
```
在graphiQl中测试，先通过mutation,写入两条数据
```
mutation {
  createAccount(input:{
    name: "李易峰",
    age: 30,
    sex:"男",
    department:"帅锅部"
  }) {
    name,
    age,
    sex,
    department,
  }
}
mutation {
  createAccount(input:{
    name: "张三丰",
    age: 27,
    sex:"女",
    department:"功夫部"
  }) {
    name,
    age,
    sex,
    department,
  }
}
```
然后通过query语句查询

```
query {
  accounts {
    name
    sex
    department
    age
  }
}
```
结果如图所示：
![](https://user-gold-cdn.xitu.io/2019/7/22/16c190cfb6460126?w=1704&h=407&f=png&s=83220)

然后我们更改数据 
通过 updateAccount
```
updateAccount({id,input}){
  const updatedAccount = Object.assign({},fakeDb[id],input);
  fakeDb[id] = updatedAccount;
  return updatedAccount;
}

<!-- 调试器里去更新数据 -->
# mutation {
#   updateAccount(id:"李易峰",input:{
#     age:100,
#   }) {
#     age
#   }
# }

```
结果如图所示：
![](https://user-gold-cdn.xitu.io/2019/7/22/16c1915fdc3d06db?w=1774&h=593&f=png&s=124134)

#### 认证与中间件
详情见middleware.js

```
const middleware = (req,res,next)=>{
  if (req.url.indexOf('/graphql') !== -1 && req.headers.cookie.indexOf('auth') === -1) {
    res.send(JSON.stringify({
      error:'您没有权限访问这个接口',
    }))
    return;
  }
  next();
}
app.use(middleware);
```
如果cookie里没有auth字段，页面渲染提示，“您没有权限访问这个接口”，
然后我们在appliaction -> 添加 auth -> 正常访问接口
![](https://user-gold-cdn.xitu.io/2019/7/22/16c1942f8507fedf?w=1251&h=602&f=png&s=115777)

#### Constructing Types
1.![](https://user-gold-cdn.xitu.io/2019/7/22/16c19453a6359932?w=1240&h=401&f=png&s=265229)

2.![](https://user-gold-cdn.xitu.io/2019/7/22/16c1945f65086b3a?w=1153&h=533&f=png&s=224441)

3.![](https://user-gold-cdn.xitu.io/2019/7/22/16c194716ac58334?w=1049&h=207&f=png&s=63250)

详细代码见 <b>constructeType.js</b><br>
结果如图所示
![](https://user-gold-cdn.xitu.io/2019/7/22/16c197bb2deb86ba?w=1690&h=250&f=png&s=57045)

#### 高级  与数据库结合实战

1. 在服务里安装 mysql;
```
npm i -S mysql
```
2. 建立数据库连接 
```
let pool = mysql.createPool({
  connectionLimit:10, // 最大连接数
  host:'localhost',  // 数据库地址
  user:'root',      // 用户名
  password:'12345678', // 数据库密码
  database:'test',   // 连接的数据库名字
})
```

3. 定义graphQL中的Schma 
```
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
```
4.  定义查询对应的处理器（方法）
```
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
```
结果如图所示：
#### 增加数据 （createAccount）
![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d6e2bbf4d691?w=1300&h=315&f=png&s=55695)

#### 修改数据 (updateAccount)
![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d708f4dc4925?w=1288&h=459&f=png&s=66706)

修改完成之后 刷新查看数据库，发现age已经更改为23
![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d71658803f81?w=1342&h=522&f=png&s=340193)

#### 查询数据 (accounts)
![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d72f6ba6a304?w=1319&h=733&f=png&s=111289)

#### 删除数据 （deleteAccount）
![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d74d9b313dad?w=1437&h=657&f=png&s=87197)
刷新之后查看数据库

![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d7596d7dd9aa?w=1458&h=662&f=png&s=432169)

#### 注： 详情查看 db.js
