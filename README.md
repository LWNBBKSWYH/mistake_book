# mistake_book
sztu学生自主开发的一个基于harmonyOS错题本小项目，写bug的能力又增强了有没有（x）
## 说明
frontend为前端代码，应该无法直接作为项目包导入DevEco Studio，需要在DevEco Studio创建一个空项目，然后替换其中的文件
backend为后端代码，需要替换本地数据库的端口
```
在backend/db.js文件中，替换如下代码的配置
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mistake_book',
});
```
