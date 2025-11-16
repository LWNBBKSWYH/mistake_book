import router from '@ohos.router';
import relationalStore from '@ohos.data.relationalStore';
import { ValuesBucket } from '@ohos.data.ValuesBucket';
import PromptAction from '@ohos.promptAction';
import { DB_NAME } from '../entryability/EntryAbility';
import { textRecognition } from '@kit.CoreVisionKit';
import { image } from '@kit.ImageKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { fileIo } from '@kit.CoreFileKit';
import { photoAccessHelper } from '@kit.MediaLibraryKit';
import promptAction from '@ohos.promptAction';

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
interface RouterParams {
  collectionId?: string ; // 根据实际情况调整类型
  // 其他可能的参数...
}
@Entry
@Component
struct CreateQuestion {
  @State formData: QuestionItem = {
    collection_id: 0,
    subject: '',
    question_description: '',
    question_answer: '',
    question_type: '选择题',
    difficulty: 1,
    wrong_times: 1,
    islike: 0
  };

  @State showTypePicker: boolean = false;
  @State showDifficultyPicker: boolean = false;
  @State isLoading: boolean = false;

  private rdbStore!: relationalStore.RdbStore;
  private questionTypes: string[] = ['选择题', '判断题', '主观题'];
  private difficultyLevels: number[] = [1, 2, 3, 4, 5];

  async aboutToAppear() {
    const params = router.getParams() as RouterParams;
    this.formData.collection_id = parseInt(params.collectionId || '0');
    console.log(`接收到id=${this.formData.collection_id}`)
    try {
      await this.initDatabase();
    } catch (err) {
      console.error('数据库初始化失败:', err);
      PromptAction.showToast({ message: '数据库初始化失败' });
    }
  }

  // 初始化数据库连接
  private async initDatabase() {
    this.rdbStore = await relationalStore.getRdbStore(
      getContext(this),
      {
        name: DB_NAME,
        securityLevel: relationalStore.SecurityLevel.S1
      }
    );
  }

  // 提交问题到数据库
  private async submitQuestion() {
    // 表单验证
    if (!this.formData.question_description.trim()) {
      PromptAction.showToast({ message: '题目描述不能为空' });
      return;
    }

    if (!this.formData.question_answer.trim()) {
      PromptAction.showToast({ message: '题目答案不能为空' });
      return;
    }

    if (!this.formData.subject.trim()) {
      PromptAction.showToast({ message: '请选择学科' });
      return;
    }

    this.isLoading = true;

    try {
      const valueBucket: ValuesBucket = {
        'collection_id': this.formData.collection_id,
        'subject': this.formData.subject,
        'question_description': this.formData.question_description,
        'question_answer': this.formData.question_answer,
        'question_type': this.formData.question_type,
        'difficulty': this.formData.difficulty || 1, // 提供默认难度1
        'wrong_times': this.formData.wrong_times || 1, // 提供默认错误次数1
        'islike': this.formData.islike || 0 // 提供默认不喜欢状态0
      };

      // 添加可选字段
      if (this.formData.options) {
        valueBucket['options'] = this.formData.options;
      }

      if (this.formData.analysis) {
        valueBucket['analysis'] = this.formData.analysis;
      }

      if (this.formData.tags) {
        valueBucket['tags'] = this.formData.tags;
      }
      console.log('准备插入的数据:', JSON.stringify(valueBucket));
      // 插入数据
      const newRowId=await this.rdbStore.insert('mistakes', valueBucket);
      console.log('插入成功，新记录ID:', newRowId)
      PromptAction.showToast({ message: '错题添加成功' });
      await this.rdbStore.executeSql(
        `UPDATE mistakes_collections
     SET question_count = question_count + 1
     WHERE id = ?`,
        [this.formData.collection_id]
      );
      router.back();
    } catch (err) {
      console.error('添加错题失败:', err);
      PromptAction.showToast({ message: '添加失败，请重试' });
    } finally {
      this.isLoading = false;
    }
  }

  // 返回上一页
  private returnToPrevious() {
    router.back();
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Button('取消')
          .fontSize(16)
          .fontColor('#0A59F7')
          .backgroundColor(Color.Transparent)
          .onClick(() => this.returnToPrevious())

        Text('新建错题')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)

        Button('完成')
          .fontSize(16)
          .fontColor('#ff4b5872')
          .backgroundColor(Color.Transparent)
          .onClick(() => this.submitQuestion())
      }
      .width('100%')
      .padding(12)
      .border({
        width: 1,          // 所有边宽度
        color: '#F1F3F5',  // 所有边颜色
        style: BorderStyle.Solid  // 边框样式
      })

      // 表单内容
      Scroll() {
        Column({ space: 16 }) {
          // 题目描述
          Row(){
            Text('题目描述')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .textAlign(TextAlign.Start)
              .margin({
                right:5
              })
            Button('拍照输入')
              .fontSize(16)
              .fontColor(Color.White)
              .fontWeight(FontWeight.Medium)
              .backgroundColor('#0A59F7')
              .borderRadius(20)
              .padding(5)
              .onClick(() => {
                this.startRecognition('描述');
              })
          }
          .width('100%')
          .justifyContent(FlexAlign.Start)

          TextInput({ placeholder: '请输入题目描述...', text: this.formData.question_description })
            .onChange((value: string) => {
              this.formData.question_description = value;
            })
            .height(120)
            .width('100%')
            .backgroundColor('#FFFFFF')
            .borderRadius(8)
            .padding(12)

          // 题目答案
          Row(){
            Text('题目答案')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .textAlign(TextAlign.Start)
              .margin({
                right:5
              })
            Button('拍照输入')
              .fontSize(16)
              .fontColor(Color.White)
              .fontWeight(FontWeight.Medium)
              .backgroundColor('#0A59F7')
              .borderRadius(20)
              .padding(5)
              .onClick(() => {
                this.startRecognition('答案');
              })
          }
          .width('100%')
          .justifyContent(FlexAlign.Start)

          TextInput({ placeholder: '请输入题目答案...', text: this.formData.question_answer })
            .onChange((value: string) => {
              this.formData.question_answer = value;
            })
            .height(120)
            .width('100%')
            .backgroundColor('#FFFFFF')
            .borderRadius(8)
            .padding(12)

          // 学科
          Text('学科')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .textAlign(TextAlign.Start)

          TextInput({ placeholder: '请输入学科，如数学、物理等', text: this.formData.subject })
            .onChange((value: string) => {
              this.formData.subject = value;
            })
            .height(48)
            .width('100%')
            .backgroundColor('#FFFFFF')
            .borderRadius(8)
            .padding(12)

          // 题目类型选择
          Text('题目类型')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .textAlign(TextAlign.Start)

          Row() {
            Text(this.formData.question_type)
              .fontSize(16)
              .layoutWeight(1)

            Image($r('app.media.icon_question'))
              .width(20)
              .height(20)
          }
          .height(48)
          .width('100%')
          .padding(12)
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .onClick(() => {
            this.showTypePicker = true;
          })

          // 难度选择
          Text('难度')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .textAlign(TextAlign.Start)

          Row() {
            Text(this.getDifficultyText(this.formData.difficulty || 1))
              .fontSize(16)
              .layoutWeight(1)

            Image($r('app.media.icon_question'))
              .width(20)
              .height(20)
          }
          .height(48)
          .width('100%')
          .padding(12)
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .onClick(() => {
            this.showDifficultyPicker = true;
          })

          // 解析和标签（可选）
          Row(){
            Text('题目解析（可选）')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .textAlign(TextAlign.Start)
              .margin({
                right:5
              })
            Button('拍照输入')
              .fontSize(16)
              .fontColor(Color.White)
              .fontWeight(FontWeight.Medium)
              .backgroundColor('#0A59F7')
              .borderRadius(20)
              .padding(5)
              .onClick(() => {
                this.startRecognition('解析');
              })
          }
          .width('100%')
          .justifyContent(FlexAlign.Start)

          TextInput({ placeholder: '请输入题目解析...', text: this.formData.analysis || '' })
            .onChange((value: string) => {
              this.formData.analysis = value;
            })
            .height(80)
            .width('100%')
            .backgroundColor('#FFFFFF')
            .borderRadius(8)
            .padding(12)

          Text('标签（可选，多个标签用逗号分隔）')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .width('100%')
            .textAlign(TextAlign.Start)

          TextInput({ placeholder: '例如：三角函数,几何,易错题', text: this.formData.tags || '' })
            .onChange((value: string) => {
              this.formData.tags = value;
            })
            .height(48)
            .width('100%')
            .backgroundColor('#FFFFFF')
            .borderRadius(8)
            .padding(12)
        }
        .width('100%')
        .padding(16)
      }
      .layoutWeight(1)

      // 题目类型选择器
      if (this.showTypePicker) {
        Column() {
          Text('选择题目类型')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 16 })

          ForEach(this.questionTypes, (type: string) => {
            Row() {
              Text(type)
                .fontSize(16)
                .layoutWeight(1)

              if (this.formData.question_type === type) {
                Image($r('app.media.icon_question'))
                  .width(20)
                  .height(20)
              }
            }
            .height(48)
            .width('100%')
            .padding(12)
            .onClick(() => {
              this.formData.question_type = type;
              this.showTypePicker = false;
            })
          })
        }
        .width('90%')
        .backgroundColor('#FFFFFF')
        .borderRadius(16)
        .alignItems(HorizontalAlign.Center)
        .position({ x: '5%', y: '20%' })
        .zIndex(999)
      }

      // 难度选择器
      if (this.showDifficultyPicker) {
        Column() {
          Text('选择题目难度')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 16 })

          ForEach(this.difficultyLevels, (level: number) => {
            Row() {
              Text(this.getDifficultyText(level))
                .fontSize(16)
                .layoutWeight(1)

              if (this.formData.difficulty === level) {
                Image($r('app.media.icon_question'))
                  .width(20)
                  .height(20)
              }
            }
            .height(48)
            .width('100%')
            .padding(12)
            .onClick(() => {
              this.formData.difficulty = level;
              this.showDifficultyPicker = false;
            })
          })
        }
        .width('90%')
        .backgroundColor('#FFFFFF')
        .borderRadius(16)
        .alignItems(HorizontalAlign.Center)
        .position({ x: '5%', y: '20%' })
        .zIndex(999)
      }

      // 加载中遮罩
      if (this.isLoading) {
        Column() {
          LoadingProgress()
            .width(50)
            .height(50)
            .color('#0A59F7')
        }
        .width('100%')
        .height('100%')
        .backgroundColor('#80000000')
        .position({ x: 0, y: 0 })
        .zIndex(9999)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F7FA')
  }
  // 开始识别函数
  async startRecognition(textType: string) {
    this.isLoading = true;
    //this.recognitionResult = '正在识别中...';

    try {
      // 1. 初始化OCR服务
      const initResult = await textRecognition.init();
      if (!initResult) {
        promptAction.showToast({
          message: 'OCR服务初始化失败',
          duration: 2000
        });
        this.isLoading = false;
        return;
      }

      hilog.info(0x0000, 'OCRApp', 'OCR服务初始化成功');

      // 2. 选择图片
      const pixelMap = await this.selectImage();
      if (!pixelMap) {
        promptAction.showToast({
          message: '图片选择失败或未选择图片',
          duration: 2000
        });
        this.isLoading = false;
        await textRecognition.release();
        return;
      }

      // 3. 准备识别参数
      let visionInfo: textRecognition.VisionInfo = {
        pixelMap: pixelMap
      };

      let configuration: textRecognition.TextRecognitionConfiguration = {
        isDirectionDetectionSupported: false // 关闭朝向检测以提升性能
      };

      // 4. 执行文字识别
      const recognitionResult = await textRecognition.recognizeText(visionInfo, configuration);

      // 5. 处理识别结果
      if (recognitionResult && recognitionResult.value) {
        if(textType=='描述') {
          this.formData.question_description = recognitionResult.value;
        }
        if(textType=='答案') {
          this.formData.question_answer = recognitionResult.value;
        }
        if(textType=='解析') {
          this.formData.analysis = recognitionResult.value;
        }
        hilog.info(0x0000, 'OCRApp', `识别成功: ${recognitionResult.value}`);
      } else {
        promptAction.showToast({
          message: '未识别到文字',
          duration: 2000
        });
      }

      // 6. 释放资源
      pixelMap.release();

    } catch (error) {
      const err = error as BusinessError;
      hilog.error(0x0000, 'OCRApp', `识别失败: Code: ${err.code}, Message: ${err.message}`);
      this.formData.question_description = `识别失败: ${err.message}`;
    } finally {
      // 释放OCR服务
      try {
        await textRecognition.release();
        hilog.info(0x0000, 'OCRApp', 'OCR服务已释放');
      } catch (error) {
        const err = error as BusinessError;
        hilog.error(0x0000, 'OCRApp', `释放服务失败: ${err.message}`);
      }

      this.isLoading = false;
    }
  }
  // 选择图片函数
  async selectImage(): Promise<image.PixelMap | undefined> {
    try {
      let photoPicker: photoAccessHelper.PhotoViewPicker = new photoAccessHelper.PhotoViewPicker();

      const selectResult = await photoPicker.select({
        MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
        maxSelectNumber: 1
      });

      if (!selectResult.photoUris || selectResult.photoUris.length === 0) {
        hilog.error(0x0000, 'OCRApp', '未选择图片');
        return undefined;
      }

      const uri = selectResult.photoUris[0];
      hilog.info(0x0000, 'OCRApp', `选择的图片URI: ${uri}`);

      // 打开文件并创建ImageSource
      const file = await fileIo.open(uri, fileIo.OpenMode.READ_ONLY);
      const imageSource = image.createImageSource(file.fd);

      // 创建PixelMap
      const pixelMap = await imageSource.createPixelMap();

      // 释放资源
      await fileIo.close(file);
      imageSource.release();

      return pixelMap;

    } catch (error) {
      const err = error as BusinessError;
      hilog.error(0x0000, 'OCRApp', `选择图片失败: Code: ${err.code}, Message: ${err.message}`);
      return undefined;
    }
  }
  // 获取难度文本
  private getDifficultyText(level: number): string {
    const stars = '★'.repeat(level);
    return `${stars} (${level}级)`;
  }
}