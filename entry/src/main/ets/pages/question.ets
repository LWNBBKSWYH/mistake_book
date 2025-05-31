import { question } from '../pages/index'; // 导入question类
import { promptAction, router } from '@kit.ArkUI';
import { JSON } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';

@Entry
@Component
struct Question {
  @ObjectLink item: question;//建立与父组件传递的 item 对象的双向绑定
  @State index: number = 0
  @State space: number = 8
  @State arrowPosition: ArrowPosition = ArrowPosition.END
  @StorageLink('login') login: number = 1;
  @State currentIndex: number = 0
  @State opacity3: number = 0//页面透明度
  @State currentQuestion: question = new question('', null, null, null, null, false);

  aboutToAppear() {
    const params = router.getParams() as question;
    console.log("<<",params.title);
    this.currentQuestion = new question(
      params.title,
      params.wrongAnswer,
      params.analysis,
      params.warning,
      params.correctAnswer,
      params.collected
    );
  }
  build() {
    Column() {
      Row(){
        Image($r('app.media.ic_public_arrow_left_filled'))
          .onClick(()=>{
            router.back();
          })
          .fillColor("#0a59f7")
            /*.borderWidth(2)
            .borderColor(Color.Black)*/
          .margin({
            left:10,
            right:15
          })
          .width('15%')
        Text(' ')
          .width('50%')
        if(this.currentQuestion.collected){
          Image($r('app.media.ic_public_highlightsed'))
            .onClick(()=>{
              this.currentQuestion.collected=false;//取消收藏
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
            .fillColor("#f7b500")
              /*.borderWidth(2)
              .borderColor(Color.Black)*/
            .margin({
              left:15,
              right:10
            })
            .width('15%')
        }else{
          Image($r('app.media.ic_public_highlights'))
            .onClick(()=>{
              this.currentQuestion.collected=true;//新增收藏
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
            .margin({
              left:15,
              right:10
            })
            .width('15%')
        }
      }
      .borderWidth(2)
      .borderColor("#0a59f7")
      .borderRadius(10)
      .height('10%')
      .width('95%')
      .justifyContent(FlexAlign.Center)
      .margin({
        bottom:10
      })
      TextArea({ text: this.currentQuestion.title })
        .width('95%')
        .backgroundColor('#F1F3F5')
        .borderWidth(2)
        .borderColor(Color.Black)
      Column(){
        Row(){
          Text('解析：')
            .fontSize(20)
            .fontColor("#f7b500")
            .alignSelf(ItemAlign.Start)
            .margin(10)
        }
        .width('95%')
        .justifyContent(FlexAlign.Start)

        Row(){
          TextArea({ text: "错解："+this.currentQuestion.wrongAnswer})
            .width('95%')
            .backgroundColor('#F1F3F5')
        }
        Row(){
          TextArea({ text: "分析："+this.currentQuestion.analysis })
            .width('95%')
            .backgroundColor('#F1F3F5')
        }
        Row(){
          TextArea({ text: "警示："+this.currentQuestion.warning })
            .width('95%')
            .backgroundColor('#F1F3F5')
        }
        Row(){
          TextArea({ text: "正解："+this.currentQuestion.correctAnswer })
            .width('95%')
            .backgroundColor('#F1F3F5')
        }
      }
      .margin({
        top:10
      })
      .borderWidth(2)
      .borderColor("#f7b500")
      .borderRadius(10)
    }
    .alignItems(HorizontalAlign.Center)
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