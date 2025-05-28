import router from '@ohos.router';
import PromptAction from '@ohos.promptAction';
import relationalStore from '@ohos.data.relationalStore';
import { DB_NAME } from '../entryability/EntryAbility'

interface QuestionItem {
  id: number;
  collection_id: number;
  subject: string;
  question_description: string;
  question_answer?: string;
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

interface CollectionInfo {
  title: string;
  description: string;
  question_count: number;
}
interface RouterParams {
  id?: string | number; // 根据实际情况调整类型
  // 其他可能的参数...
}
@Entry
@Component
struct CollectionDetail {
  @State collectionId: string = '';
  @State questions: QuestionItem[] = [];
  @State isLoading: boolean = false;
  @State searchKeyword: string = '';
  @State currentPage: number = 1;
  @State totalPages: number = 1;
  @State collectionInfo: CollectionInfo = {
    title: '',
    description: '',
    question_count: 0
  };
  private rdbStore: relationalStore.RdbStore | null = null;
  private pageSize: number = 10;

  async aboutToAppear() {
    const params = router.getParams() as RouterParams;
    this.collectionId = params?.id?.toString() || '';
    console.log(`准备查询错题集，ID: ${this.collectionId}`);
    if (!this.collectionId) {
      PromptAction.showToast({ message: '缺少错题集ID参数' });
      return;
    }
    await this.initDatabase();
    await this.fetchCollectionInfo();
    await this.fetchQuestions();
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

  // 获取错题集信息
  private async fetchCollectionInfo() {
    try {
      if (!this.rdbStore) {
        throw new Error('数据库未初始化');
      }
      console.log(`查询错题集信息，collectionId: ${this.collectionId}`);
      const predicates = new relationalStore.RdbPredicates('mistakes_collections');
      predicates.equalTo('id', parseInt(this.collectionId));

      const resultSet = await this.rdbStore.query(
        predicates,
        ['name', 'description']
      );

      if (resultSet.rowCount > 0 && resultSet.goToFirstRow()) {
        if (resultSet.goToFirstRow()) {
          this.collectionInfo.title = resultSet.getString(resultSet.getColumnIndex('name')) || '';
          this.collectionInfo.description = resultSet.getString(resultSet.getColumnIndex('description')) || '';
        }
      }else {
        console.warn(`未找到ID为${this.collectionId}的错题集`);
        PromptAction.showToast({ message: '未找到该错题集' });
        router.back(); // 返回上一页
        return;
      }
      resultSet.close();

      // 获取题目总数
      const countPredicates = new relationalStore.RdbPredicates('mistakes');
      countPredicates.equalTo('collection_id', parseInt(this.collectionId));
      const countResult = await this.rdbStore.query(
        countPredicates,
        ['COUNT(*) AS count']  // 使用COUNT聚合函数并设置别名
      );
      this.collectionInfo.question_count = countResult.getLong(countResult.getColumnIndex('count'));
      this.totalPages = Math.ceil(this.collectionInfo.question_count / this.pageSize);
    } catch (err) {
      console.error('获取错题集信息失败详情:', JSON.stringify(err));
      PromptAction.showToast({ message: '获取信息失败' });
    }
  }

  // 获取错题列表
  private async fetchQuestions() {
    if (!this.rdbStore) {
      throw new Error('数据库未初始化');
    }
    this.isLoading = true;
    try {
      const predicates = new relationalStore.RdbPredicates('mistakes');
      predicates.equalTo('collection_id', parseInt(this.collectionId));

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

      this.questions = [];
      while (resultSet.goToNextRow()) {
        this.questions.push({
          id: resultSet.getLong(resultSet.getColumnIndex('id')),
          collection_id: parseInt(this.collectionId),
          subject: resultSet.getString(resultSet.getColumnIndex('subject')),
          question_description: resultSet.getString(resultSet.getColumnIndex('question_description')),
          question_type: resultSet.getString(resultSet.getColumnIndex('question_type')),
          difficulty: resultSet.getLong(resultSet.getColumnIndex('difficulty')),
          wrong_times: resultSet.getLong(resultSet.getColumnIndex('wrong_times')),
          created_at: resultSet.getString(resultSet.getColumnIndex('created_at'))
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

  // 搜索功能
  onSearch() {
    this.currentPage = 1;
    this.fetchQuestions();
  }

  // 加载更多
  loadMore() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchQuestions();
    }
  }

  build() {
    Column() {
      // 错题集信息卡片
      Column() {
        Text(this.collectionInfo.title)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 8 })

        Text(this.collectionInfo.description)
          .fontSize(14)
          .fontColor('#666')
          .margin({ bottom: 8 })

        Text(`共${this.collectionInfo.question_count}题`)
          .fontSize(12)
          .fontColor('#999')
      }
      .padding(16)
      .width('100%')
      .backgroundColor('#FFF')
      .margin({ bottom: 12 })

      // 搜索栏
      Row() {
        TextInput({ placeholder: '搜索题目' })
          .onChange((value: string) => {
            this.searchKeyword = value;
          })
          .height(40)
          .layoutWeight(1)
          .borderRadius(20)
          .backgroundColor('#FFF')
          .padding({ left: 16, right: 16 })

        Button('搜索')
          .onClick(() => this.onSearch())
          .width(80)
          .height(40)
          .margin({ left: 8 })
      }
      .padding({ left: 16, right: 16 })
      .margin({ bottom: 12 })

      // 错题列表
      List() {
        // 当没有错题时显示创建按钮
        if (this.questions.length === 0 && !this.isLoading) {
          ListItem() {
            Button('创建新错题记录')
              .onClick(() => {
                router.pushUrl({
                  url: 'pages/createQuestion',
                  params: { collectionId: this.collectionId }
                });
              })
              .width('80%')
              .height(48)
              .type(ButtonType.Capsule)
              .backgroundColor('#0a59f7')
          }
          .margin({ top: 20 })
          .align(Alignment.Center)
        }

        // 显示错题卡片
        ForEach(this.questions, (question: QuestionItem) => {
          ListItem() {
            Column() {
              // 题目类型和难度标签
              Row() {
                Text(question.question_type)
                  .fontSize(12)
                  .fontColor('#FFF')
                  .padding({
                    left: 8,
                    right: 8,
                    top: 2,
                    bottom: 2
                  })
                  .backgroundColor('#0a59f7')
                  .borderRadius(4)

                if (question.difficulty) {
                  Text(`难度: ${'★'.repeat(question.difficulty)}`)
                    .fontSize(12)
                    .fontColor('#FFA500')
                    .margin({ left: 8 })
                }
              }
              .margin({ bottom: 8 })

              // 题目内容
              Text(question.question_description)
                .fontSize(16)
                .margin({ bottom: 8 })
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })

              // 学科和错误次数
              Row() {
                Column() {
                  Text(question.subject)
                    .fontSize(12)
                    .fontColor('#666')
                }
                .layoutWeight(1)

                if (question.wrong_times) {
                  Text(`错误 ${question.wrong_times} 次`)
                    .fontSize(12)
                    .fontColor('#FF4500')
                }
              }
            }
            .padding(12)
            .width('100%')
            .borderRadius(8)
            .backgroundColor('#FFF')
            .onClick(() => {
              router.pushUrl({
                url: 'pages/questionDetail',
                params: {
                  id: question.id.toString(),
                  collectionId: this.collectionId
                }
              });
            })
          }
        }, (question: QuestionItem) => question.id.toString())

        // 加载更多按钮
        if (this.currentPage < this.totalPages && this.questions.length > 0) {
          ListItem() {
            Button('加载更多')
              .onClick(() => this.loadMore())
              .width('100%')
              .type(ButtonType.Normal)
          }
        }
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }
}