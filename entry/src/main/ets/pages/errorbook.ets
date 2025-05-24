import  router  from '@ohos.router';
import http from '@ohos.net.http';
import  PromptAction  from '@ohos.promptAction';
import {apimistakeCollections,apimistakes} from '../utils/net_config'
import {QuestionItem,RouterParams,CollectionInfo,ApiResponse,resinformation} from '../utils/ALL_Interface'
@Entry
@Component
struct CollectionDetail {
  @State collectionId: string = '';
  @State questions: QuestionItem[] = [];
  @State isLoading: boolean = false;
  @State searchKeyword: string = '';
  @State currentPage: number = 1;
  @State totalPages: number = 1;
  @State collectionInfo: CollectionInfo = {
    title: '',
    description: '',
    question_count: 0
  };
  private httpRequest: http.HttpRequest = http.createHttp();

  aboutToAppear() {
    const params: RouterParams = router.getParams() as RouterParams;
    this.collectionId = params.id;
    this.fetchQuestions();
  }

  // 获取错题列表
  async fetchQuestions() {
    this.isLoading = true;
    try {
      const response = await this.httpRequest.request(
        `${apimistakeCollections.questions}/${this.collectionId}`,
        {
          method: http.RequestMethod.GET,
          extraData: {
            keyword: this.searchKeyword,
            page: this.currentPage,
            pageSize: 10
          }
        }
      );

      const result:resinformation = JSON.parse(response.result.toString());
      if (result.code !== 200) {
        PromptAction.showToast({
          message: result.message || '获取列表失败'
        });
        return;
      }
      this.collectionInfo.question_count=result.total
      this.questions = result.list;
      this.totalPages = Math.ceil(result.total / 10);
    } catch (err) {
      console.error(err);
      PromptAction.showToast({
        message: `请求失败: ${err.code || '网络错误'}`
      });
    } finally {
      this.isLoading = false;
    }
  }

  // 搜索功能
  onSearch() {
    this.currentPage = 1;
    this.fetchQuestions();
  }

  // 加载更多
  loadMore() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchQuestions();
    }
  }

  build() {
    Column() {
      // 错题集信息卡片
      Column() {
        Text(this.collectionInfo.title)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 8 })

        Text(this.collectionInfo.description)
          .fontSize(14)
          .fontColor('#666')
          .margin({ bottom: 8 })

        Text(`共${this.collectionInfo.question_count}题`)
          .fontSize(12)
          .fontColor('#999')
      }
      .padding(16)
      .width('100%')
      .backgroundColor('#FFF')
      .margin({ bottom: 12 })

      // 搜索栏
      Row() {
        TextInput({ placeholder: '搜索题目' })
          .onChange((value: string) => {
            this.searchKeyword = value;
          })
          .height(40)
          .layoutWeight(1)
          .borderRadius(20)
          .backgroundColor('#FFF')
          .padding({ left: 16, right: 16 })

        Button('搜索')
          .onClick(() => this.onSearch())
          .width(80)
          .height(40)
          .margin({ left: 8 })
      }
      .padding({ left: 16, right: 16 })
      .margin({ bottom: 12 })

      // 错题列表
      // 在 build() 方法中修改 List 部分
      List() {
        // 当没有错题时显示创建按钮
        if (this.questions.length === 0) {
          ListItem() {
            Button('创建新错题记录')
              .onClick(() => {
                router.pushUrl({
                  url: 'pages/createQuestion',
                  params: { collectionId: this.collectionId }
                });
              })
              .width('80%')
              .height(48)
              .type(ButtonType.Capsule)
              .backgroundColor('#0a59f7')
          }
          .margin({ top: 20 })
          .align(Alignment.Center)
        }

        // 显示错题卡片
        ForEach(this.questions, (question:QuestionItem) => {
          ListItem() {
            Column() {
              // 题目类型和难度标签
              Row() {
                Text(question.question_type)
                  .fontSize(12)
                  .fontColor('#FFF')
                  .padding({
                    left: 8,
                    right: 8,
                    top: 2,
                    bottom: 2
                  })
                  .backgroundColor('#0a59f7')
                  .borderRadius(4)

                // 添加难度显示（假设接口返回 difficulty 字段）
                if (question.difficulty) {
                  Text(`难度: ${'★'.repeat(question.difficulty)}`)
                    .fontSize(12)
                    .fontColor('#FFA500')
                    .margin({ left: 8 })
                }
              }
              .margin({ bottom: 8 })

              // 题目内容（限制显示行数）
              Text(question.question_description)
                .fontSize(16)
                .margin({ bottom: 8 })
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })

              // 学科、章节和错误次数
              Row() {
                Column() {
                  Text(question.subject)
                    .fontSize(12)
                    .fontColor('#666')

                  Text(question.chapter)
                    .fontSize(12)
                    .fontColor('#666')
                }
                .layoutWeight(1)

                // 显示错误次数（假设接口返回 wrong_times 字段）
                if (question.wrong_times) {
                  Text(`错误 ${question.wrong_times} 次`)
                    .fontSize(12)
                    .fontColor('#FF4500')
                }
              }
            }
            .padding(12)
            .width('100%')
            .borderRadius(8)
            .backgroundColor('#FFF')
            .onClick(() => {
              router.pushUrl({
                url: 'pages/questionDetail',
                params: {
                  id: question.id.toString(),
                  collectionId: this.collectionId
                }
              });
            })
          }
        }, (question:QuestionItem) => question.id.toString())

        // 加载更多按钮
        if (this.currentPage < this.totalPages && this.questions.length > 0) {
          ListItem() {
            Button('加载更多')
              .onClick(() => this.loadMore())
              .width('100%')
              .type(ButtonType.Normal)
          }
        }
      }
    }
  }
}