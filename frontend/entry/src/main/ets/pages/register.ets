// Register.ets
import { router } from '@kit.ArkUI';
import { promptAction } from '@kit.ArkUI';
import http from '@ohos.net.http';
interface HttpResponseData  {
  message?: string;
  error?: string;
  user?: UserInfo;
};
interface UserInfo {
  id: number;
  username: string;
}
@Entry
@Component
struct RegisterPage {
  @State username: string = '';
  @State account: string = '';
  @State password: string = '';
  @State isLoading: boolean = false;
  @State errorMessage: string = '';

  private httpRequest: http.HttpRequest = http.createHttp();
  private apiUrl: string = 'http://10.151.39.48:8989/api/users'; // 替换为你的实际API地址

  // 处理注册逻辑
  async handleRegister() {
    if (!this.username || !this.account || !this.password) {
      this.errorMessage = '请填写完整信息';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.httpRequest.request(
        this.apiUrl+'/register',
        {
          method: http.RequestMethod.POST,
          header: {
            'Content-Type': 'application/json'
          },
          extraData: JSON.stringify({
            username: this.username,
            account: this.account,
            password: this.password
          })
        }
      );

      if (response.responseCode === 200) {
        const data: HttpResponseData = JSON.parse(response.result as string) as HttpResponseData;
        if (data.message === '注册成功') {
          promptAction.showToast({ message: '注册成功' });
          router.back(); // 返回登录页面
        } else {
          this.errorMessage = data.error || '注册失败';
        }
      } else {
        this.errorMessage = `请求失败: ${response.responseCode}`;
      }
    } catch (err) {
      console.error('注册请求错误:', err);
      this.errorMessage = '网络请求失败';
    } finally {
      this.isLoading = false;
    }
  }

  build() {
    Column({ space: 20 }) {
      // 标题
      Text('用户注册')
        .fontSize(30)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 50, bottom: 30 });

      // 用户名输入
      TextInput({ placeholder: '请输入用户名', text: $$this.username })
        .width('90%')
        .height(50)
        .borderRadius(10)
        .backgroundColor(Color.White)
        .onChange((value: string) => {
          this.username = value;
        });

      // 账号输入
      TextInput({ placeholder: '请输入账号', text: $$this.account })
        .width('90%')
        .height(50)
        .borderRadius(10)
        .backgroundColor(Color.White)
        .type(InputType.Normal)
        .onChange((value: string) => {
          this.account = value;
        });

      // 密码输入
      TextInput({ placeholder: '请输入密码', text: $$this.password })
        .width('90%')
        .height(50)
        .borderRadius(10)
        .backgroundColor(Color.White)
        .type(InputType.Password)
        .onChange((value: string) => {
          this.password = value;
        });

      // 错误提示
      if (this.errorMessage) {
        Text(this.errorMessage)
          .fontColor(Color.Red)
          .fontSize(14)
          .margin(10);
      }

      // 注册按钮
      Button('注册')
        .width('90%')
        .height(50)
        .margin({ top: 20 })
        .backgroundColor('#0a59f7')
        .fontColor(Color.White)
        .onClick(() => {
          this.handleRegister();
        })
        .enabled(!this.isLoading);

      // 加载指示器
      if (this.isLoading) {
        LoadingProgress()
          .color('#0a59f7')
          .margin({ top: 20 });
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}