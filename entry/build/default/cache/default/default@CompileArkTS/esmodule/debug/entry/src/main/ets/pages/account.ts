if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface AccountPage_Params {
    username?: string;
    showLogoutDialog?: boolean;
    isLoading?: boolean;
}
import router from "@ohos:router";
import PromptAction from "@ohos:promptAction";
class AccountPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__username = this.createStorageLink('username', '', "username");
        this.__showLogoutDialog = new ObservedPropertySimplePU(false, this, "showLogoutDialog");
        this.__isLoading = this.createStorageLink('isLoading', true, "isLoading");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AccountPage_Params) {
        if (params.showLogoutDialog !== undefined) {
            this.showLogoutDialog = params.showLogoutDialog;
        }
    }
    updateStateVars(params: AccountPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__username.purgeDependencyOnElmtId(rmElmtId);
        this.__showLogoutDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__username.aboutToBeDeleted();
        this.__showLogoutDialog.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __username: ObservedPropertyAbstractPU<string>;
    get username() {
        return this.__username.get();
    }
    set username(newValue: string) {
        this.__username.set(newValue);
    }
    private __showLogoutDialog: ObservedPropertySimplePU<boolean>;
    get showLogoutDialog() {
        return this.__showLogoutDialog.get();
    }
    set showLogoutDialog(newValue: boolean) {
        this.__showLogoutDialog.set(newValue);
    }
    private __isLoading: ObservedPropertyAbstractPU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    // 修改退出登录逻辑
    private logout() {
        // 清除所有相关状态
        this.username = '';
        this.isLoading = false;
        AppStorage.setOrCreate('login', false); // 确保清除登录状态
        // 确保使用正确的页面路径
        router.clear();
        router.replaceUrl({
            url: 'pages/login'
        });
        PromptAction.showToast({ message: '已退出登录' });
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 主体内容
            Column.create();
            // 主体内容
            Column.width('100%');
            // 主体内容
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(new NavPathStack(), { moduleName: "entry", pagePath: "entry/src/main/ets/pages/account", isUserCreateStack: false });
            Navigation.title('我的账户');
            Navigation.hideToolBar(false);
            Navigation.toolbarConfiguration([
                {
                    value: '主页',
                    icon: { "id": 16777231, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" },
                    action: () => {
                        router.back();
                    }
                },
                {
                    value: '我的账户',
                    icon: { "id": 16777241, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" }
                }
            ]);
        }, Navigation);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.backgroundColor('#F7F8FA');
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 用户信息卡片
            Column.create();
            // 用户信息卡片
            Column.backgroundColor('#FFFFFF');
            // 用户信息卡片
            Column.borderRadius(8);
            // 用户信息卡片
            Column.margin({ top: 16, left: 16, right: 16 });
            // 用户信息卡片
            Column.shadow({ radius: 2, color: '#10000000', offsetX: 1, offsetY: 1 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777249, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Image.width(80);
            Image.height(80);
            Image.borderRadius(40);
            Image.margin({ right: 16 });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.username || '未登录用户');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('普通会员');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        // 用户信息卡片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 功能列表
            List.create({ space: 8 });
            // 功能列表
            List.width('100%');
            // 功能列表
            List.margin({ top: 16 });
            // 功能列表
            List.divider({ strokeWidth: 0 });
        }, List);
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                itemCreation2(elmtId, isInitialRender);
                if (!isInitialRender) {
                    // 个人资料
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
                // 个人资料
                ListItem.onClick(() => {
                    router.pushUrl({ url: 'pages/profile' });
                });
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.height(48);
                    Row.padding({ left: 16, right: 16 });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create({ "id": 16777244, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                    Image.width(24);
                    Image.height(24);
                    Image.margin({ right: 12 });
                }, Image);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('个人资料');
                    Text.fontSize(16);
                }, Text);
                Text.pop();
                Row.pop();
                // 个人资料
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 个人资料
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                itemCreation2(elmtId, isInitialRender);
                if (!isInitialRender) {
                    // 设置
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
                // 设置
                ListItem.onClick(() => {
                    router.pushUrl({ url: 'pages/settings' });
                });
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.height(48);
                    Row.padding({ left: 16, right: 16 });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create({ "id": 16777245, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                    Image.width(24);
                    Image.height(24);
                    Image.margin({ right: 12 });
                }, Image);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('设置');
                    Text.fontSize(16);
                }, Text);
                Text.pop();
                Row.pop();
                // 设置
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 设置
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                itemCreation2(elmtId, isInitialRender);
                if (!isInitialRender) {
                    // 关于
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
                // 关于
                ListItem.onClick(() => {
                    router.pushUrl({ url: 'pages/about' });
                });
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.height(48);
                    Row.padding({ left: 16, right: 16 });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create({ "id": 16777243, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                    Image.width(24);
                    Image.height(24);
                    Image.margin({ right: 12 });
                }, Image);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('关于');
                    Text.fontSize(16);
                }, Text);
                Text.pop();
                Row.pop();
                // 关于
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 关于
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                itemCreation2(elmtId, isInitialRender);
                if (!isInitialRender) {
                    //todo 退出登录
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
                //todo 退出登录
                ListItem.onClick(() => {
                    this.showLogoutDialog = true;
                });
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.height(48);
                    Row.padding({ left: 16, right: 16 });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create({ "id": 16777242, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                    Image.width(24);
                    Image.height(24);
                    Image.margin({ right: 12 });
                }, Image);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('退出登录');
                    Text.fontSize(16);
                }, Text);
                Text.pop();
                Row.pop();
                //todo 退出登录
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            //todo 退出登录
            ListItem.pop();
        }
        // 功能列表
        List.pop();
        Column.pop();
        Navigation.pop();
        // 主体内容
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 退出登录确认对话框
            if (this.showLogoutDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.justifyContent(FlexAlign.Center);
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#80000000');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.padding(16);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(12);
                        Column.width('80%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('确定要退出登录吗？');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 12 });
                        Row.justifyContent(FlexAlign.Center);
                        Row.margin({ top: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.fontSize(14);
                        Button.width('40%');
                        Button.height(36);
                        Button.onClick(() => { this.showLogoutDialog = false; });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确定退出');
                        Button.fontSize(14);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#FF4D4F');
                        Button.width('40%');
                        Button.height(36);
                        Button.onClick(() => {
                            // 这里添加退出登录逻辑
                            PromptAction.showToast({ message: '已退出登录' });
                            this.logout();
                            this.showLogoutDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "AccountPage";
    }
}
registerNamedRoute(() => new AccountPage(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/account", pageFullPath: "entry/src/main/ets/pages/account", integratedHsp: "false", moduleType: "followWithHap" });
