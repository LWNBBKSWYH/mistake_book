if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CollectionPage_Params {
    pref?: dataPreferences.Preferences | null;
    collectedQuestions?: WrongQuestion[];
    filteredQuestions?: WrongQuestion[];
    searchValue?: string;
    searchHistory?: string[];
    searchController?: SearchController;
}
import router from "@ohos:router";
import dataPreferences from "@ohos:data.preferences";
class WrongQuestion {
    id: number;
    title: string;
    subject: string;
    chapter: string;
    section: string;
    isCollected: boolean;
    collectedDate: string;
    constructor(id: number, title: string, subject: string, chapter: string, section: string) {
        this.id = id;
        this.title = title;
        this.subject = subject;
        this.chapter = chapter;
        this.section = section;
        this.isCollected = true;
        this.collectedDate = new Date().toLocaleDateString(); // 记录收藏日期
    }
}
class CollectionPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.pref = null;
        this.__collectedQuestions = new ObservedPropertyObjectPU([
            new WrongQuestion(1, "求函数f(x)=x³+2x的导数", "函数与导数", "导数运算", "第一节"),
            new WrongQuestion(2, "证明勾股定理a²+b²=c²", "平面几何", "三角形", "第二节"),
            new WrongQuestion(3, "解方程x²-5x+6=0", "代数", "一元二次方程", "第三节"),
            new WrongQuestion(4, "计算sin(π/3)的值", "三角函数", "特殊角函数值", "第一节"),
            new WrongQuestion(5, "求椭圆x²/4 + y²/9 = 1的面积", "圆锥曲线", "椭圆", "第四节"),
            new WrongQuestion(6, "排列组合：5人排队的可能性", "概率统计", "排列组合", "第二节"),
            new WrongQuestion(7, "求极限lim(x→0)(sinx/x)", "微积分", "极限", "第三节"),
            new WrongQuestion(8, "向量a=(1,2)和b=(3,4)的点积", "向量代数", "向量运算", "第一节")
        ], this, "collectedQuestions");
        this.__filteredQuestions = new ObservedPropertyObjectPU([], this, "filteredQuestions");
        this.__searchValue = new ObservedPropertySimplePU('', this, "searchValue");
        this.__searchHistory = new ObservedPropertyObjectPU([], this, "searchHistory");
        this.searchController = new SearchController();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CollectionPage_Params) {
        if (params.pref !== undefined) {
            this.pref = params.pref;
        }
        if (params.collectedQuestions !== undefined) {
            this.collectedQuestions = params.collectedQuestions;
        }
        if (params.filteredQuestions !== undefined) {
            this.filteredQuestions = params.filteredQuestions;
        }
        if (params.searchValue !== undefined) {
            this.searchValue = params.searchValue;
        }
        if (params.searchHistory !== undefined) {
            this.searchHistory = params.searchHistory;
        }
        if (params.searchController !== undefined) {
            this.searchController = params.searchController;
        }
    }
    updateStateVars(params: CollectionPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__collectedQuestions.purgeDependencyOnElmtId(rmElmtId);
        this.__filteredQuestions.purgeDependencyOnElmtId(rmElmtId);
        this.__searchValue.purgeDependencyOnElmtId(rmElmtId);
        this.__searchHistory.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__collectedQuestions.aboutToBeDeleted();
        this.__filteredQuestions.aboutToBeDeleted();
        this.__searchValue.aboutToBeDeleted();
        this.__searchHistory.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private pref: dataPreferences.Preferences | null;
    private __collectedQuestions: ObservedPropertyObjectPU<WrongQuestion[]>;
    get collectedQuestions() {
        return this.__collectedQuestions.get();
    }
    set collectedQuestions(newValue: WrongQuestion[]) {
        this.__collectedQuestions.set(newValue);
    }
    private __filteredQuestions: ObservedPropertyObjectPU<WrongQuestion[]>;
    get filteredQuestions() {
        return this.__filteredQuestions.get();
    }
    set filteredQuestions(newValue: WrongQuestion[]) {
        this.__filteredQuestions.set(newValue);
    }
    private __searchValue: ObservedPropertySimplePU<string>;
    get searchValue() {
        return this.__searchValue.get();
    }
    set searchValue(newValue: string) {
        this.__searchValue.set(newValue);
    }
    private __searchHistory: ObservedPropertyObjectPU<string[]>;
    get searchHistory() {
        return this.__searchHistory.get();
    }
    set searchHistory(newValue: string[]) {
        this.__searchHistory.set(newValue);
    }
    private searchController: SearchController;
    async aboutToAppear() {
        try {
            this.pref = await dataPreferences.getPreferences(getContext(this), 'collectionPref');
            const savedData = await this.pref.get('collectedQuestions', '[]');
            // 修改1：只有非空数据时才覆盖预设
            if (savedData !== '[]') {
                const parsedQuestions = JSON.parse(String(savedData)) as Partial<WrongQuestion>[];
                this.collectedQuestions = parsedQuestions
                    .filter(q => q.id && q.title) // 放宽过滤条件
                    .map(q => new WrongQuestion(Number(q.id), String(q.title), String(q.subject || '未分类'), String(q.chapter || '未分类'), String(q.section || '未分类')));
            }
            this.filteredQuestions = [...this.collectedQuestions];
            // 加载搜索历史
            const history = await this.pref.get('searchHistory', '[]');
            this.searchHistory = (JSON.parse(String(history)) as string[]).filter(Boolean);
        }
        catch (err) {
            console.error('初始化失败:', err);
            this.collectedQuestions = [
                new WrongQuestion(1, "求函数f(x)=x³+2x的导数", "函数与导数", "导数运算", "第一节")
            ];
            this.filteredQuestions = [...this.collectedQuestions];
        }
    }
    // 保存数据到首选项
    private async saveData() {
        if (this.pref) {
            try {
                await this.pref.put('collectedQuestions', JSON.stringify(this.collectedQuestions));
                await this.pref.put('searchHistory', JSON.stringify(this.searchHistory));
                await this.pref.flush();
            }
            catch (e) {
                console.error('保存失败:', e);
            }
        }
    }
    // 新增方法：删除单个搜索历史项
    private async removeSearchHistoryItem(item: string) {
        this.searchHistory = this.searchHistory.filter(history => history !== item);
        await this.saveData();
    }
    // 新增方法：清空所有搜索历史
    private async clearAllSearchHistory() {
        this.searchHistory = [];
        await this.saveData();
    }
    private searchQuestions(value: string) {
        this.searchValue = value;
        if (!value) {
            this.filteredQuestions = [...this.collectedQuestions];
        }
        else {
            // 更新搜索历史
            if (!this.searchHistory.includes(value)) {
                this.searchHistory = [value, ...this.searchHistory].slice(0, 5);
                this.saveData();
            }
            // 安全搜索
            const lowerValue = value.toLowerCase();
            this.filteredQuestions = this.collectedQuestions.filter(item => item.title.toLowerCase().includes(lowerValue) ||
                item.subject.toLowerCase().includes(lowerValue) ||
                item.chapter.toLowerCase().includes(lowerValue));
        }
    }
    private async removeCollection(item: WrongQuestion) {
        this.collectedQuestions = this.collectedQuestions.filter(q => q.id !== item.id);
        this.searchQuestions(this.searchValue);
        await this.saveData();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
            Column.padding(10);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题栏
            Row.create({ space: 5 });
            // 标题栏
            Row.width('100%');
            // 标题栏
            Row.height(56);
            // 标题栏
            Row.backgroundColor('#FFFFFF');
            // 标题栏
            Row.borderRadius(10);
            // 标题栏
            Row.shadow({ radius: 2, color: '#10000000', offsetX: 0, offsetY: 1 });
            // 标题栏
            Row.justifyContent(FlexAlign.Start);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777231, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Image.width(30);
            Image.margin({ left: 10 });
            Image.onClick(() => router.back());
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("我的收藏");
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        // 标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索栏
            Row.create();
            // 搜索栏
            Row.width('100%');
            // 搜索栏
            Row.justifyContent(FlexAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Search.create({
                value: this.searchValue,
                placeholder: '搜索收藏的题目',
                controller: this.searchController
            });
            Search.width(this.searchValue === '' ? '90%' : '80%');
            Search.height(40);
            Search.backgroundColor('#FFFFFF');
            Search.placeholderColor('#999999');
            Search.textFont({ size: 16 });
            Search.margin({ top: 10, bottom: 10 });
            Search.onChange((value: string) => this.searchQuestions(value));
            Search.onSubmit((value: string) => this.searchQuestions(value));
        }, Search);
        Search.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.searchValue !== '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create({ "id": 16777233, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                        Image.width(20);
                        Image.margin({ left: 5 });
                        Image.onClick(() => this.searchQuestions(''));
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // 搜索栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 搜索历史
            if (this.searchHistory.length > 0 && this.searchValue === '') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(10);
                        Column.padding(5);
                        Column.margin({ top: 5, bottom: 5 });
                        Column.shadow({ radius: 2, color: '#10000000', offsetX: 0, offsetY: 1 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('搜索历史');
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#333333');
                        Text.margin({ left: 10, top: 5, bottom: 5 });
                        Text.layoutWeight(1);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 新增：清空所有历史按钮
                        Text.create('清空');
                        // 新增：清空所有历史按钮
                        Text.fontSize(14);
                        // 新增：清空所有历史按钮
                        Text.fontColor('#FF6B81');
                        // 新增：清空所有历史按钮
                        Text.margin({ right: 10 });
                        // 新增：清空所有历史按钮
                        Text.onClick(() => this.clearAllSearchHistory());
                    }, Text);
                    // 新增：清空所有历史按钮
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.margin({ left: 10, right: 10 });
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(item);
                                Text.fontSize(14);
                                Text.padding(8);
                                Text.backgroundColor('#F0F5FF');
                                Text.borderRadius(15);
                                Text.margin(5);
                                Text.fontColor('#1E90FF');
                                Text.onClick(() => this.searchQuestions(item));
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 新增：删除单个历史项按钮
                                Image.create({ "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                                // 新增：删除单个历史项按钮
                                Image.width(12);
                                // 新增：删除单个历史项按钮
                                Image.margin({ left: -8 });
                                // 新增：删除单个历史项按钮
                                Image.onClick(() => this.removeSearchHistoryItem(item));
                            }, Image);
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.searchHistory, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Flex.pop();
                    Column.pop();
                });
            }
            // 收藏列表
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 收藏列表
            List.create({ space: 10 });
            // 收藏列表
            List.width('100%');
            // 收藏列表
            List.layoutWeight(1);
            // 收藏列表
            List.divider({
                strokeWidth: 1,
                color: '#F1F1F1',
                startMargin: 10,
                endMargin: 10
            });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.filteredQuestions.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            itemCreation2(elmtId, isInitialRender);
                            if (!isInitialRender) {
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            ListItem.create(deepRenderFunction, true);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.height(200);
                                Column.justifyContent(FlexAlign.Center);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Image.create({ "id": 16777230, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                                Image.width(100);
                                Image.margin({ bottom: 20 });
                                Image.colorFilter('#FF9D8D8D');
                            }, Image);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(this.searchValue === '' ? '暂无收藏内容' : '未找到相关题目');
                                Text.fontSize(18);
                                Text.fontColor('#999999');
                            }, Text);
                            Text.pop();
                            Column.pop();
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        ListItem.pop();
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    itemCreation2(elmtId, isInitialRender);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create({ space: 8 });
                                        Column.padding(15);
                                        Column.width('100%');
                                        Column.backgroundColor('#FFFFFF');
                                        Column.borderRadius(10);
                                        Column.shadow({ radius: 2, color: '#10000000', offsetX: 0, offsetY: 1 });
                                        Column.onClick(() => {
                                            router.pushUrl({
                                                url: 'pages/questionDetail',
                                                params: {
                                                    questionId: String(item.id),
                                                    from: 'collection'
                                                }
                                            });
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.title);
                                        Text.fontSize(18);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.layoutWeight(1);
                                        Text.fontColor('#333333');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Image.create({ "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                                        Image.width(25);
                                        Image.onClick(() => this.removeCollection(item));
                                    }, Image);
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create({ space: 10 });
                                        Row.width('100%');
                                        Row.margin({ top: 5 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`科目：${item.subject}`);
                                        Text.fontSize(14);
                                        Text.fontColor('#666666');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`章节：${item.chapter}`);
                                        Text.fontSize(14);
                                        Text.fontColor('#666666');
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`收藏于：${item.collectedDate}`);
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                        Text.margin({ top: 5 });
                                        Text.alignSelf(ItemAlign.End);
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.filteredQuestions, forEachItemGenFunction, (item: WrongQuestion) => String(item.id), false, false);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        // 收藏列表
        List.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CollectionPage";
    }
}
registerNamedRoute(() => new CollectionPage(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/like", pageFullPath: "entry/src/main/ets/pages/like", integratedHsp: "false", moduleType: "followWithHap" });
