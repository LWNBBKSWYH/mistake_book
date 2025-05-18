import { router } from '@kit.ArkUI';
import { promptAction } from '@kit.ArkUI';
import http from '@ohos.net.http';

// 定义接口类型
interface UserInfo {
  id: number;
  username: string;
}

interface HttpResponseData  {
  message?: string;
  error?: string;
  user?: UserInfo;
};

@Entry
@Component
struct Login {
  @StorageLink('login') login: boolean = false;
  @State user: string = '';
  @State password: string = '';
  @State errorMessage: string = '';
  @State isLoading: boolean = false;
  private httpRequest: http.HttpRequest = http.createHttp();
  private apiUrl: string = 'http://10.151.39.48:8989/api/users';
  aboutToAppear(): void {
    if (this.login) {
      router.replaceUrl({
        url: 'pages/errorbook'
      });
    }
  }

  // 处理服务器响应
  handleResponse(response: http.HttpResponse): void {
    this.isLoading = false;

    try {
      const data: HttpResponseData = JSON.parse(response.result as string) as HttpResponseData;

      if (response.responseCode === 200) {
        if (data.message === 'Login success') {
          this.login = true;
          router.replaceUrl({ url: 'pages/errorbook' });
        } else if (data.message === 'Registered successfully') {
          promptAction.showToast({ message: '注册成功，请登录' });
        }
      } else {
        this.errorMessage = data.error ?? '请求失败';
      }
    } catch (e) {
      console.error('JSON解析错误:', e);
      this.errorMessage = '数据格式错误';
    }
  }
  // 跳转到注册页面
  navigateToRegister(): void {
    router.pushUrl({
      url: 'pages/register'
    }, router.RouterMode.Standard);
  }
  // 登录方法
  handleLogin(): void {
    if (!this.user || !this.password) {
      this.errorMessage = '请输入用户名和密码';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.httpRequest.request(
      this.apiUrl+'/login',
      {
        method: http.RequestMethod.POST,
        header: {
          'Content-Type': 'application/json'
        },
        extraData: JSON.stringify({
          username: this.user,
          password: this.password
        })
      },
      (err: Error, data: http.HttpResponse) => {
        if (err) {
          console.error('请求失败:', err);
          this.errorMessage = '连接服务器失败';
          this.isLoading = false;
          return;
        }
        this.handleResponse(data);
      }
    );
  }



  build() {
    Column({ space: 15 }) {
      Text(" ")
        .height("10%")

      Row() {
        Text("欢迎来到")
          .fontSize(35)
          .fontWeight(FontWeight.Bold)
          .margin(10)
        Text("错题本")
          .borderRadius(10)
          .padding(5)
          .backgroundColor("#0a59f7")
          .fontColor(Color.White)
          .fontSize(35)
          .fontWeight(FontWeight.Bold)
      }
      .width("100%")
      .justifyContent(FlexAlign.Start)

      TextInput({ placeholder: '输入账号', text: $$this.user })
        .borderRadius(10)
        .margin({ left: 10, right: 10 })
        .onChange((value: string) => {
          this.user = value;
        })

      TextInput({ placeholder: '输入密码', text: $$this.password })
        .borderRadius(10)
        .margin({ left: 10, right: 10 })
        .type(InputType.Password)
        .onChange((value: string) => {
          this.password = value;
        })

      if (this.errorMessage) {
        Text(this.errorMessage)
          .fontColor(Color.Red)
          .margin(10)
      }

      Row() {
        Button('登录')
          .margin(5)
          .type(ButtonType.Normal)
          .borderRadius(10)
          .height(40)
          .width("45%")
          .onClick(() => {
            this.handleLogin();
          })
          .enabled(!this.isLoading)

        Button('注册')
          .borderColor("#0a59f7")
          .borderWidth(2)
          .fontColor("#0a59f7")
          .backgroundColor(Color.White)
          .margin(5)
          .type(ButtonType.Normal)
          .borderRadius(10)
          .height(40)
          .width("45%")
          .onClick(() => {
            this.navigateToRegister();
          })
          .enabled(!this.isLoading)
      }
      .justifyContent(FlexAlign.Center)
      .width("100%")

      if (this.isLoading) {
        LoadingProgress()
          .margin(10)
      }
    }
    .backgroundImage($r('app.media.login_background'))
    .backgroundImagePosition(Alignment.Center)
    .height('100%')
    .width('100%')
  }
}