import  router  from '@ohos.router';
import http from '@ohos.net.http';
import  PromptAction  from '@ohos.promptAction';

// 题目项接口定义
interface QuestionItem {
  id: number;
  subject: string;
  chapter: string;
  question_description: string;
  question_type: string;
  create_time?: string;
}

// 修复1：替换对象字面量类型声明
interface QuestionOptions {
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

interface QuestionData {
  id: number;
  username: string;
  subject: string;
  chapter: string;
  question_description: string;
  question_answer: string;
  question_type: '选择题' | '判断题' | '主观题';
  options?: QuestionOptions; // 修复1：使用定义好的接口替代对象字面量
  create_time?: string;
  update_time?: string;
}

// 修复3：添加API响应接口
interface ApiResponse {
  code: number;
  message: string;
  list?: QuestionItem[];
  data?: QuestionData;
}
@Entry
@Component
struct Index {
  @State SearchInput: string = '';
  @State ChapterText: string = "选择章节";
  @State SectionText: string = "选择节数";
  @State questionList: Array<QuestionItem> = [];
  @State isLoading: boolean = false;
  @StorageLink('username') username: string = '';
  private httpRequest: http.HttpRequest = http.createHttp();
  private apiUrl: string = 'http://10.151.39.48:8989/api/mistake_set';


aboutToAppear() {
  this.loadQuestions();
}

// 加载错题列表
  async loadQuestions() {
    this.isLoading = true;
    try {
      // 构建查询参数字符串
      let queryString = `username=${encodeURIComponent(this.username)}&subject=数学`;
      if (this.ChapterText !== '选择章节') {
        queryString += `&chapter=${encodeURIComponent(this.ChapterText)}`;
      }

      const response = await this.httpRequest.request(
        `${this.apiUrl}/questions?${queryString}`,
        {
          method: http.RequestMethod.GET,
          header: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.responseCode === 200) {
        const apiResponse: ApiResponse = JSON.parse(response.result as string);
        if (apiResponse.list) {
          this.questionList = apiResponse.list;
        } else if (apiResponse.data) {
          // 如果返回的是单个QuestionData，转换为QuestionItem数组
          const item = apiResponse.data;
          this.questionList = [{
            id: item.id,
            subject: item.subject,
            chapter: item.chapter,
            question_description: item.question_description,
            question_type: item.question_type,
            create_time: item.create_time
          }];
        } else {
          this.questionList = [];
        }
      } else {
        PromptAction.showToast({ message: '加载失败，请重试' });
      }
    } catch (err) {
      console.error('请求错误:', err);
      PromptAction.showToast({ message: '网络错误' });
    } finally {
      this.isLoading = false;
    }
  }

// 跳转到题目详情
navigateToDetail(questionId: number) {
  router.pushUrl({
    url: 'pages/questionDetail',
    params: { id: questionId.toString() }
  });
}

build() {
  Column() {
    Navigation() {
      Column({ space: 20 }) {
        // 搜索栏
        TextInput({
          placeholder: '输入题目关键词搜索',
          text: this.SearchInput
        })
          .onChange((value: string) => {
            this.SearchInput = value;
            // 可以添加防抖搜索逻辑
          })
          .height(48)
          .width('92%')
          .backgroundColor("#FFFFFF")
          .borderRadius(24)
          .margin({ left: 16, right: 16, top: 12 })
          .padding({ left: 20, right: 20 })

        // 分类选择行
        Row({ space: 12 }) {
          Select([
            { value: '函数与导数' },
            { value: '三角函数及解三角形' },
            { value: '数列' },
            { value: '概率与统计' },
            { value: '坐标系与参数方程' },
            { value: '不等式' },
            { value: '圆锥曲线' }
          ])
            .value(this.ChapterText)
            .onSelect((index: number, text?: string) => {
              this.ChapterText = text || this.ChapterText;
              this.loadQuestions();
            })
            .width('48%')
            .height(40)
            .borderRadius(8)
            .borderWidth(1)
            .borderColor("#0a59f7")

          Select([
            { value: '第一节' },
            { value: '第二节' },
            { value: '第三节' },
            { value: '第四节' },
            { value: '第五节' }
          ])
            .value(this.SectionText)
            .onSelect((index: number, text?: string) => {
              this.SectionText = text || this.SectionText;
              this.loadQuestions();
            })
            .width('48%')
            .height(40)
            .borderRadius(8)
            .borderWidth(1)
            .borderColor("#0a59f7")
        }
        .width('92%')
        .margin({ left: 16, right: 16 })
        .alignItems(VerticalAlign.Center)

        // 题目列表
        List({ space: 16 }) {
          ForEach(this.questionList, (item: QuestionItem) => {
            ListItem() {
              Column({ space: 8 }) {
                // 题目类型标签
                Row() {
                  Text(item.question_type)
                    .fontSize(12)
                    .fontColor('#FFFFFF')
                    .padding({ left: 8, right: 8, top: 2, bottom: 2 })
                    .backgroundColor('#0a59f7')
                    .borderRadius(4)

                  Text(item.chapter)
                    .fontSize(12)
                    .fontColor('#666666')
                    .margin({ left: 8 })
                }
                .width('100%')
                .justifyContent(FlexAlign.Start)

                // 题目内容
                Text(item.question_description)
                  .fontSize(16)
                  .fontColor('#333333')
                  .maxLines(2)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .width('100%')

                // 底部信息
                Row() {
                  Text(this.formatTime(item.create_time))
                    .fontSize(12)
                    .fontColor('#999999')
                }
                .width('100%')
                .justifyContent(FlexAlign.End)
              }
              .padding(12)
              .backgroundColor('#FFFFFF')
              .borderRadius(8)
              .onClick(() => {
                this.navigateToDetail(item.id);
              })
            }
          }, (item: QuestionItem) => item.id.toString())
        }
        .width('100%')
        .layoutWeight(1)
        .divider({
          strokeWidth: 0,
          color: Color.Transparent
        })
        .margin({ top: 8 })

        // 加载指示器
        if (this.isLoading) {
          LoadingProgress()
            .color('#0a59f7')
            .margin({ top: 20 })
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#F5F7FA')
    }
    .toolbarConfiguration([
      {
        value: "主页",
        icon: $r("app.media.ic_public_home")
      },
      {
        value: "收藏",
        icon: $r("app.media.ic_public_highlights"),
        action: () => {
          router.pushUrl({
            url: 'pages/like',
            params: { from: 'index' }
          });
        }
      }
    ])
    .hideToolBar(false)
    .title('数学错题集')
  }
  .width('100%')
  .height('100%')
}

// 格式化时间显示
private formatTime(timestamp?: string): string {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  } catch {
    return '';
  }
}
}