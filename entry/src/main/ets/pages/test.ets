import { textRecognition } from '@kit.CoreVisionKit'
import { image } from '@kit.ImageKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { fileIo } from '@kit.CoreFileKit';
import { photoAccessHelper } from '@kit.MediaLibraryKit';


@Entry
@Component
struct Index {
  private imageSource: image.ImageSource | undefined = undefined;
  @State chooseImage: PixelMap | undefined = undefined;
  @State dataValues: string = '';


  async aboutToAppear(): Promise<void> {
    const initResult = await textRecognition.init();
    hilog.info(0x0000, 'OCRDemo', `OCR service initialization result:${initResult}`);
  }


  async aboutToDisappear(): Promise<void> {
    await textRecognition.release();
    hilog.info(0x0000, 'OCRDemo', 'OCR service released successfully');
  }


  build() {
    Column() {
      Image(this.chooseImage)
        .objectFit(ImageFit.Fill)
        .height('60%')


      Text(this.dataValues)
        .copyOption(CopyOptions.LocalDevice)
        .height('15%')
        .margin(10)
        .width('60%')


      Button('选择图片')
        .type(ButtonType.Capsule)
        .fontColor(Color.White)
        .alignSelf(ItemAlign.Center)
        .width('80%')
        .margin(10)
        .onClick(() => {
          // 拉起图库，获取图片资源
          this.selectImage();
        })


      Button('开始识别')
        .type(ButtonType.Capsule)
        .fontColor(Color.White)
        .alignSelf(ItemAlign.Center)
        .width('80%')
        .margin(10)
        .onClick(async () => {
          this.textRecognitionTest();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }


  private textRecognitionTest() {
    if (!this.chooseImage) {
      return;
    }
    // 调用文本识别接口
    let visionInfo: textRecognition.VisionInfo = {
      pixelMap: this.chooseImage
    };
    let textConfiguration: textRecognition.TextRecognitionConfiguration = {
      isDirectionDetectionSupported: false
    };
    textRecognition.recognizeText(visionInfo, textConfiguration)
      .then((data: textRecognition.TextRecognitionResult) => {
        // 识别成功，获取对应的结果
        let recognitionString = JSON.stringify(data);
        hilog.info(0x0000, 'OCRDemo', `Succeeded in recognizing text：${recognitionString}`);
        // 将结果更新到Text中显示
        this.dataValues = data.value;
      })
      .catch((error: BusinessError) => {
        hilog.error(0x0000, 'OCRDemo', `Failed to recognize text. Code: ${error.code}, message: ${error.message}`);
        this.dataValues = `Error: ${error.message}`;
      });
  }


  private async selectImage() {
    let uri = await this.openPhoto();
    if (uri === undefined) {
      hilog.error(0x0000, 'OCRDemo', "Failed to get uri.");
      return;
    }
    this.loadImage(uri);
  }


  private openPhoto(): Promise<string> {
    return new Promise<string>((resolve) => {
      let photoPicker: photoAccessHelper.PhotoViewPicker = new photoAccessHelper.PhotoViewPicker();
      photoPicker.select({
        MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
        maxSelectNumber: 1
      }).then((res: photoAccessHelper.PhotoSelectResult) => {
        resolve(res.photoUris[0]);
      }).catch((err: BusinessError) => {
        hilog.error(0x0000, 'OCRDemo', `Failed to get photo image uri. code: ${err.code}, message: ${err.message}`);
        resolve('');
      })
    })
  }


  private loadImage(name: string) {
    setTimeout(async () => {
      let fileSource = await fileIo.open(name, fileIo.OpenMode.READ_ONLY);
      this.imageSource = image.createImageSource(fileSource.fd);
      this.chooseImage = await this.imageSource.createPixelMap();
    }, 100)
  }
}