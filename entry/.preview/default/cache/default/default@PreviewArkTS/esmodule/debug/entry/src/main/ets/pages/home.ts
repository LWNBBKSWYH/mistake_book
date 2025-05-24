if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MistakeHome_Params {
    mistakeSets?: MistakeSet[];
    isLoading?: boolean;
    newTitle?: string;
    showAddDialog?: boolean;
    username?: string;
    httpRequest?: http.HttpRequest;
}
import router from "@ohos:router";
import http from "@ohos:net.http";
import PromptAction from "@ohos:promptAction";
import { apimistakeCollections } from "@bundle:com.example.errorbook/entry/ets/utils/net_config";
interface MistakeSet {
    id: number;
    title: string;
    subject: string;
    create_time?: string;
    question_count?: number; // 新增字段，表示题目数量
}
interface ApiResponse {
    code: number;
    message: string;
    list?: MistakeSet[];
    data?: MistakeSet;
}
class MistakeHome extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__mistakeSets = new ObservedPropertyObjectPU([], this, "mistakeSets");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__newTitle = new ObservedPropertySimplePU('', this, "newTitle");
        this.__showAddDialog = new ObservedPropertySimplePU(false, this, "showAddDialog");
        this.__username = this.createStorageLink('username', '', "username");
        this.httpRequest = http.createHttp();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MistakeHome_Params) {
        if (params.mistakeSets !== undefined) {
            this.mistakeSets = params.mistakeSets;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.newTitle !== undefined) {
            this.newTitle = params.newTitle;
        }
        if (params.showAddDialog !== undefined) {
            this.showAddDialog = params.showAddDialog;
        }
        if (params.httpRequest !== undefined) {
            this.httpRequest = params.httpRequest;
        }
    }
    updateStateVars(params: MistakeHome_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__mistakeSets.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__newTitle.purgeDependencyOnElmtId(rmElmtId);
        this.__showAddDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__username.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__mistakeSets.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__newTitle.aboutToBeDeleted();
        this.__showAddDialog.aboutToBeDeleted();
        this.__username.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __mistakeSets: ObservedPropertyObjectPU<MistakeSet[]>;
    get mistakeSets() {
        return this.__mistakeSets.get();
    }
    set mistakeSets(newValue: MistakeSet[]) {
        this.__mistakeSets.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __newTitle: ObservedPropertySimplePU<string>;
    get newTitle() {
        return this.__newTitle.get();
    }
    set newTitle(newValue: string) {
        this.__newTitle.set(newValue);
    }
    private __showAddDialog: ObservedPropertySimplePU<boolean>;
    get showAddDialog() {
        return this.__showAddDialog.get();
    }
    set showAddDialog(newValue: boolean) {
        this.__showAddDialog.set(newValue);
    }
    private __username: ObservedPropertyAbstractPU<string>;
    get username() {
        return this.__username.get();
    }
    set username(newValue: string) {
        this.__username.set(newValue);
    }
    private httpRequest: http.HttpRequest;
    private async loadUsername() {
        try {
            // 检查StorageLink绑定的username是否已有值
            if (this.username && this.username.trim() !== '') {
                console.log('从StorageLink获取用户名:', this.username);
                return;
            }
            //如果没有获取到，提示用户并跳转登录页
            PromptAction.showToast({
                message: '未检测到登录信息，请先登录',
                duration: 2000
            });
            // 延迟跳转让用户能看到提示
            setTimeout(() => {
                router.replaceUrl({
                    url: 'pages/Login',
                    params: { from: 'mistakeHome' }
                });
            }, 2000);
        }
        catch (err) {
            console.error('获取用户名失败:', err);
            PromptAction.showToast({
                message: '获取用户信息异常',
                duration: 2000
            });
        }
    }
    async aboutToAppear() {
        try {
            await this.loadUsername();
            if (this.username && this.username.trim() !== '') {
                await this.loadMistakeSets();
            }
            else {
                console.error('用户名为空或未设置');
            }
        }
        catch (err) {
            console.error('初始化错误:', err);
        }
    }
    async loadMistakeSets() {
        if (!this.username || this.username.trim() === '') {
            console.error('无法加载错题集: 用户名为空');
            PromptAction.showToast({ message: '请先登录' });
            return;
        }
        this.isLoading = true;
        try {
            // 添加请求参数
            let queryString = `username=${encodeURIComponent(this.username)}`;
            const fullUrl = `${apimistakeCollections.list}?${queryString}`;
            console.log('请求URL:', fullUrl); // 调试日志
            const res = await this.httpRequest.request(fullUrl, {
                method: http.RequestMethod.GET,
                header: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('响应状态:', res.responseCode);
            console.log('响应结果:', res.result);
            if (res.responseCode === 200) {
                const result: ApiResponse = JSON.parse(res.result as string);
                this.mistakeSets = result.list || [];
            }
            else {
                PromptAction.showToast({
                    message: `加载失败: ${res.responseCode}`
                });
            }
        }
        catch (err) {
            console.error('请求错误详情:', err);
            PromptAction.showToast({
                message: `网络异常: ${err.message}`
            });
        }
        finally {
            this.isLoading = false;
        }
    }
    async addMistakeSet() {
        if (!this.newTitle) {
            PromptAction.showToast({ message: '标题不能为空' });
            return;
        }
        const body = JSON.stringify({
            username: this.username,
            title: this.newTitle
        });
        try {
            const res = await this.httpRequest.request(apimistakeCollections.create, {
                method: http.RequestMethod.POST,
                header: { 'Content-Type': 'application/json' },
                extraData: body
            });
            if (res.responseCode === 200) {
                PromptAction.showToast({ message: '添加成功' });
                this.newTitle = '';
                this.showAddDialog = false;
                this.loadMistakeSets();
            }
            else {
                PromptAction.showToast({ message: '添加失败' });
            }
        }
        catch {
            PromptAction.showToast({ message: '请求出错' });
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/home.ets(144:5)", "entry");
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/home.ets(145:7)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(new NavPathStack(), { moduleName: "entry", pagePath: "entry/src/main/ets/pages/home", isUserCreateStack: false });
            Navigation.debugLine("entry/src/main/ets/pages/home.ets(146:9)", "entry");
            Navigation.hideToolBar(false);
            Navigation.toolbarConfiguration([
                {
                    value: '主页',
                    icon: { "id": 16777233, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" }
                },
                {
                    value: '我的账户',
                    icon: { "id": 16777225, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" },
                    action: () => {
                        router.pushUrl({ url: 'pages/account' });
                    }
                }
            ]);
        }, Navigation);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/home.ets(147:11)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F7FA');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题和搜索栏
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/home.ets(149:13)", "entry");
            // 顶部标题和搜索栏
            Row.width('100%');
            // 顶部标题和搜索栏
            Row.height(56);
            // 顶部标题和搜索栏
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的错题集');
            Text.debugLine("entry/src/main/ets/pages/home.ets(150:15)", "entry");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ left: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/home.ets(156:15)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777236, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Button.debugLine("entry/src/main/ets/pages/home.ets(158:15)", "entry");
            Button.fontSize(24);
            Button.backgroundColor(Color.Transparent);
            Button.margin({ right: 16 });
        }, Button);
        Button.pop();
        // 顶部标题和搜索栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 新建按钮
            Button.createWithLabel('新建错题集', { type: ButtonType.Capsule });
            Button.debugLine("entry/src/main/ets/pages/home.ets(168:13)", "entry");
            // 新建按钮
            Button.fontSize(16);
            // 新建按钮
            Button.fontColor('#FFFFFF');
            // 新建按钮
            Button.backgroundColor('#0a59f7');
            // 新建按钮
            Button.width('90%');
            // 新建按钮
            Button.height(48);
            // 新建按钮
            Button.margin({ top: 8, bottom: 16 });
            // 新建按钮
            Button.onClick(() => { this.showAddDialog = true; });
        }, Button);
        // 新建按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 内容区域
            if (this.mistakeSets.length === 0 && !this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.debugLine("entry/src/main/ets/pages/home.ets(179:15)", "entry");
                        Column.alignItems(HorizontalAlign.Center);
                        Column.width('100%');
                        Column.margin({ top: 80 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create({ "id": 16777251, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                        Image.debugLine("entry/src/main/ets/pages/home.ets(180:17)", "entry");
                        Image.width(120);
                        Image.height(120);
                        Image.margin({ bottom: 16 });
                    }, Image);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无错题集');
                        Text.debugLine("entry/src/main/ets/pages/home.ets(185:17)", "entry");
                        Text.fontSize(18);
                        Text.fontColor('#666666');
                        Text.fontWeight(FontWeight.Medium);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('点击上方按钮创建第一个错题集');
                        Text.debugLine("entry/src/main/ets/pages/home.ets(190:17)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#999999');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 错题集列表
                        Grid.create();
                        Grid.debugLine("entry/src/main/ets/pages/home.ets(199:15)", "entry");
                        // 错题集列表
                        Grid.columnsTemplate('1fr 1fr');
                        // 错题集列表
                        Grid.columnsGap(12);
                        // 错题集列表
                        Grid.rowsGap(12);
                        // 错题集列表
                        Grid.width('100%');
                        // 错题集列表
                        Grid.padding(12);
                        // 错题集列表
                        Grid.layoutWeight(1);
                    }, Grid);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    GridItem.create(() => { }, false);
                                    GridItem.margin(8);
                                    GridItem.debugLine("entry/src/main/ets/pages/home.ets(201:19)", "entry");
                                };
                                const observedDeepRender = () => {
                                    this.observeComponentCreation2(itemCreation2, GridItem);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create({ space: 8 });
                                        Column.debugLine("entry/src/main/ets/pages/home.ets(202:21)", "entry");
                                        Column.padding(16);
                                        Column.backgroundColor('#FFFFFF');
                                        Column.borderRadius(12);
                                        Column.shadow({ radius: 6, color: '#10000000', offsetX: 0, offsetY: 2 });
                                        Column.width('100%');
                                        Column.height(120);
                                        Column.onClick(() => {
                                            router.pushUrl({
                                                url: 'pages/errorbook',
                                                params: {
                                                    id: item.id.toString(),
                                                    title: item.title,
                                                    subject: item.subject,
                                                    question_count: item.question_count
                                                }
                                            });
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/pages/home.ets(203:23)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.title);
                                        Text.debugLine("entry/src/main/ets/pages/home.ets(204:25)", "entry");
                                        Text.fontSize(18);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.fontColor('#333333');
                                        Text.layoutWeight(1);
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/pages/home.ets(214:23)", "entry");
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`${item.question_count}道题`);
                                        Text.debugLine("entry/src/main/ets/pages/home.ets(215:25)", "entry");
                                        Text.fontSize(12);
                                        Text.fontColor('#666666');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Blank.create();
                                        Blank.debugLine("entry/src/main/ets/pages/home.ets(218:25)", "entry");
                                    }, Blank);
                                    Blank.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (item.create_time) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(this.formatTime(item.create_time));
                                                    Text.debugLine("entry/src/main/ets/pages/home.ets(220:27)", "entry");
                                                    Text.fontSize(12);
                                                    Text.fontColor('#999999');
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
                                    Row.pop();
                                    Column.pop();
                                    GridItem.pop();
                                };
                                observedDeepRender();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.mistakeSets, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    // 错题集列表
                    Grid.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 加载指示器
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/home.ets(258:15)", "entry");
                        LoadingProgress.color('#0a59f7');
                        LoadingProgress.margin({ top: 32, bottom: 32 });
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
        Navigation.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 添加错题集对话框
            if (this.showAddDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/home.ets(285:9)", "entry");
                        Column.justifyContent(FlexAlign.Center);
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#80000000');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 16 });
                        Column.debugLine("entry/src/main/ets/pages/home.ets(286:11)", "entry");
                        Column.padding(24);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(16);
                        Column.width('80%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('新建错题集');
                        Text.debugLine("entry/src/main/ets/pages/home.ets(287:13)", "entry");
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 4 });
                        Column.debugLine("entry/src/main/ets/pages/home.ets(293:13)", "entry");
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '输入错题集名称', text: this.newTitle });
                        TextInput.debugLine("entry/src/main/ets/pages/home.ets(294:15)", "entry");
                        TextInput.onChange((value: string) => { this.newTitle = value; });
                        TextInput.height(48);
                        TextInput.backgroundColor('#FFFFFF');
                        TextInput.borderRadius(8);
                        TextInput.padding(12);
                    }, TextInput);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 12 });
                        Row.debugLine("entry/src/main/ets/pages/home.ets(302:13)", "entry");
                        Row.justifyContent(FlexAlign.Center);
                        Row.margin({ top: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/pages/home.ets(303:15)", "entry");
                        Button.fontSize(16);
                        Button.fontColor('#666666');
                        Button.backgroundColor('#F0F0F0');
                        Button.width('40%');
                        Button.height(48);
                        Button.borderRadius(24);
                        Button.onClick(() => { this.showAddDialog = false; });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('创建');
                        Button.debugLine("entry/src/main/ets/pages/home.ets(312:15)", "entry");
                        Button.fontSize(16);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#0a59f7');
                        Button.width('40%');
                        Button.height(48);
                        Button.borderRadius(24);
                        Button.onClick(() => { this.addMistakeSet(); });
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
    private formatTime(timeStr?: string): string {
        if (!timeStr)
            return '';
        try {
            const date = new Date(timeStr);
            return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
        }
        catch {
            return '';
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "MistakeHome";
    }
}
registerNamedRoute(() => new MistakeHome(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/home", pageFullPath: "entry/src/main/ets/pages/home", integratedHsp: "false", moduleType: "followWithHap" });
