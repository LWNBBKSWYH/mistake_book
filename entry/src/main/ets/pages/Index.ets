import { curves, promptAction, router } from '@kit.ArkUI';
import { BusinessError } from '@kit.BasicServicesKit';

@Observed
export class question {
  title: string;          // 题目
  wrongAnswer: string | null;    // 错解
  analysis: string | null;       // 分析
  warning: string | null;       // 警示
  correctAnswer: string | null;  // 正解
  collected: boolean;      // 控制图片状态

  constructor(
    title: string,
    wrongAnswer: string | null = null,
    analysis: string | null = null,
    warning: string | null = null,
    correctAnswer: string | null = null,
    collected: boolean = false
  ) {
    this.title = title;
    this.collected = collected;
    this.wrongAnswer = wrongAnswer;
    this.analysis = analysis;
    this.warning = warning;
    this.correctAnswer = correctAnswer;
  }
}
@Component
struct CustomListItem {
  @ObjectLink item: question;//建立与父组件传递的 item 对象的双向绑定
  @StorageLink('login') login: number=1;
  build() {
    ListItem() {
      Column(){
        Row(){
          if(this.item.collected){
            Image($r('app.media.ic_public_highlightsed'))
              .onClick(()=>{
                this.item.collected=false;//取消收藏
                //向服务器更新
                //if()服务器返回取消收藏成功
                try {
                  promptAction.showToast({
                    message: '取消收藏成功',
                    duration: 2000
                  });
                } catch (error) {
                  let message = (error as BusinessError).message
                  let code = (error as BusinessError).code
                  console.error(`showToast args error code is ${code}, message is ${message}`);
                };
              })
              .alignSelf(ItemAlign.End)
              .fillColor("#f7b500")
              .height(20)
                /*.borderWidth(2)
                .borderColor(Color.Black)*/
              .margin({
                left:15,
                right:10
              })
          }else{
            Image($r('app.media.ic_public_highlights'))
              .onClick(()=>{
                this.item.collected=true;//新增收藏
                //向服务器更新
                //if()服务器返回添加收藏成功
                try {
                  promptAction.showToast({
                    message: '添加收藏成功',
                    duration: 2000
                  });
                } catch (error) {
                  let message = (error as BusinessError).message
                  let code = (error as BusinessError).code
                  console.error(`showToast args error code is ${code}, message is ${message}`);
                };
              })
              .fillColor("#f7b500")
              .height(20)
              .margin({
                left:15,
                right:10
              })
          }
        }
        .justifyContent(FlexAlign.End)
        .width("100%")
        /*.borderWidth(2)
        .borderColor(Color.Black)*/
        Row(){
          Text('' + this.item.title)
            .height(80)
            .fontSize(20)
            .fontWeight(500)
            .textAlign(TextAlign.Center)
        }
        .onClick(()=>{
          this.login=0;//点击文本更改登录状态，仅测试使用
          console.log("<<"+JSON.stringify(this.item))
          router.pushUrl({
            url:'pages/question',//跳转问题详情
            params: this.item
          })
        })
      }
      .width("100%")
      .height("90%")
      /*.borderWidth(2)
      .borderColor(Color.Black)*/
    }
    /*.borderWidth(2)
    .borderColor(Color.Black)*/
    .height("20%")
    .backgroundColor('#FFFFFF')
    .borderRadius(10)
    .width("90%")
  }
}
@Entry
@Component
struct Index {
  @State SearchInput:string='';
  @State ChapterText: string = "选择章节"
  @State SectionText: string = "选择节数"
  @State index: number = 0
  @State space: number = 8
  @State arrowPosition: ArrowPosition = ArrowPosition.END
  @StorageLink('login') login: number = 1;
  @State arr: question[] = [new question("第一题",null,null,null,null,true),new question("第二题",null,null,null,null,false)]
  @State currentIndex: number = 0
  @State opacity3: number = 0//页面透明度
  aboutToAppear(): void {//渲染前确保透明度为0
    if(this.login){
      this.opacity3=1;
    }
    this.login=1;
  }
  build() {
    Column() {
      Navigation() {
        Column({space:15}){
          TextInput({placeholder:'点击搜索题目'})
            .backgroundColor("#DCDCDC")
            .borderRadius(10)
            .margin({
              left:5,
              right:5
            })
          Row(){
            Select([{ value: '函数与导数'},
              { value: '三角函数及解三角形'},
              { value: '数列'},
              { value: '概率与统计'},
              { value: '坐标系与参数方程'},
              { value: '不等式'},
              { value: '圆锥曲线'}])
              .backgroundColor(Color.White)
              .value(this.ChapterText)
              .font({ size: 16, weight: 500 })
              .fontColor(Color.Black)
              .selectedOptionFont({ size: 16, weight: 400 })
              .optionFont({ size: 16, weight: 400 })
              .space(this.space)
              .arrowPosition(this.arrowPosition)
              .menuAlign(MenuAlignType.START, { dx: 0, dy: 0 })
              .optionWidth(200)
              .optionHeight(300)
              .onSelect((index: number, text?: string | undefined) => {
                console.info('Select:' + index)
                this.index = index;
                if (text) {
                  this.ChapterText = text;
                }
              })
              .margin({
                right:5,
                left:5
              })
              .borderWidth(1)
              .borderColor("#0a59f7")
              .borderRadius(10)
            Select([{ value: '第一节'},
              { value: '第二节'},
              { value: '第三节'},
              { value: '第四节'},
              { value: '第五节'}])
              .backgroundColor(Color.White)
              .value(this.SectionText)
              .font({ size: 16, weight: 500 })
              .fontColor(Color.Black)
              .selectedOptionFont({ size: 16, weight: 400 })
              .optionFont({ size: 16, weight: 400 })
              .space(this.space)
              .arrowPosition(this.arrowPosition)
              .menuAlign(MenuAlignType.START, { dx: 0, dy: 0 })
              .optionWidth(200)
              .optionHeight(300)
              .onSelect((index: number, text?: string | undefined) => {
                console.info('Select:' + index)
                this.index = index;
                if (text) {
                  this.SectionText = text;
                }
              })
              .borderWidth(1)
              .borderColor("#0a59f7")
              .borderRadius(10)
          }
          .alignSelf(ItemAlign.Start)
        }
        .borderWidth(2)
        .borderColor("#0a59f7")
        .borderRadius(10)
        .padding(5)
        .backgroundColor(Color.White)
        .height('16%')
        .width('95%')

        List({ space: 12, initialIndex: 0 }) {
          ForEach(this.arr, (item: question) => {
            CustomListItem({
              item: item,
            })
          })
        }
        .height('100%')
        .width('100%')
        .margin({ top: 12, left: '10%' })
      }
      .toolbarConfiguration([
        {
          value: ("主页"),
          icon: $r("app.media.ic_public_home")
        },
        {
          value: ("收藏"),
          icon: $r("app.media.ic_public_highlights")
        }
      ])
      .hideToolBar(false)
    }
    .opacity(this.opacity3)
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  pageTransition() {//转场动画
    PageTransitionEnter({ duration: 500, curve: Curve.Ease })
      .translate({ x: 100.0 })
      .onEnter((type: RouteType, progress: number) => {
        if (type == RouteType.Push || type == RouteType.Pop) {
          this.opacity3 = progress
        }
      })
    PageTransitionExit({ duration: 500, curve: Curve.Ease })
      .translate({ x: 100.0 })
      .onExit((type: RouteType, progress: number) => {
        if (type == RouteType.Pop) {
          this.opacity3 = 1 - progress
        }
      })
  }
}