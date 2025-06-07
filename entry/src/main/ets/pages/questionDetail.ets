import {RouterParams,ApiResponse} from '../utils/ALL_Interface'
import  router  from '@ohos.router';
import relationalStore from '@ohos.data.relationalStore';
import { ValuesBucket } from '@ohos.data.ValuesBucket';
import PromptAction from '@ohos.promptAction';
import { DB_NAME } from '../entryability/EntryAbility';
import {apimistakes} from '../utils/net_config'
import { ColumnModifier } from '@kit.ArkUI';

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
struct QuestionDetail {
  @State question: QuestionItem = {} as QuestionItem;
  @State isLoading: boolean = false;
  @State question_id:number=0;
  @State searchKeyword: string = '';
  private rdbStore!: relationalStore.RdbStore;
  async onPageShow(): Promise<void> {
    await this.initDatabase();
    await this.fetchQuestions();
  }
  async aboutToAppear() {
    const params = router.getParams() as RouterParams;
    this.question_id = parseInt(params.questionId || '0');
    console.log(`接收到id=${this.question_id}`)
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

  // 获取错题列表
  private async fetchQuestions() {
    console.log("开始获取错题")
    console.log(`查询的错题id，collectionId: ${this.question_id}`);
    if (!this.rdbStore) {
      throw new Error('数据库未初始化');
    }
    this.isLoading = true;
    try {
      const predicates = new relationalStore.RdbPredicates('mistakes');
      predicates.equalTo('id', this.question_id);

      // 如果有搜索关键词
      if (this.searchKeyword) {
        predicates.contains('question_description', this.searchKeyword);
      }

      const columns = [
        'id', 'collection_id', 'subject', 'question_description',
        'question_type', 'question_answer', // 添加这个字段
        'difficulty', 'wrong_times', 'created_at','islike','analysis'
      ];

      const resultSet = await this.rdbStore.query(predicates, columns);
      console.log("result"+String(resultSet))
      while (resultSet.goToNextRow()) {
        this.question.question_description=resultSet.getString(resultSet.getColumnIndex('question_description'))
        this.question.islike=resultSet.getLong(resultSet.getColumnIndex('islike'))
        this.question.subject = resultSet.getString(resultSet.getColumnIndex('subject'))
        this.question.question_description= resultSet.getString(resultSet.getColumnIndex('question_description'))
        this.question.question_type= resultSet.getString(resultSet.getColumnIndex('question_type'))
        this.question.analysis= resultSet.getString(resultSet.getColumnIndex('analysis'))
        this.question.question_answer= resultSet.getString(resultSet.getColumnIndex('question_answer'))
      }
      console.log(
        `ID: ${this.question.id}, ` +
          `描述: ${this.question.question_description}, ` +
          `是否喜欢: ${this.question.islike}`
      );
      resultSet.close();
    } catch (err) {
      console.error('获取错题列表失败:', err);
      PromptAction.showToast({ message: '获取列表失败' });
    } finally {
      this.isLoading = false;
    }
  }
  private async getQuestionById(id: number): Promise<QuestionItem | null> {
    if (!this.rdbStore) {
      console.error('数据库未初始化');
      return null;
    }

    try {
      const predicates = new relationalStore.RdbPredicates('mistakes');
      predicates.equalTo('id', id);

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

  build() {
    Column() {
      if (this.isLoading) {
        LoadingProgress()
          .width(50)
          .height(50)
      } else {
        Row(){
          Image($r('app.media.ic_public_arrow_left_filled'))
            .onClick(()=>{
              router.back()
            })
            .width('10%')
          Blank()
            .width('80%')
          if(this.question.islike){
            Image($r('app.media.ic_public_highlightsed'))
              .height(25)
              .width(25)
              .fillColor('#FFA500')
              .onClick(async () => {
                if (!this.rdbStore) return;

                try {
                  await this.rdbStore.executeSql(
                    `UPDATE mistakes SET islike = 0 WHERE id = ?`,
                    [this.question_id]
                  );
                  console.log('更新成功，id:', this.question_id);
                  this.question.islike=0
                  const updatedQuestion = await this.getQuestionById(this.question_id);
                  if (updatedQuestion) {
                    console.log('更新后的问题数据:', JSON.stringify(updatedQuestion, null, 2));
                  } else {
                    console.warn('未找到更新后的问题数据');
                  }
                } catch (err) {
                  console.error('更新失败:', err);
                }
              })
          }else{
            Image($r('app.media.ic_public_highlights'))
              .height(25)
              .width(25)
              .onClick(async () => {
                if (!this.rdbStore) return;

                try {
                  await this.rdbStore.executeSql(
                    `UPDATE mistakes SET islike = 1 WHERE id = ?`,
                    [this.question_id]
                  );
                  console.log('更新成功，id:', this.question_id);
                  this.question.islike=1
                  const updatedQuestion = await this.getQuestionById(this.question_id);
                  if (updatedQuestion) {
                    console.log('更新后的问题数据:', JSON.stringify(updatedQuestion, null, 2));
                  } else {
                    console.warn('未找到更新后的问题数据');
                  }
                } catch (err) {
                  console.error('更新失败:', err);
                }
              })
          }
        }
        .backgroundColor('#5A8BFF')
        .height("5%")
        .width("100%")
        // 题目详情展示
        Row() {
          Text(this.question.question_description)
            .fontSize(18)
            .margin({ bottom: 16 })

        }
        .padding(10)
        .justifyContent(FlexAlign.Start)
        .width("100%")
        // 选择题选项展示
        if (this.question.question_type === '选择题' && this.question.options) {
          Column() {
            Text(this.question.options)
              .fontSize(18)
              .margin({ bottom: 16 })
          }
        }
        // 答案解析
          Column() {
            Text(`解析:`)
              .fontSize(14)
              .fontColor('#FFA500')
              .margin(16)
              .fontWeight(FontWeight.Bold)
            if (this.question.analysis) {
              Text(`分析: ${this.question.analysis}`)
                .fontSize(14)
                .margin(16)
            }
            if (this.question.question_answer) {
              Text(`正解: ${this.question.question_answer}`)
                .fontSize(14)
                .margin(16)
            }

          }
          .width('100%')
          .borderRadius(10)
          .borderColor('#FFA500')
          .borderWidth(2)
          .alignItems(HorizontalAlign.Start)
      }
    }
    //.padding(16)
    .width('100%')
    .height('100%')
  }
}