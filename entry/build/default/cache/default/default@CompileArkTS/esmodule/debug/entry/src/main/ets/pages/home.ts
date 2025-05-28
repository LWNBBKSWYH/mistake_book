if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MistakeHome_Params {
    mistakeSets?: MistakeSet[];
    isLoading?: boolean;
    newTitle?: string;
    showAddDialog?: boolean;
    rdbStore?: relationalStore.RdbStore;
}
import router from "@ohos:router";
import relationalStore from "@ohos:data.relationalStore";
import type { ValuesBucket } from "@ohos:data.ValuesBucket";
import PromptAction from "@ohos:promptAction";
import { DB_NAME } from "@bundle:com.example.errorbook/entry/ets/entryability/EntryAbility";
import type { StoreConfig } from "@bundle:com.example.errorbook/entry/ets/entryability/EntryAbility";
// 数据库配置
const DB_CONFIG: StoreConfig = {
    name: DB_NAME,
    securityLevel: relationalStore.SecurityLevel.S1,
    encrypt: false
};
// 表结构定义
const TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS mistake_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT DEFAULT '',
  create_time TEXT DEFAULT (datetime('now','localtime')),
  question_count INTEGER DEFAULT 0
)`;
interface MistakeSet {
    id: number;
    title: string;
    subject: string;
    create_time?: string;
    question_count?: number;
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
        this.rdbStore = undefined;
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
        if (params.rdbStore !== undefined) {
            this.rdbStore = params.rdbStore;
        }
    }
    updateStateVars(params: MistakeHome_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__mistakeSets.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__newTitle.purgeDependencyOnElmtId(rmElmtId);
        this.__showAddDialog.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__mistakeSets.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__newTitle.aboutToBeDeleted();
        this.__showAddDialog.aboutToBeDeleted();
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
    private rdbStore: relationalStore.RdbStore;
    async aboutToAppear() {
        try {
            await this.initDatabase();
            await this.loadMistakeSets();
        }
        catch (err) {
            console.error('初始化错误:', err);
        }
    }
    // 初始化数据库连接
    private async initDatabase() {
        try {
            this.rdbStore = await relationalStore.getRdbStore(getContext(this), DB_CONFIG);
            await this.rdbStore.executeSql(TABLE_SCHEMA);
        }
        catch (err) {
            console.error('数据库初始化失败:', err);
            PromptAction.showToast({ message: '数据库初始化失败' });
        }
    }
    // 加载错题集（带分页功能）
    private async loadMistakeSets() {
        this.isLoading = true;
        try {
            const predicates = new relationalStore.RdbPredicates('mistake_sets');
            const resultSet = await this.rdbStore.query(predicates, ['id', 'title', 'subject', 'create_time', 'question_count']);
            this.mistakeSets = [];
            while (resultSet.goToNextRow()) {
                this.mistakeSets.push({
                    id: resultSet.getLong(resultSet.getColumnIndex('id')),
                    title: resultSet.getString(resultSet.getColumnIndex('title')),
                    subject: resultSet.getString(resultSet.getColumnIndex('subject')),
                    create_time: resultSet.getString(resultSet.getColumnIndex('create_time')),
                    question_count: resultSet.getLong(resultSet.getColumnIndex('question_count'))
                });
            }
            resultSet.close();
        }
        catch (err) {
            console.error('加载错题集失败:', err);
            PromptAction.showToast({ message: '加载数据失败' });
        }
        finally {
            this.isLoading = false;
        }
    }
    // 添加错题集（带输入校验）
    private async addMistakeSet() {
        if (!this.newTitle.trim()) {
            PromptAction.showToast({ message: '标题不能为空' });
            return;
        }
        try {
            const valueBucket: ValuesBucket = {
                'title': this.newTitle.substring(0, 100),
                'subject': '',
                'question_count': 0
            };
            await this.rdbStore.insert('mistake_sets', valueBucket);
            PromptAction.showToast({ message: '添加成功' });
            this.newTitle = '';
            this.showAddDialog = false;
            await this.loadMistakeSets();
        }
        catch (err) {
            console.error('添加失败:', err);
            PromptAction.showToast({ message: '添加失败' });
        }
    }
    // 主界面构建
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(new NavPathStack(), { moduleName: "entry", pagePath: "entry/src/main/ets/pages/home", isUserCreateStack: false });
            Navigation.toolbarConfiguration([
                { value: '主页', icon: { "id": 16777231, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" } },
                {
                    value: '我的收藏',
                    icon: { "id": 16777241, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" },
                    action: () => router.pushUrl({ url: 'pages/like' })
                }
            ]);
        }, Navigation);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor('#F5F7FA');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题栏
            Row.create();
            // 顶部标题栏
            Row.height(56);
            // 顶部标题栏
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的错题集');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777231, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Button.onClick(() => this.showSearch());
        }, Button);
        Button.pop();
        // 顶部标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 新建按钮
            Button.createWithLabel('新建错题集', { type: ButtonType.Capsule });
            // 新建按钮
            Button.width('90%');
            // 新建按钮
            Button.margin({ bottom: 16 });
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
                    this.buildEmptyView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.buildMistakeList.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Navigation.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 添加错题集弹窗
            if (this.showAddDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildAddDialog.bind(this)();
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
    // 空状态视图
    private buildEmptyView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.margin({ top: 80 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777248, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Image.width(120);
            Image.height(120);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('暂无错题集');
            Text.fontSize(18);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('点击上方按钮创建第一个错题集');
            Text.fontSize(14);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Column.pop();
    }
    // 错题集列表
    private buildMistakeList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr');
            Grid.columnsGap(12);
            Grid.rowsGap(12);
            Grid.padding(12);
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.margin(8);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create({ space: 8 });
                            Column.padding(16);
                            Column.backgroundColor('#FFFFFF');
                            Column.borderRadius(12);
                            Column.shadow({ radius: 6, color: '#10000000', offsetY: 2 });
                            Column.height(120);
                            Column.onClick(() => {
                                router.pushUrl({
                                    url: 'pages/errorbook',
                                    params: {
                                        id: item.id.toString(),
                                        title: item.title
                                    }
                                });
                            });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(item.title);
                            Text.fontSize(18);
                            Text.fontWeight(FontWeight.Medium);
                            Text.maxLines(1);
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`${item.question_count}道题`);
                            Text.fontSize(12);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Blank.create();
                        }, Blank);
                        Blank.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (item.create_time) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(this.formatTime(item.create_time));
                                        Text.fontSize(12);
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
        Grid.pop();
    }
    // 添加弹窗
    private buildAddDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.justifyContent(FlexAlign.Center);
            Column.backgroundColor('#80000000');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.padding(24);
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(16);
            Column.width('80%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('新建错题集');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({
                placeholder: '输入错题集名称',
                text: this.newTitle
            });
            TextInput.onChange((value: string) => { this.newTitle = value; });
            TextInput.height(48);
            TextInput.backgroundColor('#FFFFFF');
            TextInput.borderRadius(8);
            TextInput.padding(12);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.margin({ top: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.width('40%');
            Button.onClick(() => { this.showAddDialog = false; });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('创建');
            Button.width('40%');
            Button.onClick(() => { this.addMistakeSet(); });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    // 格式化时间
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
    // 搜索功能（示例）
    private showSearch() {
        PromptAction.showToast({ message: '搜索功能待实现' });
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "MistakeHome";
    }
}
registerNamedRoute(() => new MistakeHome(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/home", pageFullPath: "entry/src/main/ets/pages/home", integratedHsp: "false", moduleType: "followWithHap" });
