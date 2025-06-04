import router from '@ohos.router';
import PromptAction from '@ohos.promptAction';
import relationalStore from '@ohos.data.relationalStore';
import { DB_NAME } from '../entryability/EntryAbility';
import curves from '@ohos.curves';

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
  name: string;
  description: string;
  question_count: number;
}

interface RouterParams {
  id?: string;
}

@Entry
@Component
struct CollectionDetail {
  @State swipedQuestionId: number | null = null; // 当前滑动的题目ID
  @State swipeOffsetX: number = 0; // 滑动偏移量
  @State swipeProgress: number = 0; // 滑动进度（0-1）
  @State isSwiping: boolean = false; // 是否正在滑动

  @State collectionId: string = '';
  @State questions: QuestionItem[] = [];
  @State isLoading: boolean = false;
  @State searchKeyword: string = '';
  @State currentPage: number = 1;
  @State totalPages: number = 1;
  @State collectionInfo: CollectionInfo = {
    name: '',
    description: '',
    question_count: 0
  };
  @State showSearchResult: boolean = false;
  @State searchResultCount: number = 0;
  @State showDeleteDialog: boolean = false;
  @State deletingQuestionId: number | null = null;
  @State isBatchMode: boolean = false; // 是否处于批量模式
  @State selectedQuestions: number[] = []; // 选中的题目ID数组
  private rdbStore: relationalStore.RdbStore | null = null;
  searchController: SearchController = new SearchController();
  private pageSize: number = 10;


  async onPageShow(): Promise<void> {
    await this.initDatabase();
    await this.fetchCollectionInfo();
    await this.fetchQuestions();
  }

  async aboutToAppear() {
    const params = router.getParams() as RouterParams;
    this.collectionId = params?.id?.toString() || '';
    if (!this.collectionId) {
      PromptAction.showToast({ message: '缺少错题集ID参数' });
      return;
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

  // 获取错题集信息
  private async fetchCollectionInfo() {
    try {
      if (!this.rdbStore) {
        throw new Error('数据库未初始化');
      }

      const predicates = new relationalStore.RdbPredicates('mistakes_collections');
      predicates.equalTo('id', parseInt(this.collectionId));

      const resultSet = await this.rdbStore.query(
        predicates,
        ['id', 'name', 'description', 'question_count']
      );

      if (resultSet.rowCount > 0) {
        if (resultSet.goToFirstRow()) {
          this.collectionInfo.name = resultSet.getString(resultSet.getColumnIndex('name')) || '';
          this.collectionInfo.description = resultSet.getString(resultSet.getColumnIndex('description')) || '';
          this.collectionInfo.question_count = resultSet.getLong(resultSet.getColumnIndex('question_count'));
        }
      } else {
        PromptAction.showToast({ message: '未找到该错题集' });
        router.back();
        return;
      }
      resultSet.close();

      this.totalPages = Math.ceil(this.collectionInfo.question_count / this.pageSize);
    } catch (err) {
      console.error('获取错题集信息失败:', err);
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

      if (this.searchKeyword) {
        predicates.contains('question_description', this.searchKeyword);
      }

      predicates.offsetAs((this.currentPage - 1) * this.pageSize);
      predicates.limitAs(this.pageSize);

      const columns = [
        'id', 'collection_id', 'subject', 'question_description',
        'question_type', 'question_answer', 'difficulty',
        'wrong_times', 'created_at', 'islike'
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
          created_at: resultSet.getString(resultSet.getColumnIndex('created_at')),
          question_answer: resultSet.getString(resultSet.getColumnIndex('question_answer')),
          islike: resultSet.getLong(resultSet.getColumnIndex('islike'))
        });
      }
      resultSet.close();

      // 更新搜索结果计数
      this.searchResultCount = this.questions.length;
      if (this.searchKeyword) {
        this.showSearchResult = true;
        setTimeout(() => { this.showSearchResult = false; }, 2000);
      }
    } catch (err) {
      console.error('获取错题列表失败:', err);
      PromptAction.showToast({ message: '获取列表失败' });
    } finally {
      this.isLoading = false;
    }
  }

  // 搜索功能
  private onSearch() {
    this.currentPage = 1;
    this.fetchQuestions();

    // 显示搜索结果提示
    if (this.searchKeyword.trim()) {
      this.showSearchResult = true;
      setTimeout(() => {
        this.showSearchResult = false;
      }, 3000);
    }
  }

  private clearSearch() {
    this.searchKeyword = '';
    this.onSearch();
  }

  // 加载更多
  private loadMore() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchQuestions();
    }
  }

  // 更新错题集题目计数
  private async updateCollectionCount() {
    if (!this.rdbStore) return;

    try {
      // 获取当前错题数量
      const countPredicates = new relationalStore.RdbPredicates('mistakes');
      countPredicates.equalTo('collection_id', parseInt(this.collectionId));

      const columns = ['COUNT(*) AS count'];
      const resultSet = await this.rdbStore.query(countPredicates, columns);

      let count = 0;
      if (resultSet.goToFirstRow()) {
        count = resultSet.getLong(resultSet.getColumnIndex('count'));
      }
      resultSet.close();

      // 更新错题集记录
      const predicates = new relationalStore.RdbPredicates('mistakes_collections');
      predicates.equalTo('id', parseInt(this.collectionId));

      const valuesBucket: relationalStore.ValuesBucket = {
        'question_count': count,
        'updated_at': new Date().toISOString()
      };

      await this.rdbStore.update(valuesBucket, predicates);
    } catch (err) {
      console.error('更新错题集计数失败:', err);
    }
  }

  // 处理滑动手势
  private handleSwipeStart(questionId: number) {
    // 如果有其他题目被滑动，先复位
    if (this.swipedQuestionId !== null && this.swipedQuestionId !== questionId) {
      this.resetSwipe();
    }
    this.swipedQuestionId = questionId;
    this.isSwiping = true;
  }

  private handleSwipeUpdate(offsetX: number) {
    if (this.swipedQuestionId === null) return;

    // 限制最大滑动距离为80vp
    const maxOffset = -80;
    this.swipeOffsetX = Math.max(maxOffset, Math.min(0, offsetX));

    // 计算滑动进度（0-1）
    this.swipeProgress = Math.min(1, Math.abs(this.swipeOffsetX) / Math.abs(maxOffset));
  }

  private handleSwipeEnd() {
    this.isSwiping = false;
    if (this.swipedQuestionId === null) return;

    // 如果滑动超过80vp，直接触发删除
    if (this.swipeOffsetX <= -80) {
      this.deletingQuestionId = this.swipedQuestionId;
    } else {
      // 否则复位
      this.resetSwipe();
    }
  }

  // 复位滑动状态
  private resetSwipe() {
    this.swipeOffsetX = 0;
    this.swipeProgress = 0;
    this.swipedQuestionId = null;
  }

  // 删除错题
  private async deleteQuestion(questionId: number) {
    if (!this.rdbStore) return;

    try {
      const predicates = new relationalStore.RdbPredicates('mistakes');
      predicates.equalTo('id', questionId);

      await this.rdbStore.delete(predicates);

      // 更新错题集题目计数
      await this.updateCollectionCount();

      // 从列表中移除该错题
      this.questions = this.questions.filter(q => q.id !== questionId);

      PromptAction.showToast({ message: '删除成功' });
      await this.fetchCollectionInfo(); // 更新错题集信息
    } catch (err) {
      console.error('删除错题失败:', err);
      PromptAction.showToast({ message: '删除失败' });
    } finally {
      this.showDeleteDialog = false;
      this.deletingQuestionId = null;
      this.resetSwipe(); // 复位滑动状态
    }
  }
  // 搜索结果提示
  @Builder
  private buildSearchResultToast() {
    if (this.showSearchResult) {
      Column() {
        Text(`找到 ${this.searchResultCount} 个匹配的题目`)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .backgroundColor('#5A8BFF')
          .borderRadius(20)
      }
      .position({ x: '25%', y: '1%' })
      .zIndex(999)
      .alignItems(HorizontalAlign.Center)
      .width('100%')
    }
  }

  // 删除确认对话框
  @Builder
  private buildDeleteDialog() {
    if (this.showDeleteDialog) { // 确保这里检查 showDeleteDialog
      Column() {
        Column({ space: 16 }) {
          Text('确认删除')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')

          Text('确定要删除这道错题吗？此操作不可恢复。')
            .fontSize(16)
            .fontColor('#666666')
            .textAlign(TextAlign.Center)

          Row({ space: 12 }) {
            Button('取消')
              .width('40%')
              .height(40)
              .fontSize(16)
              .backgroundColor('#F5F7FA')
              .fontColor('#666666')
              .onClick(() => {
                this.showDeleteDialog = false;
                this.deletingQuestionId = null;
                this.resetSwipe(); // 复位滑动状态
              })

            Button('删除')
              .width('40%')
              .height(40)
              .fontSize(16)
              .backgroundColor('#FF4D4F')
              .fontColor('#FFFFFF')
              .onClick(() => {
                if (this.deletingQuestionId) {
                  this.deleteQuestion(this.deletingQuestionId);
                }
              })
          }
          .margin({ top: 16 })
        }
        .padding(24)
        .backgroundColor('#FFFFFF')
        .borderRadius(16)
        .width('80%')
      }
      .position({ x: 0, y: 0 })
      .zIndex(997) // 确保 zIndex 足够高
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .width('100%')
      .height('100%')
      .backgroundColor('#80000000')
    }
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        // 返回按钮
        Image($r('app.media.back'))
          .width(24)
          .height(24)
          .margin({ left: 12, right: 12 })
          .onClick(() => {
            router.back();
          })

        Text(this.collectionInfo.name)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
      }
      .width('100%')
      .height(56)
      .backgroundColor('#5A8BFF')
      .alignItems(VerticalAlign.Center)

      // 搜索栏
      Row() {
        Search({
          value: this.searchKeyword,
          placeholder: '搜索题目内容...',
          controller: this.searchController
        })
          .placeholderColor('#999999')
          .textFont({ size: 14 })
          .onChange((value: string) => {
            this.searchKeyword = value;
            this.onSearch();
          })
          .onSubmit(() => this.onSearch())
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#F5F7FA')
          .borderRadius(20)

        if (this.searchKeyword) {
          Button($r('app.media.ic_public_delete'))
            .width(40)
            .height(40)
            .margin({ left: 8 })
            .backgroundColor('#00000000')
            .onClick(() => this.clearSearch())
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16 })
      .margin({ bottom: 12 })

      // 主要内容区域
      Column() {
        // 错题集信息卡片
        Column() {
          Text(this.collectionInfo.description)
            .fontSize(14)
            .fontColor('#666666')
            .margin({ bottom: 6 })
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
          Row() {
            Text(`共 ${this.collectionInfo.question_count} 题`)
              .fontSize(12)
              .fontColor('#999999')
            Blank()
            Button('添加错题')
              .width(100)
              .height(32)
              .fontSize(12)
              .type(ButtonType.Normal)
              .backgroundColor('#5A8BFF')
              .onClick(() => {
                router.pushUrl({
                  url: 'pages/createQuestion',
                  params: { collectionId: this.collectionId }
                });
              })
            Blank()
            Button('批量删除错题')
              .width(100)
              .height(32)
              .fontSize(12)
              .type(ButtonType.Normal)
              .backgroundColor('#5A8BFF')
              .onClick(() => {
                //todo 批量删除错题选择

              })
          }
          .width('100%')
          .margin({ top: 8 })
        }
        .padding(16)
        .width('100%')
        .backgroundColor('#FFFFFF')
        .borderRadius(12)
        .margin({ top: 12, bottom: 12 })
        .shadow({ radius: 4, color: '#10000000', offsetY: 2 })
        // 搜索结果提示
        this.buildSearchResultToast();
        //删除警告弹窗
        this.buildDeleteDialog();
        // 错题列表
        List({ space: 12 }) {
          // 空状态提示
          if (this.questions.length === 0 && !this.isLoading) {
            ListItem() {
              Column() {
                Image($r('app.media.NoQuestion'))
                  .width(120)
                  .height(120)
                  .margin({ bottom: 16 })

                Text(this.searchKeyword ? '没有找到匹配的题目' : '暂无错题记录')
                  .fontSize(16)
                  .fontColor('#666666')
                  .margin({ bottom: 8 })

                if (!this.searchKeyword) {
                  Button('添加第一条错题')
                    .width(180)
                    .height(40)
                    .fontSize(14)
                    .type(ButtonType.Capsule)
                    .backgroundColor('#5A8BFF')
                    .onClick(() => {
                      router.pushUrl({
                        url: 'pages/createQuestion',
                        params: { collectionId: this.collectionId }
                      });
                    })
                }
              }
              .width('100%')
              .height(300)
              .justifyContent(FlexAlign.Center)
              .alignItems(HorizontalAlign.Center)
            }
          }

          // 错题列表项
          ForEach(this.questions, (question: QuestionItem) => {
            ListItem() {
              // 使用Stack布局实现滑动效果
              Stack() {
                // 删除按钮背景（滑动时显示）
                Row() {
                  Blank()
                  Image($r('app.media.ic_public_delete'))
                    .width(24)
                    .height(24)
                    .margin({ right: 24 })
                    .onClick(() => {
                      this.deletingQuestionId = question.id;
                      this.showDeleteDialog = true;
                      this.swipedQuestionId = null;
                      this.swipeOffsetX = 0;
                    })

                }
                .width('100%')
                .height('100%')
                .backgroundColor('#FF4D4F')
                .justifyContent(FlexAlign.End)
                .alignItems(VerticalAlign.Center)
                .borderRadius(12) // 添加圆角，与题目卡片一致
                .clip(true) // 确保圆角部分被正确裁剪

                // 题目内容卡片
                Row() {
                  // 题目内容...
                  Column() {
                    // 题目类型和难度
                    Row() {
                      Text(question.question_type)
                        .fontSize(12)
                        .fontColor('#FFFFFF')
                        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                        .backgroundColor('#5A8BFF')
                        .borderRadius(10)

                      Blank()

                      if (question.difficulty) {
                        Text(`难度: ${'★'.repeat(question.difficulty)}`)
                          .fontSize(12)
                          .fontColor('#FFA500')
                      }
                    }
                    .width('100%')
                    .margin({ bottom: 8 })

                    // 题目内容
                    Text(question.question_description)
                      .fontSize(16)
                      .fontColor('#333333')
                      .margin({ bottom: 12 })
                      .maxLines(2)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })

                    // 底部信息
                    Row() {
                      Text(question.subject || '未分类')
                        .fontSize(12)
                        .fontColor('#999999')

                      Blank()

                      if (question.wrong_times) {
                        Text(`错误 ${question.wrong_times} 次`)
                          .fontSize(12)
                          .fontColor('#FF4500')
                      }
                    }
                    .width('100%')
                  }
                  .padding(16)
                  .width('100%')
                }
                .width('100%')
                .height('100%')
                .backgroundColor('#FFFFFF')
                .borderRadius(12)
                // 添加滑动效果
                .translate({
                  x: this.swipedQuestionId === question.id ? this.swipeOffsetX : 0
                })
                .animation({
                  duration: this.isSwiping ? 0 : 300,
                })
                // 添加滑动手势
                .gesture(
                  PanGesture({ direction: PanDirection.Horizontal })
                    .onActionStart(() => {
                      this.handleSwipeStart(question.id);
                    })
                    .onActionUpdate((event: GestureEvent) => {
                      this.handleSwipeUpdate(event.offsetX);
                    })
                    .onActionEnd(() => {
                      this.handleSwipeEnd();
                    })
                    .onActionCancel(() => {
                      this.resetSwipe();
                    })
                )
                .onClick(() => {
                  // 如果没有滑动或者已经复位，则进入详情
                  if (this.swipedQuestionId !== question.id || this.swipeOffsetX === 0) {
                    router.pushUrl({
                      url: 'pages/questionDetail',
                      params: { questionId: question.id.toString() }
                    });
                  }
                })
              }
              .height(120)
              .clip(true) // 确保超出部分被裁剪
              .borderRadius(12) // 添加外层圆角
            }
          }, (question: QuestionItem) => question.id.toString())

          // 加载更多
          if (this.currentPage < this.totalPages && this.questions.length > 0) {
            ListItem() {
              Button('加载更多')
                .width('100%')
                .height(40)
                .fontSize(14)
                .type(ButtonType.Normal)
                .backgroundColor('#F5F7FA')
                .onClick(() => this.loadMore())
            }
          }
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      }
      .layoutWeight(1)
      .width('100%')
      .backgroundColor('#F5F7FA')
    }
    .width('100%')
    .height('100%')
  }
}