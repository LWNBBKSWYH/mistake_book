import router from '@ohos.router';

@Entry
@Component
struct MistakeCollectionHome {
  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('主页')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ left: 16 })

        Blank()

        Image($r('app.media.menu')) // 替换为菜单图标资源
          .width(24)
          .height(24)
          .margin({ right: 16 })
      }
      .width('100%')
      .height(56)
      .justifyContent(FlexAlign.SpaceBetween)

      // 搜索框
      Search({
        placeholder: '搜索错题',
        controller: new SearchController()
      })
        .placeholderFont({ size: 16 })
        .width('90%')
        .height(40)
        .margin({ top: 16, bottom: 24 })
        .backgroundColor('#FFFFFF')
        .borderRadius(20)

      // 三个错题分类按钮
      Row({ space: 20 }) {
        Column() {
          Text('数学错题')
            .fontSize(16)
        }
        .width(120)
        .height(120)
        .backgroundColor('#FFFFFF')
        .borderRadius(12)
        .justifyContent(FlexAlign.Center)

        Column() {
          Text('语文错题')
            .fontSize(16)
        }
        .width(120)
        .height(120)
        .backgroundColor('#FFFFFF')
        .borderRadius(12)
        .justifyContent(FlexAlign.Center)

        Column() {
          Text('英语错题')
            .fontSize(16)
        }
        .width(120)
        .height(120)
        .backgroundColor('#FFFFFF')
        .borderRadius(12)
        .justifyContent(FlexAlign.Center)
      }
      .width('100%')
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: 40 })

      // 底部导航栏
      Row({ space: 40 }) {
        Column() {
          Image($r('app.media.ic_public_home')) // 替换为添加错题图标
            .width(28)
            .height(28)
            .margin({ bottom: 4 })
          Text('添加错题')
            .fontSize(12)
        }

        Column() {
          Image($r('app.media.icon_news')) // 替换为复习图标
            .width(28)
            .height(28)
            .margin({ bottom: 4 })
          Text('错题复习')
            .fontSize(12)
        }

        Column() {
          Image($r('app.media.myself')) // 替换为统计图标
            .width(28)
            .height(28)
            .margin({ bottom: 4 })
          Text('统计分析')
            .fontSize(12)
        }
      }
      .width('100%')
      .height(60)
      .justifyContent(FlexAlign.Center)
      .position({ x: 0, y: '100%' })
      .margin({ top: 20 })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5') // 浅灰色背景
  }
}