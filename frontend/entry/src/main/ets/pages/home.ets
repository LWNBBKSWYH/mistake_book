import router from '@ohos.router';
import http from '@ohos.net.http';
import PromptAction from '@ohos.promptAction';
import {apimistakeCollections} from '../utils/net_config'
interface MistakeSet {
  id: number;
  title: string;
  subject: string;
  create_time?: string;
  question_count?: number; // 新增字段，表示题目数量
}

interface ApiResponse {
  code: number;
  message: string;
  list?: MistakeSet[];
  data?: MistakeSet;
}

@Entry
@Component
struct MistakeHome {
  @State mistakeSets: MistakeSet[] = [];
  @State isLoading: boolean = false;
  @State newTitle: string = '';
  @State showAddDialog: boolean = false;
  @StorageLink('username') username: string = '';
  private httpRequest: http.HttpRequest = http.createHttp();
  private async loadUsername() {
    try {
      // 检查StorageLink绑定的username是否已有值
      if (this.username && this.username.trim() !== '') {
        console.log('从StorageLink获取用户名:', this.username);
        return;
      }
      //如果没有获取到，提示用户并跳转登录页
      PromptAction.showToast({
        message: '未检测到登录信息，请先登录',
        duration: 2000
      });
      // 延迟跳转让用户能看到提示
      setTimeout(() => {
        router.replaceUrl({
          url: 'pages/Login',
          params: { from: 'mistakeHome' }
        });
      }, 2000);
    } catch (err) {
      console.error('获取用户名失败:', err);
      PromptAction.showToast({
        message: '获取用户信息异常',
        duration: 2000
      });
    }
  }

  async aboutToAppear() {
    try {
      await this.loadUsername();
      if (this.username && this.username.trim() !== '') {
        await this.loadMistakeSets();
      } else {
        console.error('用户名为空或未设置');
      }
    } catch (err) {
      console.error('初始化错误:', err);
    }
  }

  async loadMistakeSets() {
    if (!this.username || this.username.trim() === '') {
      console.error('无法加载错题集: 用户名为空');
      PromptAction.showToast({ message: '请先登录' });
      return;
    }
    this.isLoading = true;
    try {
      // 添加请求参数
      let queryString = `username=${encodeURIComponent(this.username)}`;
      const fullUrl = `${apimistakeCollections.list}?${queryString}`;
      console.log('请求URL:', fullUrl); // 调试日志

      const res = await this.httpRequest.request(
        fullUrl,
        {
          method: http.RequestMethod.GET,
          header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      console.log('响应状态:', res.responseCode);
      console.log('响应结果:', res.result);

      if (res.responseCode === 200) {
        const result: ApiResponse = JSON.parse(res.result as string);
        this.mistakeSets = result.list || [];
      } else {
        PromptAction.showToast({
          message: `加载失败: ${res.responseCode}`
        });
      }
    } catch (err) {
      console.error('请求错误详情:', err);
      PromptAction.showToast({
        message: `网络异常: ${err.message}`
      });
    } finally {
      this.isLoading = false;
    }
  }

  async addMistakeSet() {
    if (!this.newTitle ) {
      PromptAction.showToast({ message: '标题不能为空' });
      return;
    }

    const body = JSON.stringify({
      username: this.username,
      title: this.newTitle
    });
    try {
      const res = await this.httpRequest.request(apimistakeCollections.create, {
        method: http.RequestMethod.POST,
        header: { 'Content-Type': 'application/json' },
        extraData: body
      });
      if (res.responseCode === 200) {
        PromptAction.showToast({ message: '添加成功' });
        this.newTitle = '';
        this.showAddDialog = false;
        this.loadMistakeSets();
      } else {
        PromptAction.showToast({ message: '添加失败' });
      }
    } catch {
      PromptAction.showToast({ message: '请求出错' });
    }
  }

  build() {
    Stack() {
      Column() {
        Navigation() {
          Column() {
            // 顶部标题和搜索栏
            Row() {
              Text('我的错题集')
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .fontColor('#333333')
                .margin({ left: 16 })

              Blank()

              Button($r('app.media.ic_public_search_filled'))
                .fontSize(24)
                .backgroundColor(Color.Transparent)
                .margin({ right: 16 })
            }
            .width('100%')
            .height(56)
            .alignItems(VerticalAlign.Center)

            // 新建按钮
            Button('新建错题集', { type: ButtonType.Capsule })
              .fontSize(16)
              .fontColor('#FFFFFF')
              .backgroundColor('#0a59f7')
              .width('90%')
              .height(48)
              .margin({ top: 8, bottom: 16 })
              .onClick(() => { this.showAddDialog = true; })

            // 内容区域
            if (this.mistakeSets.length === 0 && !this.isLoading) {
              Column({ space: 12 }) {
                Image($r('app.media.tips'))
                  .width(120)
                  .height(120)
                  .margin({ bottom: 16 })

                Text('暂无错题集')
                  .fontSize(18)
                  .fontColor('#666666')
                  .fontWeight(FontWeight.Medium)

                Text('点击上方按钮创建第一个错题集')
                  .fontSize(14)
                  .fontColor('#999999')
              }
              .alignItems(HorizontalAlign.Center)
              .width('100%')
              .margin({ top: 80 })
            } else {
              // 错题集列表
              Grid() {
                ForEach(this.mistakeSets, (item: MistakeSet) => {
                  GridItem() {
                    Column({ space: 8 }) {
                      Row() {
                        Text(item.title)
                          .fontSize(18)
                          .fontWeight(FontWeight.Medium)
                          .fontColor('#333333')
                          .layoutWeight(1)
                          .maxLines(1)
                          .textOverflow({ overflow: TextOverflow.Ellipsis })
                      }
                      .width('100%')

                      Row() {
                        Text(`${item.question_count}道题`)
                          .fontSize(12)
                          .fontColor('#666666')
                        Blank()
                        if (item.create_time) {
                          Text(this.formatTime(item.create_time))
                            .fontSize(12)
                            .fontColor('#999999')
                        }
                      }
                      .width('100%')
                    }
                    .padding(16)
                    .backgroundColor('#FFFFFF')
                    .borderRadius(12)
                    .shadow({ radius: 6, color: '#10000000', offsetX: 0, offsetY: 2 })
                    .width('100%')
                    .height(120)
                    .onClick(() => {
                      router.pushUrl({
                        url: 'pages/errorbook',
                        params: {
                          id: item.id.toString(),
                          title: item.title,
                          subject: item.subject,
                          question_count: item.question_count
                        }
                      });
                    })
                  }
                  .margin(8)
                })
              }
              .columnsTemplate('1fr 1fr')
              .columnsGap(12)
              .rowsGap(12)
              .width('100%')
              .padding(12)
              .layoutWeight(1)
            }

            // 加载指示器
            if (this.isLoading) {
              LoadingProgress()
                .color('#0a59f7')
                .margin({ top: 32, bottom: 32 })
            }
          }
          .width('100%')
          .height('100%')
          .backgroundColor('#F5F7FA')
        }
        .hideToolBar(false)
        .toolbarConfiguration([
          {
            value: '主页',
            icon: $r('app.media.ic_public_home')
          },
          {
            value: '我的账户',
            icon: $r('app.media.myself'),
            action: () => {
              router.pushUrl({ url: 'pages/account' });
            }
          }
        ])
      }

      // 添加错题集对话框
      if (this.showAddDialog) {
        Column() {
          Column({ space: 16 }) {
            Text('新建错题集')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .margin({ bottom: 8 })

            Column({ space: 4 }) {
              TextInput({ placeholder: '输入错题集名称', text: this.newTitle })
                .onChange((value: string) => { this.newTitle = value; })
                .height(48)
                .backgroundColor('#FFFFFF')
                .borderRadius(8)
                .padding(12)
            }

            Row({ space: 12 }) {
              Button('取消')
                .fontSize(16)
                .fontColor('#666666')
                .backgroundColor('#F0F0F0')
                .width('40%')
                .height(48)
                .borderRadius(24)
                .onClick(() => { this.showAddDialog = false; })

              Button('创建')
                .fontSize(16)
                .fontColor('#FFFFFF')
                .backgroundColor('#0a59f7')
                .width('40%')
                .height(48)
                .borderRadius(24)
                .onClick(() => { this.addMistakeSet(); })
            }
            .justifyContent(FlexAlign.Center)
            .margin({ top: 16 })
          }
          .padding(24)
          .backgroundColor('#FFFFFF')
          .borderRadius(16)
          .width('80%')
        }
        .justifyContent(FlexAlign.Center)
        .width('100%')
        .height('100%')
        .backgroundColor('#80000000')
      }
    }
  }

  private formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  }
}