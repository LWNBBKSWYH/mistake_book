import { router } from '@kit.ArkUI';
import { promptAction } from '@kit.ArkUI';
import http from '@ohos.net.http';
import { apiusers }  from '../utils/net_config';
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
  @StorageLink('username') username: string = '';
  @State password: string = '';
  @State errorMessage: string = '';
  @StorageLink('isLoading') isLoading: boolean = false; // 使用AppStorage关联
  private httpRequest: http.HttpRequest = http.createHttp();

  aboutToAppear(): void {
    if (this.login) {
      router.replaceUrl({
        url: 'pages/home'
      });
    }else {
      // 确保清除任何残留状态
      this.username = '';
      this.password = '';
      this.errorMessage = '';
    }
  }

  // 处理服务器响应
  handleResponse(response: http.HttpResponse): void {
    this.isLoading = false;

    try {
      const data: HttpResponseData = JSON.parse(response.result as string) as HttpResponseData;

      if (response.responseCode === 200) {
        if (data.message === 'Login success') {
          promptAction.showToast({
            message: '登录成功',
            duration: 2000 // 显示2秒
          });
          this.login = true;
          router.replaceUrl({ url: 'pages/home' });
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
    if (!this.username || !this.password) {
      this.errorMessage = '请输入用户名和密码';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.httpRequest.request(
      apiusers.login,
      {
        method: http.RequestMethod.POST,
        header: {
          'Content-Type': 'application/json'
        },
        extraData: JSON.stringify({
          username: this.username,
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
      Column(){
        //占位
      }
      .height('10%')
      Column() {
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
        .margin(20)
        .width("100%")
        .justifyContent(FlexAlign.Center)
        Text('账号')
          .margin({
            left:30,
            bottom:10
          })
          .alignSelf(ItemAlign.Start)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
        TextInput({ placeholder: '输入账号', text: $$this.username })
          .backgroundColor(Color.White)
          .borderRadius(10)
          .margin({
            bottom:30,
            left:25,
            right:25
          })
          .onChange((value: string) => {
            this.username = value;
          })
        Text('密码')
          .margin({
            left:30,
            bottom:10
          })
          .alignSelf(ItemAlign.Start)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
        TextInput({ placeholder: '输入密码', text: $$this.password })
          .backgroundColor(Color.White)
          .borderRadius(10)
          .margin({
            bottom:30,
            left:25,
            right:25
          })
          .type(InputType.Password)
          .onChange((value: string) => {
            this.password = value;
          })
        if (this.errorMessage) {
          Text(this.errorMessage)
            .fontColor(Color.Red)
            .margin(10)
        }
        Column() {
          Row() {
            Button('登录')//登录按钮
              .fontSize(20)
              .margin(5)
              .type(ButtonType.Normal)
              .borderRadius(20)
              .width("40%")
              .height(60)
              .onClick(() => {
                this.handleLogin(); // 仅发起登录请求，跳转逻辑交给handleResponse处理
              })
              .enabled(!this.isLoading)
            Button('注册')//注册按钮
              .fontSize(20)
              .borderColor("#0a59f7")
              .borderWidth(2)
              .fontColor("#0a59f7")
              .backgroundColor(Color.White)
              .margin(5)
              .type(ButtonType.Normal)
              .borderRadius(20)
              .height(60)
              .width("40%")
              .onClick(() => {
                this.navigateToRegister();
              })
              .enabled(!this.isLoading)
            if (this.isLoading) {
              LoadingProgress()
                .margin(10)
            }
          }
          .justifyContent(FlexAlign.Center)
          .width("100%")
        }
        .justifyContent(FlexAlign.SpaceEvenly)
        .height('25%')

      }
      .borderRadius(20)
      .margin(20)
      .height('60%')
      .backgroundColor("rgba(255, 255, 255, 0.7)")
      Column(){
        //占位
      }
      .height('30%')
    }
    .justifyContent(FlexAlign.Center)
    .backgroundImage($r('app.media.background03')) //背景图片
    .backgroundImageSize(ImageSize.Cover)
    .backgroundImagePosition(Alignment.Center)
    .height('100%')
    .width('100%')
  }
}