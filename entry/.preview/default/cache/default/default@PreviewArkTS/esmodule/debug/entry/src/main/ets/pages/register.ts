if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RegisterPage_Params {
    username?: string;
    account?: string;
    password?: string;
    isLoading?: boolean;
    errorMessage?: string;
    httpRequest?: http.HttpRequest;
}
import router from "@ohos:router";
import promptAction from "@ohos:promptAction";
import http from "@ohos:net.http";
import { apiusers } from "@bundle:com.example.errorbook/entry/ets/utils/net_config";
interface HttpResponseData {
    message?: string;
    error?: string;
    user?: UserInfo;
}
;
interface UserInfo {
    id: number;
    username: string;
}
class RegisterPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__username = new ObservedPropertySimplePU('', this, "username");
        this.__account = new ObservedPropertySimplePU('', this, "account");
        this.__password = new ObservedPropertySimplePU('', this, "password");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__errorMessage = new ObservedPropertySimplePU('', this, "errorMessage");
        this.httpRequest = http.createHttp();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RegisterPage_Params) {
        if (params.username !== undefined) {
            this.username = params.username;
        }
        if (params.account !== undefined) {
            this.account = params.account;
        }
        if (params.password !== undefined) {
            this.password = params.password;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.errorMessage !== undefined) {
            this.errorMessage = params.errorMessage;
        }
        if (params.httpRequest !== undefined) {
            this.httpRequest = params.httpRequest;
        }
    }
    updateStateVars(params: RegisterPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__username.purgeDependencyOnElmtId(rmElmtId);
        this.__account.purgeDependencyOnElmtId(rmElmtId);
        this.__password.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__errorMessage.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__username.aboutToBeDeleted();
        this.__account.aboutToBeDeleted();
        this.__password.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__errorMessage.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __username: ObservedPropertySimplePU<string>;
    get username() {
        return this.__username.get();
    }
    set username(newValue: string) {
        this.__username.set(newValue);
    }
    private __account: ObservedPropertySimplePU<string>;
    get account() {
        return this.__account.get();
    }
    set account(newValue: string) {
        this.__account.set(newValue);
    }
    private __password: ObservedPropertySimplePU<string>;
    get password() {
        return this.__password.get();
    }
    set password(newValue: string) {
        this.__password.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __errorMessage: ObservedPropertySimplePU<string>;
    get errorMessage() {
        return this.__errorMessage.get();
    }
    set errorMessage(newValue: string) {
        this.__errorMessage.set(newValue);
    }
    private httpRequest: http.HttpRequest;
    // 处理注册逻辑
    async handleRegister() {
        if (!this.username || !this.account || !this.password) {
            this.errorMessage = '请填写完整信息';
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';
        try {
            const response = await this.httpRequest.request(apiusers.register, {
                method: http.RequestMethod.POST,
                header: {
                    'Content-Type': 'application/json'
                },
                extraData: JSON.stringify({
                    username: this.username,
                    account: this.account,
                    password: this.password
                })
            });
            if (response.responseCode === 200) {
                const data: HttpResponseData = JSON.parse(response.result as string) as HttpResponseData;
                if (data.message === '注册成功') {
                    promptAction.showToast({ message: '注册成功' });
                    router.back(); // 返回登录页面
                }
                else {
                    this.errorMessage = data.error || '注册失败';
                }
            }
            else {
                this.errorMessage = `请求失败: ${response.responseCode}`;
            }
        }
        catch (err) {
            console.error('注册请求错误:', err);
            this.errorMessage = '网络请求失败';
        }
        finally {
            this.isLoading = false;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/register.ets(72:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('用户注册');
            Text.debugLine("entry/src/main/ets/pages/register.ets(74:7)", "entry");
            // 标题
            Text.fontSize(30);
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.margin({ top: 50, bottom: 30 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 用户名输入
            TextInput.create({ placeholder: '请输入用户名', text: { value: this.username, changeEvent: newValue => { this.username = newValue; } } });
            TextInput.debugLine("entry/src/main/ets/pages/register.ets(80:7)", "entry");
            // 用户名输入
            TextInput.width('90%');
            // 用户名输入
            TextInput.height(50);
            // 用户名输入
            TextInput.borderRadius(10);
            // 用户名输入
            TextInput.backgroundColor(Color.White);
            // 用户名输入
            TextInput.onChange((value: string) => {
                this.username = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 账号输入
            TextInput.create({ placeholder: '请输入账号', text: { value: this.account, changeEvent: newValue => { this.account = newValue; } } });
            TextInput.debugLine("entry/src/main/ets/pages/register.ets(90:7)", "entry");
            // 账号输入
            TextInput.width('90%');
            // 账号输入
            TextInput.height(50);
            // 账号输入
            TextInput.borderRadius(10);
            // 账号输入
            TextInput.backgroundColor(Color.White);
            // 账号输入
            TextInput.type(InputType.Normal);
            // 账号输入
            TextInput.onChange((value: string) => {
                this.account = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 密码输入
            TextInput.create({ placeholder: '请输入密码', text: { value: this.password, changeEvent: newValue => { this.password = newValue; } } });
            TextInput.debugLine("entry/src/main/ets/pages/register.ets(101:7)", "entry");
            // 密码输入
            TextInput.width('90%');
            // 密码输入
            TextInput.height(50);
            // 密码输入
            TextInput.borderRadius(10);
            // 密码输入
            TextInput.backgroundColor(Color.White);
            // 密码输入
            TextInput.type(InputType.Password);
            // 密码输入
            TextInput.onChange((value: string) => {
                this.password = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 错误提示
            if (this.errorMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.errorMessage);
                        Text.debugLine("entry/src/main/ets/pages/register.ets(113:9)", "entry");
                        Text.fontColor(Color.Red);
                        Text.fontSize(14);
                        Text.margin(10);
                    }, Text);
                    Text.pop();
                });
            }
            // 注册按钮
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 注册按钮
            Button.createWithLabel('注册');
            Button.debugLine("entry/src/main/ets/pages/register.ets(120:7)", "entry");
            // 注册按钮
            Button.width('90%');
            // 注册按钮
            Button.height(50);
            // 注册按钮
            Button.margin({ top: 20 });
            // 注册按钮
            Button.backgroundColor('#0a59f7');
            // 注册按钮
            Button.fontColor(Color.White);
            // 注册按钮
            Button.onClick(() => {
                this.handleRegister();
            });
            // 注册按钮
            Button.enabled(!this.isLoading);
        }, Button);
        // 注册按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 返回登录按钮
            Button.createWithLabel('返回登录');
            Button.debugLine("entry/src/main/ets/pages/register.ets(131:7)", "entry");
            // 返回登录按钮
            Button.width('90%');
            // 返回登录按钮
            Button.height(50);
            // 返回登录按钮
            Button.margin({ top: 10 });
            // 返回登录按钮
            Button.backgroundColor('#ffffff');
            // 返回登录按钮
            Button.fontColor('#0a59f7');
            // 返回登录按钮
            Button.borderColor('#0a59f7');
            // 返回登录按钮
            Button.borderWidth(1);
            // 返回登录按钮
            Button.onClick(() => {
                router.back();
            });
            // 返回登录按钮
            Button.enabled(!this.isLoading);
        }, Button);
        // 返回登录按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 加载指示器
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/register.ets(145:9)", "entry");
                        LoadingProgress.color('#0a59f7');
                        LoadingProgress.margin({ top: 20 });
                    }, LoadingProgress);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "RegisterPage";
    }
}
registerNamedRoute(() => new RegisterPage(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/register", pageFullPath: "entry/src/main/ets/pages/register", integratedHsp: "false", moduleType: "followWithHap" });
