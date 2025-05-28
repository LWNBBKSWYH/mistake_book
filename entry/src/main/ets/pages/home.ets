import router from '@ohos.router';
import relationalStore from '@ohos.data.relationalStore';
import { ValuesBucket } from '@ohos.data.ValuesBucket';
import PromptAction from '@ohos.promptAction';
import {DB_NAME,StoreConfig} from '../entryability/EntryAbility'
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
  private rdbStore!: relationalStore.RdbStore;

  async aboutToAppear() {
    try {
      await this.initDatabase();
      await this.loadMistakeSets();
    } catch (err) {
      console.error('初始化错误:', err);
    }
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
    Stack() {
      Column() {
        Navigation() {
          Column() {
            // 顶部标题栏
            Row() {
              Text('我的错题集')
                .fontSize(24)
                .fontWeight(FontWeight.Bold)

              Button($r('app.media.ic_public_home'))
                .onClick(() => this.showSearch())
            }
            .height(56)
            .padding(16)

            // 新建按钮
            Button('新建错题集', { type: ButtonType.Capsule })
              .width('90%')
              .margin({ bottom: 16 })
              .onClick(() => { this.showAddDialog = true; })

            // 内容区域
            if (this.mistakeSets.length === 0 && !this.isLoading) {
              this.buildEmptyView()
            } else {
              this.buildMistakeList()
            }
          }
          .backgroundColor('#F5F7FA')
        }
        .toolbarConfiguration([
          { value: '主页', icon: $r('app.media.ic_public_home') },
          {
            value: '我的收藏',
            icon: $r('app.media.myself'),
            action: () => router.pushUrl({ url: 'pages/like' })
          }
        ])
      }

      // 添加错题集弹窗
      if (this.showAddDialog) {
        this.buildAddDialog()
      }
    }
  }

  // 空状态视图
  @Builder
  private buildEmptyView() {
    Column({ space: 12 }) {
      Image($r('app.media.tips'))
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

  // 错题集列表
  @Builder
  private buildMistakeList() {
    Grid() {
      ForEach(this.mistakeSets, (item: MistakeSet) => {
        GridItem() {
          Column({ space: 8 }) {
            Text(item.name)
              .fontSize(18)
              .fontWeight(FontWeight.Medium)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })

            Row() {
              Text(`${item.question_count}道题`)
                .fontSize(12)

              Blank()

              if (item.create_time) {
                Text(this.formatTime(item.create_time))
                  .fontSize(12)
              }
            }
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
        .margin(8)
      })
    }
    .columnsTemplate('1fr 1fr')
    .columnsGap(12)
    .rowsGap(12)
    .padding(12)
  }

  // 添加弹窗
  @Builder
  private buildAddDialog() {
    Column() {
      Column({ space: 16 }) {
        Text('新建错题集')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)

        TextInput({
          placeholder: '输入错题集名称',
          text: this.newTitle
        })
          .onChange((value: string) => { this.newTitle = value; })
          .height(48)
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .padding(12)

        Row({ space: 12 }) {
          Button('取消')
            .width('40%')
            .onClick(() => { this.showAddDialog = false; })

          Button('创建')
            .width('40%')
            .onClick(() => { this.addMistakeSet(); })
        }
        .margin({ top: 16 })
      }
      .padding(24)
      .backgroundColor('#FFFFFF')
      .borderRadius(16)
      .width('80%')
    }
    .justifyContent(FlexAlign.Center)
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