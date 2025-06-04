// 在home.txt中添加搜索框，参考like.txt的搜索逻辑
import router from '@ohos.router';
import relationalStore from '@ohos.data.relationalStore';
import { ValuesBucket } from '@ohos.data.ValuesBucket';
import PromptAction from '@ohos.promptAction';
import {DB_NAME,StoreConfig} from '../entryability/EntryAbility'
import dataPreferences from '@ohos.data.preferences';
// 数据库配置
const DB_CONFIG:StoreConfig = {
  name: DB_NAME,
  securityLevel: relationalStore.SecurityLevel.S1,
  encrypt: false
};

// 在 home.txt 中修改表结构：
const TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS mistakes_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  question_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
)`;

interface MistakeSet {
  id: number;
  name: string;
  description: string;
  question_count?: number;
  create_time?: string;
  updated_at?: string;
}

@Entry
@Component
struct MistakeHome {
  @State mistakeSets: MistakeSet[] = [];
  @State isLoading: boolean = false;
  @State newTitle: string = '';
  @State showAddDialog: boolean = false;
  @State searchValue: string = '';
  @State searchHistory: string[] = [];
  @State filteredSets: MistakeSet[] = [];
  @State showSearchResult: boolean = false;
  @State searchResultCount: number = 0;
  private pref: dataPreferences.Preferences | null = null;
  private rdbStore!: relationalStore.RdbStore;
  searchController: SearchController = new SearchController();

  async onPageShow(): Promise<void> {
    await this.initDatabase();
    await this.loadMistakeSets();

    this.pref = await dataPreferences.getPreferences(getContext(this), 'collectionPref');
    const history = await this.pref.get('searchHistory', '[]');
    this.searchHistory = (JSON.parse(String(history)) as string[]).filter(Boolean);

  }

  // 搜索错题集
  private searchSets(value: string) {
    this.searchValue = value;
    this.showSearchResult = false; // 重置搜索结果显示状态

    if (!value.trim()) {
      this.filteredSets = [...this.mistakeSets];
      return;
    }

    // 安全搜索
    const lowerValue = value.toLowerCase();
    this.filteredSets = this.mistakeSets.filter(item =>
    item.name.toLowerCase().includes(lowerValue) ||
      (item.description && item.description.toLowerCase().includes(lowerValue))
    );

    // 显示搜索结果提示
    this.searchResultCount = this.filteredSets.length;
    this.showSearchResult = true;

    // 3秒后自动隐藏搜索结果提示
    setTimeout(() => {
      this.showSearchResult = false;
    }, 3000);
  }

  // 初始化数据库连接
  private async initDatabase() {
    try {
      this.rdbStore = await relationalStore.getRdbStore(getContext(this), DB_CONFIG);
      await this.rdbStore.executeSql(TABLE_SCHEMA);
    } catch (err) {
      console.error('数据库初始化失败:', err);
      PromptAction.showToast({ message: '数据库初始化失败' });
    }
  }

  // 加载错题集（带分页功能）
  private async loadMistakeSets() {
    this.isLoading = true;
    try {
      const predicates = new relationalStore.RdbPredicates('mistakes_collections');
      const resultSet = await this.rdbStore.query(
        predicates,
        ['id', 'name', 'description', 'question_count', 'created_at','updated_at']
      );

      this.mistakeSets = [];
      while (resultSet.goToNextRow()) {
        this.mistakeSets.push({
          id: resultSet.getLong(resultSet.getColumnIndex('id')),
          name: resultSet.getString(resultSet.getColumnIndex('name')),
          description: resultSet.getString(resultSet.getColumnIndex('description')),
          question_count: resultSet.getLong(resultSet.getColumnIndex('question_count')),
          create_time: resultSet.getString(resultSet.getColumnIndex('created_at')),
          updated_at:resultSet.getString(resultSet.getColumnIndex('updated_at'))
        });
      }
      resultSet.close();
    } catch (err) {
      console.error('加载错题集失败:', err);
      PromptAction.showToast({ message: '加载数据失败' });
    } finally {
      this.isLoading = false;
    }
  }

  // 添加错题集（带输入校验）
  private async addMistakeSet() {
    if (!this.newTitle.trim()) {
      PromptAction.showToast({ message: '标题不能为空' });
      return;
    }

    try {
      const valueBucket: ValuesBucket = {
        'name': this.newTitle.substring(0, 100), // 限制长度
        'description': '',
        'question_count': 0
      };
      // 确保插入操作完成
      await this.rdbStore.insert('mistakes_collections', valueBucket);

      PromptAction.showToast({ message: '添加成功' });
      // 重置状态
      this.newTitle = '';
      this.showAddDialog = false;

      await this.loadMistakeSets();
    } catch (err) {
      console.error('添加失败:', err);
      PromptAction.showToast({ message: '添加失败' });
    }
  }

  // 主界面构建
  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('我的错题集')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
      }
      .width('100%')
      .height(40)
      .padding({ left: 24, right: 24 })
      .backgroundColor('#5A8BFF')
      .alignItems(VerticalAlign.Center)

      // 主要内容区域 - 使用弹性布局
      Column() {
        // 搜索栏
        Row() {
          Search({
            value: this.searchValue,
            placeholder: '搜索错题集',
            controller: this.searchController
          })
            .width('90%')
            .height(40)
            .backgroundColor('#FFFFFF')
            .placeholderColor('#999999')
            .textFont({ size: 16 })
            .margin({ top: 10, bottom: 10 })
            .onChange((value: string) => this.searchSets(value))
            .onSubmit((value: string) => {
              this.searchSets(value);
              PromptAction.showToast({
                message: `找到${this.filteredSets.length}个匹配的错题集`,
                duration: 2000
              });
            });
        }
        .width('100%')
        .justifyContent(FlexAlign.Center);

        // 新建按钮
        Button('新建错题集', { type: ButtonType.Capsule })
          .width('90%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .backgroundColor('#5A8BFF')
          .margin({ bottom: 16 })
          .onClick(() => { this.showAddDialog = true; })

        this.buildSearchResultToast();
        // 内容区域 - 使用弹性布局
        Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Start, alignItems: ItemAlign.Center }) {
          if (this.mistakeSets.length === 0 && !this.isLoading) {
            this.buildEmptyView()
          } else {
            this.buildMistakeList()
          }
        }
        .layoutWeight(1) // 占据剩余空间
        .width('100%')
      }
      .layoutWeight(1) // 主要内容区域占据剩余空间
      .width('100%')
      .backgroundColor('#F5F7FA')

      // 底部导航栏
      Navigation() {
        Column() {
        }
      }
      .height(56)
      .toolbarConfiguration([
        {
          value: '主页',
          icon: $r('app.media.ic_public_home')
        },
        {
          value: '我的收藏',
          icon: $r('app.media.myself'),
          action: () => router.pushUrl({ url: 'pages/like' })
        }
      ])
      .backgroundColor('#FFFFFF')
      .shadow({ radius: 8, color: '#10000000', offsetY: -2 })

      // 添加错题集弹窗
      if (this.showAddDialog) {
        this.buildAddDialog()
      }
    }
    .width('100%')
    .height('100%')
  }
  //搜索提示弹窗
  @Builder
  private buildSearchResultToast() {
    if (this.showSearchResult) {
      Column() {
        Text(`找到${this.searchResultCount}个匹配的错题集`)
          .fontSize(16)
          .fontColor('#FFFFFF')
          .padding(10)
          .backgroundColor('#5A8BFF')
          .borderRadius(20)
      }
      .position({ x: '25%', y: '25%' })
      .zIndex(999)
      .alignItems(HorizontalAlign.Center)
      .width('100%')
    }
  }
  // 空状态视图
  @Builder
  private buildEmptyView() {
    Column({ space: 12 }) {
      Image($r("app.media.NoSet"))
        .width(120)
        .height(120)

      Text('暂无错题集')
        .fontSize(18)
        .fontColor('#666666')

      Text('点击上方按钮创建第一个错题集')
        .fontSize(14)
        .fontColor('#999999')
    }
    .margin({ top: 80 })
  }

  @Builder
  private buildMistakeList() {
    Scroll() {
      Column() {  // 使用 Column 作为 Scroll 的直接子组件
        Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.SpaceBetween, alignItems: ItemAlign.Start }) {
          ForEach(this.searchValue ? this.filteredSets : this.mistakeSets, (item: MistakeSet) => {
            Flex({ direction: FlexDirection.Column }) {
              Column({ space: 8 }) {
                Row() {
                  Image($r('app.media.book'))
                    .width(24)
                    .height(24)
                    .margin({ right: 8 })

                  Text(item.name)
                    .fontSize(16)
                    .fontWeight(FontWeight.Medium)
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .layoutWeight(1)
                }
                .width('100%')
                .margin({ bottom: 8 })

                Row() {
                  Image($r('app.media.icon_question'))
                    .width(16)
                    .height(16)
                    .margin({ right: 4 })

                  Text(`${item.question_count}道题`)
                    .fontSize(12)
                    .fontColor('#666666')

                  Blank()

                  Image($r('app.media.day'))
                    .width(16)
                    .height(16)
                    .margin({ right: 4 })

                  if (item.create_time) {
                    Text(this.formatTime(item.create_time))
                      .fontSize(12)
                      .fontColor('#666666')
                  }
                }
                .width('100%')
              }
              .padding(16)
              .backgroundColor('#FFFFFF')
              .borderRadius(12)
              .shadow({ radius: 6, color: '#10000000', offsetY: 2 })
              .height(120)
              .onClick(() => {
                router.pushUrl({
                  url: 'pages/errorbook',
                  params: {
                    id: item.id.toString(),
                    name: item.name
                  }
                });
              })
            }
            .width('48%')
            .margin({ bottom: 12 })
          })
        }
        .padding(12)
        .width('100%')
      }
      .width('100%')
    }
    .align(Alignment.TopStart)  // 确保滚动内容从顶部开始
    .width('100%')
    .height('100%')
  }

  // 添加弹窗
  @Builder
  private buildAddDialog() {
    Column() {
      Column({ space: 16 }) {
        Text('新建错题集')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')

        TextInput({
          placeholder: '输入错题集名称',
          text: this.newTitle
        })
          .onChange((value: string) => { this.newTitle = value; })
          .height(48)
          .backgroundColor('#F5F7FA')
          .borderRadius(8)
          .padding(12)
          .border({ width: 1, color: '#E5E5E5' })

        Row({ space: 12 }) {
          Button('取消')
            .width('40%')
            .height(40)
            .fontSize(16)
            .backgroundColor('#F5F7FA')
            .fontColor('#666666')
            .onClick(() => { this.showAddDialog = false; })

          Button('创建')
            .width('40%')
            .height(40)
            .fontSize(16)
            .backgroundColor('#5A8BFF')
            .fontColor('#FFFFFF')
            .onClick(() => { this.addMistakeSet(); })
        }
        .margin({ top: 16 })
      }
      .padding(24)
      .backgroundColor('#FFFFFF')
      .borderRadius(16)
      .width('80%')
    }
    .position({ x: 0, y: 0 })  // 固定位置
    .zIndex(999)  // 确保在最上层
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .width('100%')
    .height('100%')
    .backgroundColor('#80000000')
  }


  // 格式化时间
  private formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  }

  // 搜索功能（示例）
  private showSearch() {
    PromptAction.showToast({ message: '搜索功能待实现' });
  }
}