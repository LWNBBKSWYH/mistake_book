import {QuestionItem,RouterParams,ApiResponse,resinformation} from '../utils/ALL_Interface'
import  router  from '@ohos.router';
import http from '@ohos.net.http';
import  PromptAction  from '@ohos.promptAction';
import {apimistakeCollections} from '../utils/net_config'


@Entry
@Component
struct CreateQuestion {
  @State formData: Partial<QuestionItem> = {
    question_description: '',
    question_answer: '',
    subject: '',
    chapter: '',
    question_type: '',
    difficulty: 0
  };
  private httpRequest: http.HttpRequest = http.createHttp();

  // 提交问题
  async submitQuestion() {
    try {
      // 表单验证
      if (!this.formData.question_description || !this.formData.question_answer) {
        PromptAction.showToast({ message: '题目和答案不能为空' });
        return;
      }

      const response = await this.httpRequest.request(
        `${apimistakeCollections.create}`,
        {
          method: http.RequestMethod.POST,
          header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const result: resinformation = JSON.parse(response.result.toString());

      if (response.responseCode === 200 && result.code === 200) {
        PromptAction.showToast({ message: '创建成功' });
        router.back();
      } else {
        PromptAction.showToast({
          message: result.message || '创建失败'
        });
      }
    } catch (err) {
      console.error(`创建错题失败: ${err.code}, ${err.message}`);
      PromptAction.showToast({
        message: `创建失败: ${err.message || '网络错误'}`
      });
    }
  }

  returnpage(){

  }

  build() {
    Column() {
      TextInput({ placeholder: '题目描述' })
        .onChange(value => this.formData.question_description = value)

      TextInput({ placeholder: '答案' })
        .onChange(value => this.formData.question_answer = value)

      // 其他表单字段...

      Button('提交')
        .onClick(() => this.submitQuestion())
      Button('取消')
        .onClick(()=>this.returnpage())
    }
    .padding(16)
  }
}