// common/config.ts
const ipv4: string = '10.151.35.100';
const port: string = '8989';
const apiUrl = `http://${ipv4}:${port}/api`;
// 用户登入接口
interface ApiUsers {
    login: string;
    register: string;
    userInfo: string;
}
interface ApiMistakeCollections {
    list: string;
    create: string;
    detail: string;
    update: string;
    delete: string;
    questions: string;
}
interface ApiMistakes {
    detail: string; // 获取错题详情
    create: string; // 创建错题
    update: string; // 更新错题
    delete: string; // 删除错题
    incrementWrong: string; // 增加错误次数
    listBySubject: string; // 按学科分类查询
}
export const apiusers: ApiUsers = {
    login: `${apiUrl}/users/login`,
    register: `${apiUrl}/users/register`,
    userInfo: `${apiUrl}/users/info`
};
export const apimistakeCollections: ApiMistakeCollections = {
    list: `${apiUrl}/mistake_collections/list`,
    create: `${apiUrl}/mistake_collections/create`,
    detail: `${apiUrl}/mistake_collections/detail`,
    update: `${apiUrl}/mistake_collections/update`,
    delete: `${apiUrl}/mistake_collections/delete`,
    questions: `${apiUrl}/mistake_collections/questions` // 错题集中的题目管理
};
export const apimistakes: ApiMistakes = {
    detail: `${apiUrl}/mistakes/detail`,
    create: `${apiUrl}/mistakes/create`,
    update: `${apiUrl}/mistakes/update`,
    delete: `${apiUrl}/mistakes/delete`,
    incrementWrong: `${apiUrl}/mistakes/increment-wrong`,
    listBySubject: `${apiUrl}/mistakes/list-by-subject`
};
