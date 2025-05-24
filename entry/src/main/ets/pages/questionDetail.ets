import {QuestionItem,RouterParams,ApiResponse} from '../utils/ALL_Interface'
import  router  from '@ohos.router';
import http from '@ohos.net.http';
import  PromptAction  from '@ohos.promptAction';
import {apimistakes} from '../utils/net_config'
@Entry
@Component
struct QuestionDetail {
  @State question: QuestionItem = {} as QuestionItem;
  @State isLoading: boolean = false;
  private httpRequest: http.HttpRequest = http.createHttp();

  aboutToAppear() {
    const params: RouterParams = router.getParams() as RouterParams;
    this.fetchQuestionDetail(params.id);
  }

  async fetchQuestionDetail(id: string) {
    this.isLoading = true;
    try {
      const response = await this.httpRequest.request(
        `${apimistakes.detail}/${id}`,
        { method: http.RequestMethod.GET }
      );

      if (response.responseCode === 200) {
        const result:ApiResponse<QuestionItem> = JSON.parse(response.result.toString());
        this.question = result.data!;
      }
    } catch (err) {
      PromptAction.showToast({ message: '获取题目详情失败' });
    } finally {
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      if (this.isLoading) {
        LoadingProgress()
          .width(50)
          .height(50)
      } else {
        // 题目详情展示
        Text(this.question.question_description)
          .fontSize(18)
          .margin({ bottom: 16 })

        // 选择题选项展示
        if (this.question.question_type === '选择题' && this.question.options) {
          Column() {

          }
        }

        // 答案解析
        if (this.question.analysis) {
          Text(`解析: ${this.question.analysis}`)
            .fontSize(14)
            .fontColor('#666')
            .margin({ top: 16 })
        }
      }
    }
    .padding(16)
    .width('100%')
    .height('100%')
  }
}