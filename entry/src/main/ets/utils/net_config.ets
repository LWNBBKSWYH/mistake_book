/*
 * 本文件用于存放与后端连接的所有接口信息
*/
const ipv4:string='10.151.35.100'
const port:string='8989'
const apiUrl = `http://${ipv4}:${port}/api`;
// 用户登入接口
interface ApiUsers {
  login: string;
  register: string;
  userInfo: string;
}
//错题集接口
interface ApiMistakeCollections{
  list: string;
  create: string;
  detail: string;
  update: string;
  delete: string;
  questions: string;
}
// 具体的错题接口
interface ApiMistakes{
  detail: string;        // 获取错题详情
  create: string;        // 创建错题
  update: string;        // 更新错题
  delete: string;        // 删除错题
  incrementWrong: string;// 增加错误次数
  listBySubject: string; // 按学科分类查询
}
export const  apiusers:ApiUsers = {
  login: `${apiUrl}/users/login`,
  register: `${apiUrl}/users/register`,
  userInfo: `${apiUrl}/users/info`
};
export const apimistakeCollections: ApiMistakeCollections = {
  list: `${apiUrl}/mistake_collections/list`,       // 获取用户错题集列表
  create: `${apiUrl}/mistake_collections/create`,   // 创建错题集
  detail: `${apiUrl}/mistake_collections/detail`,  // 获取错题集详情
  update: `${apiUrl}/mistake_collections/update`,   // 更新错题集信息
  delete: `${apiUrl}/mistake_collections/delete`,  // 删除错题集
  questions: `${apiUrl}/mistake_collections/questions` // 错题集中的题目管理
};
export const apimistakes:ApiMistakes={
  detail: `${apiUrl}/mistakes/detail`,
  create: `${apiUrl}/mistakes/create`,
  update: `${apiUrl}/mistakes/update`,
  delete: `${apiUrl}/mistakes/delete`,
  incrementWrong: `${apiUrl}/mistakes/increment-wrong`,
  listBySubject: `${apiUrl}/mistakes/list-by-subject`

}