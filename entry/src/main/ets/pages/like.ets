import router from '@ohos.router';
import dataPreferences from '@ohos.data.preferences';
import relationalStore from '@ohos.data.relationalStore';
import { DB_NAME } from '../entryability/EntryAbility'
import PromptAction from '@ohos.promptAction';
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
interface QuestionItem {
  id?: number;
  collection_id: number;
  subject: string;
  question_description: string;
  question_answer: string;
  question_type: string;
  options?: string;
  analysis?: string;
  tags?: string;
  difficulty?: number;
  wrong_times?: number;
  created_at?: string;
  updated_at?: string;
  islike?: number;
}
@Entry
@Component
struct CollectionPage {
  private rdbStore: relationalStore.RdbStore | null = null;
  private pref: dataPreferences.Preferences | null = null;
  private pageSize: number = 10;
  @State currentPage: number = 1;
  @State collectionId: string = '';
  @State collectedquestions: QuestionItem[] = [];
  @State collectedQuestions2: WrongQuestion[] = [
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
  @State isLoading: boolean = false;
  @State searchKeyword: string = '';
  @State searchHistory: string[] = [];
  searchController: SearchController = new SearchController();
  async onPageShow(): Promise<void> {
    await this.initDatabase();
    await this.fetchQuestions();
  }
  // 获取收藏错题列表
  private async fetchQuestions() {
    console.log("开始获取收藏错题")
    if (!this.rdbStore) {
      throw new Error('数据库未初始化');
    }
    this.isLoading = true;
    try {
      const predicates = new relationalStore.RdbPredicates('mistakes');
      predicates.equalTo('islike', 1);
      console.log("查询try");
      // 如果有搜索关键词
      if (this.searchKeyword) {
        predicates.contains('question_description', this.searchKeyword);
      }

      // 设置分页
      predicates.offsetAs((this.currentPage - 1) * this.pageSize);
      predicates.limitAs(this.pageSize);

      const columns = [
        'id', 'collection_id', 'subject', 'question_description',
        'question_type', 'question_answer', // 添加这个字段
        'difficulty', 'wrong_times', 'created_at'
      ];

      const resultSet = await this.rdbStore.query(predicates, columns);
      console.log("查询成功");
      /*const updatedQuestion = await this.getQuestionBylike();
      if (updatedQuestion) {
        console.log('收藏问题数据:', JSON.stringify(updatedQuestion, null, 2));
      } else {
        console.warn('未找到收藏的问题数据');
      }*/
      this.collectedquestions = [];
      while (resultSet.goToNextRow()) {
        this.collectedquestions.push({
          id: resultSet.getLong(resultSet.getColumnIndex('id')),
          collection_id: parseInt(this.collectionId),
          subject: resultSet.getString(resultSet.getColumnIndex('subject')),
          question_description: resultSet.getString(resultSet.getColumnIndex('question_description')),
          question_type: resultSet.getString(resultSet.getColumnIndex('question_type')),
          difficulty: resultSet.getLong(resultSet.getColumnIndex('difficulty')),
          wrong_times: resultSet.getLong(resultSet.getColumnIndex('wrong_times')),
          created_at: resultSet.getString(resultSet.getColumnIndex('created_at')),
          question_answer: resultSet.getString(resultSet.getColumnIndex('question_answer'))
        });
      }
      resultSet.close();
    } catch (err) {
      console.error('获取错题列表失败:', err);
      PromptAction.showToast({ message: '获取列表失败' });
    } finally {
      this.isLoading = false;
    }
  }
  // 初始化数据库连接
  private async initDatabase() {
    try {
      this.rdbStore = await relationalStore.getRdbStore(
        getContext(this),
        {
          name: DB_NAME,
          securityLevel: relationalStore.SecurityLevel.S1
        }
      );
    } catch (err) {
      console.error('数据库初始化失败:', err);
      PromptAction.showToast({ message: '数据库初始化失败' });
    }
  }
  private async getQuestionBylike(): Promise<QuestionItem | null> {
    if (!this.rdbStore) {
      console.error('数据库未初始化');
      return null;
    }

    try {
      const predicates = new relationalStore.RdbPredicates('mistakes');
      predicates.equalTo('islike', 1);

      const resultSet = await this.rdbStore.query(predicates, [
        'id', 'collection_id', 'subject', 'question_description',
        'question_answer', 'question_type', 'options',
        'analysis', 'tags', 'difficulty', 'wrong_times',
        'created_at', 'updated_at', 'islike'
      ]);

      if (resultSet.goToFirstRow()) {
        return {
          id: resultSet.getLong(resultSet.getColumnIndex('id')),
          collection_id: resultSet.getLong(resultSet.getColumnIndex('collection_id')),
          subject: resultSet.getString(resultSet.getColumnIndex('subject')),
          question_description: resultSet.getString(resultSet.getColumnIndex('question_description')),
          question_answer: resultSet.getString(resultSet.getColumnIndex('question_answer')),
          question_type: resultSet.getString(resultSet.getColumnIndex('question_type')),
          options: resultSet.getString(resultSet.getColumnIndex('options')),
          analysis: resultSet.getString(resultSet.getColumnIndex('analysis')),
          tags: resultSet.getString(resultSet.getColumnIndex('tags')),
          difficulty: resultSet.getLong(resultSet.getColumnIndex('difficulty')),
          wrong_times: resultSet.getLong(resultSet.getColumnIndex('wrong_times')),
          created_at: resultSet.getString(resultSet.getColumnIndex('created_at')),
          updated_at: resultSet.getString(resultSet.getColumnIndex('updated_at')),
          islike: resultSet.getLong(resultSet.getColumnIndex('islike'))
        };
      }
      return null;
    } catch (err) {
      console.error('查询失败:', err);
      return null;
    }
  }
  async aboutToAppear() {
    try {
      this.pref = await dataPreferences.getPreferences(getContext(this), 'collectionPref');
      const savedData = await this.pref.get('collectedQuestions', '[]');

      // 修改1：只有非空数据时才覆盖预设
      if (savedData !== '[]') {
        const parsedQuestions = JSON.parse(String(savedData)) as Partial<WrongQuestion>[];
        this.collectedQuestions2 = parsedQuestions
          .filter(q => q.id && q.title) // 放宽过滤条件
          .map(q => new WrongQuestion(
            Number(q.id),
            String(q.title),
            String(q.subject || '未分类'),
            String(q.chapter || '未分类'),
            String(q.section || '未分类')
          ));
      }

      this.filteredQuestions = [...this.collectedQuestions2];
      // 加载搜索历史
      const history = await this.pref.get('searchHistory', '[]');
      this.searchHistory = (JSON.parse(String(history)) as string[]).filter(Boolean);
    } catch (err) {
      console.error('初始化失败:', err);
      this.collectedQuestions2 = [
        new WrongQuestion(1, "求函数f(x)=x³+2x的导数", "函数与导数", "导数运算", "第一节")
      ];
      this.filteredQuestions = [...this.collectedQuestions2];
    }
  }

  // 保存数据到首选项
  private async saveData() {
    if (this.pref) {
      try {
        await this.pref.put('collectedQuestions', JSON.stringify(this.collectedQuestions2));
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
      this.filteredQuestions = [...this.collectedQuestions2];
    } else {
      // 更新搜索历史
      if (!this.searchHistory.includes(value)) {
        this.searchHistory = [value, ...this.searchHistory].slice(0, 5);
        this.saveData();
      }

      // 安全搜索
      const lowerValue = value.toLowerCase();
      this.filteredQuestions = this.collectedQuestions2.filter(item =>
      item.title.toLowerCase().includes(lowerValue) ||
      item.subject.toLowerCase().includes(lowerValue) ||
      item.chapter.toLowerCase().includes(lowerValue)
      );
    }
  }

  private async removeCollection(item: WrongQuestion) {
    this.collectedQuestions2 = this.collectedQuestions2.filter(q => q.id !== item.id);
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
        if (this.collectedquestions.length === 0) {
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
          ForEach(this.collectedquestions, (item: QuestionItem) => {
            ListItem() {
              Column({ space: 8 }) {
                Row() {
                  Text(item.question_description)
                    .fontSize(18)
                    .fontWeight(FontWeight.Medium)
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .layoutWeight(1)
                    .fontColor('#333333');

                  Image($r("app.media.ic_public_delete"))
                    .width(25)
                    .onClick(async () => {
                      if (!this.rdbStore) return;

                      try {
                        await this.rdbStore.executeSql(
                          `UPDATE mistakes SET islike = 0 WHERE id = ?`,
                          [item.id]
                        );
                        console.log('更新成功，id:', item.id);
                      } catch (err) {
                        console.error('更新失败:', err);
                      }
                    });
                }
                .width('100%')

                Row({ space: 10 }) {
                  Text(`科目：${item.subject}`)
                    .fontSize(14)
                    .fontColor('#666666');

                  /*Text(`章节：${item.}`)
                    .fontSize(14)
                    .fontColor('#666666');*/
                }
                .width('100%')
                .margin({ top: 5 })

                /*Text(`收藏于：${item.}`)
                  .fontSize(12)
                  .fontColor('#999999')
                  .margin({ top: 5 })
                  .alignSelf(ItemAlign.End)*/
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
          }, (item: QuestionItem) => String(item.id))
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