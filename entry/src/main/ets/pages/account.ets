import router from '@ohos.router';
import PromptAction from '@ohos.promptAction';
import http from '@ohos.net.http';
@Entry
@Component
struct AccountPage {
  @StorageLink('username') username: string = '';
  @State showLogoutDialog: boolean = false;
  @StorageLink('isLoading') isLoading: boolean = true;

  // 修改退出登录逻辑
  private logout() {
    // 清除所有相关状态
    this.username = '';
    this.isLoading = false;
    AppStorage.setOrCreate('login', false); // 确保清除登录状态
    // 确保使用正确的页面路径
    router.clear();
    router.replaceUrl({
      url: 'pages/login'
    });
    PromptAction.showToast({ message: '已退出登录' });
  }

  build() {
    Stack() {
      // 主体内容
      Column() {
        Navigation() {
          Column({ space: 16 }) {
            // 用户信息卡片
            Column() {
              Row() {
                Image($r('app.media.userinf'))
                  .width(80)
                  .height(80)
                  .borderRadius(40)
                  .margin({ right: 16 });

                Column({ space: 4 }) {
                  Text(this.username || '未登录用户')
                    .fontSize(18)
                    .fontWeight(FontWeight.Bold);

                  Text('普通会员')
                    .fontSize(14)
                    .fontColor('#666666');
                }
                .alignItems(HorizontalAlign.Start)
                .layoutWeight(1)
              }
              .padding(16)
            }
            .backgroundColor('#FFFFFF')
            .borderRadius(8)
            .margin({ top: 16, left: 16, right: 16 })
            .shadow({ radius: 2, color: '#10000000', offsetX: 1, offsetY: 1 })

            // 功能列表
            List({ space: 8 }) {
              // 个人资料
              ListItem() {
                Row() {
                  Image($r('app.media.ownresource'))
                    .width(24)
                    .height(24)
                    .margin({ right: 12 });

                  Text('个人资料')
                    .fontSize(16);
                }
                .width('100%')
                .height(48)
                .padding({ left: 16, right: 16 })
              }
              .onClick(() => {
                router.pushUrl({ url: 'pages/profile' });
              });

              // 设置
              ListItem() {
                Row() {
                  Image($r('app.media.setting'))
                    .width(24)
                    .height(24)
                    .margin({ right: 12 });

                  Text('设置')
                    .fontSize(16);
                }
                .width('100%')
                .height(48)
                .padding({ left: 16, right: 16 })
              }
              .onClick(() => {
                router.pushUrl({ url: 'pages/settings' });
              });

              // 关于
              ListItem() {
                Row() {
                  Image($r('app.media.ownabout'))
                    .width(24)
                    .height(24)
                    .margin({ right: 12 });

                  Text('关于')
                    .fontSize(16);
                }
                .width('100%')
                .height(48)
                .padding({ left: 16, right: 16 })
              }
              .onClick(() => {
                router.pushUrl({ url: 'pages/about' });
              });

              //todo 退出登录
              ListItem() {
                Row() {
                  Image($r('app.media.outlogin'))
                    .width(24)
                    .height(24)
                    .margin({ right: 12 });

                  Text('退出登录')
                    .fontSize(16);
                }
                .width('100%')
                .height(48)
                .padding({ left: 16, right: 16 })
              }
              .onClick(() => {
                this.showLogoutDialog = true;
              });
            }
            .width('100%')
            .margin({ top: 16 })
            .divider({ strokeWidth: 0 })
          }
          .backgroundColor('#F7F8FA')
          .width('100%')
          .height('100%');
        }
        .title('我的账户')
        .hideToolBar(false)
        .toolbarConfiguration([
          {
            value: '主页',
            icon: $r('app.media.ic_public_home'),
            action: () => {
              router.back();
            }
          },
          {
            value: '我的账户',
            icon: $r('app.media.myself')
          }
        ]);
      }
      .width('100%')
      .height('100%')

      // 退出登录确认对话框
      if (this.showLogoutDialog) {
        Column() {
          Column({ space: 12 }) {
            Text('确定要退出登录吗？')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .margin({ bottom: 8 });

            Row({ space: 12 }) {
              Button('取消')
                .fontSize(14)
                .width('40%')
                .height(36)
                .onClick(() => { this.showLogoutDialog = false; })

              Button('确定退出')
                .fontSize(14)
                .fontColor('#FFFFFF')
                .backgroundColor('#FF4D4F')
                .width('40%')
                .height(36)
                .onClick(() => {
                  // 这里添加退出登录逻辑
                  PromptAction.showToast({ message: '已退出登录' });
                  this.logout();
                  this.showLogoutDialog = false;
                })
            }
            .justifyContent(FlexAlign.Center)
            .margin({ top: 16 })
          }
          .padding(16)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .width('80%')
        }
        .justifyContent(FlexAlign.Center)
        .width('100%')
        .height('100%')
        .backgroundColor('#80000000')
      }
    }
  }
}