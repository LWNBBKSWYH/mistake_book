import router from '@ohos.router';
import dataPreferences from '@ohos.data.preferences';

class WrongQuestion {
  id: number;
  title: string;
  subject: string;
  chapter: string;
  section: string;
  isCollected: boolean;
  collectedDate: string;

  constructor(id: number, title: string, subject: string, chapter: string, section: string) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.chapter = chapter;
    this.section = section;
    this.isCollected = true;
    this.collectedDate = new Date().toLocaleDateString(); // 记录收藏日期
  }
}

@Entry
@Component
struct CollectionPage {
  private pref: dataPreferences.Preferences | null = null;
  @State collectedQuestions: WrongQuestion[] = [
    new WrongQuestion(1, "求函数f(x)=x³+2x的导数", "函数与导数", "导数运算", "第一节"),
    new WrongQuestion(2, "证明勾股定理a²+b²=c²", "平面几何", "三角形", "第二节"),
    new WrongQuestion(3, "解方程x²-5x+6=0", "代数", "一元二次方程", "第三节"),
    new WrongQuestion(4, "计算sin(π/3)的值", "三角函数", "特殊角函数值", "第一节"),
    new WrongQuestion(5, "求椭圆x²/4 + y²/9 = 1的面积", "圆锥曲线", "椭圆", "第四节"),
    new WrongQuestion(6, "排列组合：5人排队的可能性", "概率统计", "排列组合", "第二节"),
    new WrongQuestion(7, "求极限lim(x→0)(sinx/x)", "微积分", "极限", "第三节"),
    new WrongQuestion(8, "向量a=(1,2)和b=(3,4)的点积", "向量代数", "向量运算", "第一节")
  ];
  @State filteredQuestions: WrongQuestion[] = [];
  @State searchValue: string = '';
  @State searchHistory: string[] = [];
  searchController: SearchController = new SearchController();

  async aboutToAppear() {
    try {
      this.pref = await dataPreferences.getPreferences(getContext(this), 'collectionPref');
      const savedData = await this.pref.get('collectedQuestions', '[]');

      // 修改1：只有非空数据时才覆盖预设
      if (savedData !== '[]') {
        const parsedQuestions = JSON.parse(String(savedData)) as Partial<WrongQuestion>[];
        this.collectedQuestions = parsedQuestions
          .filter(q => q.id && q.title) // 放宽过滤条件
          .map(q => new WrongQuestion(
            Number(q.id),
            String(q.title),
            String(q.subject || '未分类'),
            String(q.chapter || '未分类'),
            String(q.section || '未分类')
          ));
      }

      this.filteredQuestions = [...this.collectedQuestions];
      // 加载搜索历史
      const history = await this.pref.get('searchHistory', '[]');
      this.searchHistory = (JSON.parse(String(history)) as string[]).filter(Boolean);
    } catch (err) {
      console.error('初始化失败:', err);
      this.collectedQuestions = [
        new WrongQuestion(1, "求函数f(x)=x³+2x的导数", "函数与导数", "导数运算", "第一节")
      ];
      this.filteredQuestions = [...this.collectedQuestions];
    }
  }

  // 保存数据到首选项
  private async saveData() {
    if (this.pref) {
      try {
        await this.pref.put('collectedQuestions', JSON.stringify(this.collectedQuestions));
        await this.pref.put('searchHistory', JSON.stringify(this.searchHistory));
        await this.pref.flush();
      } catch (e) {
        console.error('保存失败:', e);
      }
    }
  }
  // 新增方法：删除单个搜索历史项
  private async removeSearchHistoryItem(item: string) {
    this.searchHistory = this.searchHistory.filter(history => history !== item);
    await this.saveData();
  }
  // 新增方法：清空所有搜索历史
  private async clearAllSearchHistory() {
    this.searchHistory = [];
    await this.saveData();
  }
  private searchQuestions(value: string) {
    this.searchValue = value;

    if (!value) {
      this.filteredQuestions = [...this.collectedQuestions];
    } else {
      // 更新搜索历史
      if (!this.searchHistory.includes(value)) {
        this.searchHistory = [value, ...this.searchHistory].slice(0, 5);
        this.saveData();
      }

      // 安全搜索
      const lowerValue = value.toLowerCase();
      this.filteredQuestions = this.collectedQuestions.filter(item =>
      item.title.toLowerCase().includes(lowerValue) ||
      item.subject.toLowerCase().includes(lowerValue) ||
      item.chapter.toLowerCase().includes(lowerValue)
      );
    }
  }

  private async removeCollection(item: WrongQuestion) {
    this.collectedQuestions = this.collectedQuestions.filter(q => q.id !== item.id);
    this.searchQuestions(this.searchValue);
    await this.saveData();
  }

  build() {
    Column() {
      // 标题栏
      Row({ space: 5 }) {
        Image($r("app.media.ic_public_home"))
          .width(30)
          .margin({ left: 10 })
          .onClick(() => router.back());

        Text("我的收藏")
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333');

        Blank();
      }
      .width('100%')
      .height(56)
      .backgroundColor('#FFFFFF')
      .borderRadius(10)
      .shadow({ radius: 2, color: '#10000000', offsetX: 0, offsetY: 1 })
      .justifyContent(FlexAlign.Start);

      // 搜索栏
      Row() {
        Search({
          value: this.searchValue,
          placeholder: '搜索收藏的题目',
          controller: this.searchController
        })
          .width(this.searchValue === '' ? '90%' : '80%')
          .height(40)
          .backgroundColor('#FFFFFF')
          .placeholderColor('#999999')
          .textFont({ size: 16 })
          .margin({ top: 10, bottom: 10 })
          .onChange((value: string) => this.searchQuestions(value))
          .onSubmit((value: string) => this.searchQuestions(value));

        if (this.searchValue !== '') {
          Image($r("app.media.ic_public_search_filled"))
            .width(20)
            .margin({ left: 5 })
            .onClick(() => this.searchQuestions(''));
        }
      }
      .width('100%')
      .justifyContent(FlexAlign.Center);

      // 搜索历史
      if (this.searchHistory.length > 0 && this.searchValue === '') {
        Column() {
          Row() {
            Text('搜索历史')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
              .margin({ left: 10, top: 5, bottom: 5 })
              .layoutWeight(1);

            // 新增：清空所有历史按钮
            Text('清空')
              .fontSize(14)
              .fontColor('#FF6B81')
              .margin({ right: 10 })
              .onClick(() => this.clearAllSearchHistory());
          }
          .width('100%')

          Flex({ wrap: FlexWrap.Wrap }) {
            ForEach(this.searchHistory, (item: string) => {
              Row() {
                Text(item)
                  .fontSize(14)
                  .padding(8)
                  .backgroundColor('#F0F5FF')
                  .borderRadius(15)
                  .margin(5)
                  .fontColor('#1E90FF')
                  .onClick(() => this.searchQuestions(item));

                // 新增：删除单个历史项按钮
                Image($r("app.media.ic_public_delete"))
                  .width(12)
                  .margin({ left: -8 })
                  .onClick(() => this.removeSearchHistoryItem(item));
              }
            })
          }
          .margin({ left: 10, right: 10 })
        }
        .width('100%')
        .backgroundColor('#FFFFFF')
        .borderRadius(10)
        .padding(5)
        .margin({ top: 5, bottom: 5 })
        .shadow({ radius: 2, color: '#10000000', offsetX: 0, offsetY: 1 })
      }

      // 收藏列表
      List({ space: 10 }) {
        if (this.filteredQuestions.length === 0) {
          ListItem() {
            Column() {
              Image($r("app.media.ic_public_highlightsed"))
                .width(100)
                .margin({ bottom: 20 })
                .colorFilter('#FF9D8D8D')
              Text(this.searchValue === '' ? '暂无收藏内容' : '未找到相关题目')
                .fontSize(18)
                .fontColor('#999999');
            }
            .width('100%')
            .height(200)
            .justifyContent(FlexAlign.Center)
          }
        } else {
          ForEach(this.filteredQuestions, (item: WrongQuestion) => {
            ListItem() {
              Column({ space: 8 }) {
                Row() {
                  Text(item.title)
                    .fontSize(18)
                    .fontWeight(FontWeight.Medium)
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .layoutWeight(1)
                    .fontColor('#333333');

                  Image($r("app.media.ic_public_delete"))
                    .width(25)
                    .onClick(() => this.removeCollection(item));
                }
                .width('100%')

                Row({ space: 10 }) {
                  Text(`科目：${item.subject}`)
                    .fontSize(14)
                    .fontColor('#666666');

                  Text(`章节：${item.chapter}`)
                    .fontSize(14)
                    .fontColor('#666666');
                }
                .width('100%')
                .margin({ top: 5 })

                Text(`收藏于：${item.collectedDate}`)
                  .fontSize(12)
                  .fontColor('#999999')
                  .margin({ top: 5 })
                  .alignSelf(ItemAlign.End)
              }
              .padding(15)
              .width('100%')
              .backgroundColor('#FFFFFF')
              .borderRadius(10)
              .shadow({ radius: 2, color: '#10000000', offsetX: 0, offsetY: 1 })
              .onClick(() => {
                router.pushUrl({
                  url: 'pages/questionDetail',
                  params: {
                    questionId: String(item.id),
                    from: 'collection'
                  }
                });
              });
            }
          }, (item: WrongQuestion) => String(item.id))
        }
      }
      .width('100%')
      .layoutWeight(1)
      .divider({
        strokeWidth: 1,
        color: '#F1F1F1',
        startMargin: 10,
        endMargin: 10
      });
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
    .padding(10);
  }
}