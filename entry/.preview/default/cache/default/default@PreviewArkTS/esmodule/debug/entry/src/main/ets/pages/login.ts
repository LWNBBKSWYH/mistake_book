if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Login_Params {
    login?: boolean;
    username?: string;
    password?: string;
    errorMessage?: string;
    isLoading?: boolean;
    httpRequest?: http.HttpRequest;
}
import router from "@ohos:router";
import promptAction from "@ohos:promptAction";
import http from "@ohos:net.http";
import { apiusers } from "@bundle:com.example.errorbook/entry/ets/utils/net_config";
// 定义接口类型
interface UserInfo {
    id: number;
    username: string;
}
interface HttpResponseData {
    message?: string;
    error?: string;
    user?: UserInfo;
}
;
class Login extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__login = this.createStorageLink('login', false, "login");
        this.__username = this.createStorageLink('username', '', "username");
        this.__password = new ObservedPropertySimplePU('', this, "password");
        this.__errorMessage = new ObservedPropertySimplePU('', this, "errorMessage");
        this.__isLoading = this.createStorageLink('isLoading', false, "isLoading");
        this.httpRequest = http.createHttp();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Login_Params) {
        if (params.password !== undefined) {
            this.password = params.password;
        }
        if (params.errorMessage !== undefined) {
            this.errorMessage = params.errorMessage;
        }
        if (params.httpRequest !== undefined) {
            this.httpRequest = params.httpRequest;
        }
    }
    updateStateVars(params: Login_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__login.purgeDependencyOnElmtId(rmElmtId);
        this.__username.purgeDependencyOnElmtId(rmElmtId);
        this.__password.purgeDependencyOnElmtId(rmElmtId);
        this.__errorMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__login.aboutToBeDeleted();
        this.__username.aboutToBeDeleted();
        this.__password.aboutToBeDeleted();
        this.__errorMessage.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __login: ObservedPropertyAbstractPU<boolean>;
    get login() {
        return this.__login.get();
    }
    set login(newValue: boolean) {
        this.__login.set(newValue);
    }
    private __username: ObservedPropertyAbstractPU<string>;
    get username() {
        return this.__username.get();
    }
    set username(newValue: string) {
        this.__username.set(newValue);
    }
    private __password: ObservedPropertySimplePU<string>;
    get password() {
        return this.__password.get();
    }
    set password(newValue: string) {
        this.__password.set(newValue);
    }
    private __errorMessage: ObservedPropertySimplePU<string>;
    get errorMessage() {
        return this.__errorMessage.get();
    }
    set errorMessage(newValue: string) {
        this.__errorMessage.set(newValue);
    }
    private __isLoading: ObservedPropertyAbstractPU<boolean>; // 使用AppStorage关联
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private httpRequest: http.HttpRequest;
    aboutToAppear(): void {
        if (this.login) {
            router.replaceUrl({
                url: 'pages/home'
            });
        }
        else {
            // 确保清除任何残留状态
            this.username = '';
            this.password = '';
            this.errorMessage = '';
        }
    }
    // 处理服务器响应
    handleResponse(response: http.HttpResponse): void {
        this.isLoading = false;
        try {
            const data: HttpResponseData = JSON.parse(response.result as string) as HttpResponseData;
            if (response.responseCode === 200) {
                if (data.message === 'Login success') {
                    promptAction.showToast({
                        message: '登录成功',
                        duration: 2000 // 显示2秒
                    });
                    this.login = true;
                    router.replaceUrl({ url: 'pages/home' });
                }
                else if (data.message === 'Registered successfully') {
                    promptAction.showToast({ message: '注册成功，请登录' });
                }
            }
            else {
                this.errorMessage = data.error ?? '请求失败';
            }
        }
        catch (e) {
            console.error('JSON解析错误:', e);
            this.errorMessage = '数据格式错误';
        }
    }
    // 跳转到注册页面
    navigateToRegister(): void {
        router.pushUrl({
            url: 'pages/register'
        }, router.RouterMode.Standard);
    }
    // 登录方法
    handleLogin(): void {
        if (!this.username || !this.password) {
            this.errorMessage = '请输入用户名和密码';
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';
        this.httpRequest.request(apiusers.login, {
            method: http.RequestMethod.POST,
            header: {
                'Content-Type': 'application/json'
            },
            extraData: JSON.stringify({
                username: this.username,
                password: this.password
            })
        }, (err: Error, data: http.HttpResponse) => {
            if (err) {
                console.error('请求失败:', err);
                this.errorMessage = '连接服务器失败';
                this.isLoading = false;
                return;
            }
            this.handleResponse(data);
        });
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.debugLine("entry/src/main/ets/pages/login.ets(109:5)", "entry");
            Column.justifyContent(FlexAlign.Center);
            Column.backgroundImage({ "id": 16777247, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Column.backgroundImageSize(ImageSize.Cover);
            Column.backgroundImagePosition(Alignment.Center);
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/login.ets(110:7)", "entry");
            Column.height('10%');
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/login.ets(114:7)", "entry");
            Column.borderRadius(20);
            Column.margin(20);
            Column.height('60%');
            Column.backgroundColor("rgba(255, 255, 255, 0.7)");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/login.ets(115:9)", "entry");
            Row.margin(20);
            Row.width("100%");
            Row.justifyContent(FlexAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("欢迎来到");
            Text.debugLine("entry/src/main/ets/pages/login.ets(116:11)", "entry");
            Text.fontSize(35);
            Text.fontWeight(FontWeight.Bold);
            Text.margin(10);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("错题本");
            Text.debugLine("entry/src/main/ets/pages/login.ets(120:11)", "entry");
            Text.borderRadius(10);
            Text.padding(5);
            Text.backgroundColor("#0a59f7");
            Text.fontColor(Color.White);
            Text.fontSize(35);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('账号');
            Text.debugLine("entry/src/main/ets/pages/login.ets(131:9)", "entry");
            Text.margin({
                left: 30,
                bottom: 10
            });
            Text.alignSelf(ItemAlign.Start);
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入账号', text: { value: this.username, changeEvent: newValue => { this.username = newValue; } } });
            TextInput.debugLine("entry/src/main/ets/pages/login.ets(139:9)", "entry");
            TextInput.backgroundColor(Color.White);
            TextInput.borderRadius(10);
            TextInput.margin({
                bottom: 30,
                left: 25,
                right: 25
            });
            TextInput.onChange((value: string) => {
                this.username = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('密码');
            Text.debugLine("entry/src/main/ets/pages/login.ets(150:9)", "entry");
            Text.margin({
                left: 30,
                bottom: 10
            });
            Text.alignSelf(ItemAlign.Start);
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入密码', text: { value: this.password, changeEvent: newValue => { this.password = newValue; } } });
            TextInput.debugLine("entry/src/main/ets/pages/login.ets(158:9)", "entry");
            TextInput.backgroundColor(Color.White);
            TextInput.borderRadius(10);
            TextInput.margin({
                bottom: 30,
                left: 25,
                right: 25
            });
            TextInput.type(InputType.Password);
            TextInput.onChange((value: string) => {
                this.password = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.errorMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.errorMessage);
                        Text.debugLine("entry/src/main/ets/pages/login.ets(171:11)", "entry");
                        Text.fontColor(Color.Red);
                        Text.margin(10);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/login.ets(175:9)", "entry");
            Column.justifyContent(FlexAlign.SpaceEvenly);
            Column.height('25%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/login.ets(176:11)", "entry");
            Row.justifyContent(FlexAlign.Center);
            Row.width("100%");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('登录');
            Button.debugLine("entry/src/main/ets/pages/login.ets(177:13)", "entry");
            Button.fontSize(20);
            Button.margin(5);
            Button.type(ButtonType.Normal);
            Button.borderRadius(20);
            Button.width("40%");
            Button.height(60);
            Button.onClick(() => {
                this.handleLogin(); // 仅发起登录请求，跳转逻辑交给handleResponse处理
            });
            Button.enabled(!this.isLoading);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('注册');
            Button.debugLine("entry/src/main/ets/pages/login.ets(188:13)", "entry");
            Button.fontSize(20);
            Button.borderColor("#0a59f7");
            Button.borderWidth(2);
            Button.fontColor("#0a59f7");
            Button.backgroundColor(Color.White);
            Button.margin(5);
            Button.type(ButtonType.Normal);
            Button.borderRadius(20);
            Button.height(60);
            Button.width("40%");
            Button.onClick(() => {
                this.navigateToRegister();
            });
            Button.enabled(!this.isLoading);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/login.ets(204:15)", "entry");
                        LoadingProgress.margin(10);
                    }, LoadingProgress);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
        Column.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/login.ets(219:7)", "entry");
            Column.height('30%');
        }, Column);
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Login";
    }
}
registerNamedRoute(() => new Login(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/login", pageFullPath: "entry/src/main/ets/pages/login", integratedHsp: "false", moduleType: "followWithHap" });
