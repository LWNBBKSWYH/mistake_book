
// 题目项接口定义
export interface QuestionItem {
  id: number;
  subject: string;
  chapter: string;
  question_description: string;
  question_type: string;
  question_answer:string;
  difficulty?: number;       // 新增难度字段
  wrong_times?: number;      // 新增错误次数字段
  create_time?: string;
  options?: QuestionOptions;  // 选择题选项
  analysis?: string;         // 题目解析
}
export interface RouterParams {
  questionId: string;
  collectionId: string;
  id: string;
}
//todo 用于记录选择题的选项,还需完善
export interface QuestionOptions {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  E?: string;
  F?: string;
  G?: string;
  H?: string;
  //
}
//连接的信息
export interface CollectionInfo {
  title: string;
  description: string;
  question_count: number;
}
export interface ApiResponse<T> {
  data?: T;          // 错题集详情接口的返回结构
  list?: T[];        // 错题列表接口的返回结构
}
//接收后端返回的信息
export interface resinformation{
  code: number,//错误代码
  message?: string,//相关消息
  list: QuestionItem[],//题目列表
  total: number//题目总数
}