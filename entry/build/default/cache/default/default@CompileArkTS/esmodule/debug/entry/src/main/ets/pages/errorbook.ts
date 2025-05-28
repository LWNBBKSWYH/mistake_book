if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CollectionDetail_Params {
    collectionId?: string;
    questions?: QuestionItem[];
    isLoading?: boolean;
    searchKeyword?: string;
    currentPage?: number;
    totalPages?: number;
    collectionInfo?: CollectionInfo;
    rdbStore?: relationalStore.RdbStore | null;
    pageSize?: number;
}
import router from "@ohos:router";
import PromptAction from "@ohos:promptAction";
import relationalStore from "@ohos:data.relationalStore";
import { DB_NAME } from "@bundle:com.example.errorbook/entry/ets/entryability/EntryAbility";
interface QuestionItem {
    id: number;
    collection_id: number;
    subject: string;
    question_description: string;
    question_answer?: string;
    question_type: string;
    options?: string;
    analysis?: string;
    tags?: string;
    difficulty?: number;
    wrong_times?: number;
    created_at?: string;
    updated_at?: string;
    islike?: number;
}
interface CollectionInfo {
    title: string;
    description: string;
    question_count: number;
}
interface RouterParams {
    id?: string | number; // 根据实际情况调整类型
}
class CollectionDetail extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__collectionId = new ObservedPropertySimplePU('', this, "collectionId");
        this.__questions = new ObservedPropertyObjectPU([], this, "questions");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__searchKeyword = new ObservedPropertySimplePU('', this, "searchKeyword");
        this.__currentPage = new ObservedPropertySimplePU(1, this, "currentPage");
        this.__totalPages = new ObservedPropertySimplePU(1, this, "totalPages");
        this.__collectionInfo = new ObservedPropertyObjectPU({
            title: '',
            description: '',
            question_count: 0
        }, this, "collectionInfo");
        this.rdbStore = null;
        this.pageSize = 10;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CollectionDetail_Params) {
        if (params.collectionId !== undefined) {
            this.collectionId = params.collectionId;
        }
        if (params.questions !== undefined) {
            this.questions = params.questions;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.searchKeyword !== undefined) {
            this.searchKeyword = params.searchKeyword;
        }
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.totalPages !== undefined) {
            this.totalPages = params.totalPages;
        }
        if (params.collectionInfo !== undefined) {
            this.collectionInfo = params.collectionInfo;
        }
        if (params.rdbStore !== undefined) {
            this.rdbStore = params.rdbStore;
        }
        if (params.pageSize !== undefined) {
            this.pageSize = params.pageSize;
        }
    }
    updateStateVars(params: CollectionDetail_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__collectionId.purgeDependencyOnElmtId(rmElmtId);
        this.__questions.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__searchKeyword.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__totalPages.purgeDependencyOnElmtId(rmElmtId);
        this.__collectionInfo.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__collectionId.aboutToBeDeleted();
        this.__questions.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__searchKeyword.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        this.__totalPages.aboutToBeDeleted();
        this.__collectionInfo.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __collectionId: ObservedPropertySimplePU<string>;
    get collectionId() {
        return this.__collectionId.get();
    }
    set collectionId(newValue: string) {
        this.__collectionId.set(newValue);
    }
    private __questions: ObservedPropertyObjectPU<QuestionItem[]>;
    get questions() {
        return this.__questions.get();
    }
    set questions(newValue: QuestionItem[]) {
        this.__questions.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __searchKeyword: ObservedPropertySimplePU<string>;
    get searchKeyword() {
        return this.__searchKeyword.get();
    }
    set searchKeyword(newValue: string) {
        this.__searchKeyword.set(newValue);
    }
    private __currentPage: ObservedPropertySimplePU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    private __totalPages: ObservedPropertySimplePU<number>;
    get totalPages() {
        return this.__totalPages.get();
    }
    set totalPages(newValue: number) {
        this.__totalPages.set(newValue);
    }
    private __collectionInfo: ObservedPropertyObjectPU<CollectionInfo>;
    get collectionInfo() {
        return this.__collectionInfo.get();
    }
    set collectionInfo(newValue: CollectionInfo) {
        this.__collectionInfo.set(newValue);
    }
    private rdbStore: relationalStore.RdbStore | null;
    private pageSize: number;
    async aboutToAppear() {
        const params = router.getParams() as RouterParams;
        this.collectionId = params?.id?.toString() || '';
        console.log(`准备查询错题集，ID: ${this.collectionId}`);
        if (!this.collectionId) {
            PromptAction.showToast({ message: '缺少错题集ID参数' });
            return;
        }
        await this.initDatabase();
        await this.fetchCollectionInfo();
        await this.fetchQuestions();
    }
    // 初始化数据库连接
    private async initDatabase() {
        try {
            this.rdbStore = await relationalStore.getRdbStore(getContext(this), {
                name: DB_NAME,
                securityLevel: relationalStore.SecurityLevel.S1
            });
        }
        catch (err) {
            console.error('数据库初始化失败:', err);
            PromptAction.showToast({ message: '数据库初始化失败' });
        }
    }
    // 获取错题集信息
    private async fetchCollectionInfo() {
        try {
            if (!this.rdbStore) {
                throw new Error('数据库未初始化');
            }
            console.log(`查询错题集信息，collectionId: ${this.collectionId}`);
            const predicates = new relationalStore.RdbPredicates('mistakes_collections');
            predicates.equalTo('id', parseInt(this.collectionId));
            const resultSet = await this.rdbStore.query(predicates, ['name', 'description']);
            if (resultSet.rowCount > 0 && resultSet.goToFirstRow()) {
                if (resultSet.goToFirstRow()) {
                    this.collectionInfo.title = resultSet.getString(resultSet.getColumnIndex('name')) || '';
                    this.collectionInfo.description = resultSet.getString(resultSet.getColumnIndex('description')) || '';
                }
            }
            else {
                console.warn(`未找到ID为${this.collectionId}的错题集`);
                PromptAction.showToast({ message: '未找到该错题集' });
                router.back(); // 返回上一页
                return;
            }
            resultSet.close();
            // 获取题目总数
            const countPredicates = new relationalStore.RdbPredicates('mistakes');
            countPredicates.equalTo('collection_id', parseInt(this.collectionId));
            const countResult = await this.rdbStore.query(countPredicates, ['COUNT(*) AS count'] // 使用COUNT聚合函数并设置别名
            );
            this.collectionInfo.question_count = countResult.getLong(countResult.getColumnIndex('count'));
            this.totalPages = Math.ceil(this.collectionInfo.question_count / this.pageSize);
        }
        catch (err) {
            console.error('获取错题集信息失败详情:', JSON.stringify(err));
            PromptAction.showToast({ message: '获取信息失败' });
        }
    }
    // 获取错题列表
    private async fetchQuestions() {
        if (!this.rdbStore) {
            throw new Error('数据库未初始化');
        }
        this.isLoading = true;
        try {
            const predicates = new relationalStore.RdbPredicates('mistakes');
            predicates.equalTo('collection_id', parseInt(this.collectionId));
            // 如果有搜索关键词
            if (this.searchKeyword) {
                predicates.contains('question_description', this.searchKeyword);
            }
            // 设置分页
            predicates.offsetAs((this.currentPage - 1) * this.pageSize);
            predicates.limitAs(this.pageSize);
            const columns = [
                'id', 'collection_id', 'subject', 'question_description',
                'question_type', 'question_answer',
                'difficulty', 'wrong_times', 'created_at'
            ];
            const resultSet = await this.rdbStore.query(predicates, columns);
            this.questions = [];
            while (resultSet.goToNextRow()) {
                this.questions.push({
                    id: resultSet.getLong(resultSet.getColumnIndex('id')),
                    collection_id: parseInt(this.collectionId),
                    subject: resultSet.getString(resultSet.getColumnIndex('subject')),
                    question_description: resultSet.getString(resultSet.getColumnIndex('question_description')),
                    question_type: resultSet.getString(resultSet.getColumnIndex('question_type')),
                    difficulty: resultSet.getLong(resultSet.getColumnIndex('difficulty')),
                    wrong_times: resultSet.getLong(resultSet.getColumnIndex('wrong_times')),
                    created_at: resultSet.getString(resultSet.getColumnIndex('created_at'))
                });
            }
            resultSet.close();
        }
        catch (err) {
            console.error('获取错题列表失败:', err);
            PromptAction.showToast({ message: '获取列表失败' });
        }
        finally {
            this.isLoading = false;
        }
    }
    // 搜索功能
    onSearch() {
        this.currentPage = 1;
        this.fetchQuestions();
    }
    // 加载更多
    loadMore() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.fetchQuestions();
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 错题集信息卡片
            Column.create();
            // 错题集信息卡片
            Column.padding(16);
            // 错题集信息卡片
            Column.width('100%');
            // 错题集信息卡片
            Column.backgroundColor('#FFF');
            // 错题集信息卡片
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.collectionInfo.title);
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.collectionInfo.description);
            Text.fontSize(14);
            Text.fontColor('#666');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共${this.collectionInfo.question_count}题`);
            Text.fontSize(12);
            Text.fontColor('#999');
        }, Text);
        Text.pop();
        // 错题集信息卡片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索栏
            Row.create();
            // 搜索栏
            Row.padding({ left: 16, right: 16 });
            // 搜索栏
            Row.margin({ bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索题目' });
            TextInput.onChange((value: string) => {
                this.searchKeyword = value;
            });
            TextInput.height(40);
            TextInput.layoutWeight(1);
            TextInput.borderRadius(20);
            TextInput.backgroundColor('#FFF');
            TextInput.padding({ left: 16, right: 16 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('搜索');
            Button.onClick(() => this.onSearch());
            Button.width(80);
            Button.height(40);
            Button.margin({ left: 8 });
        }, Button);
        Button.pop();
        // 搜索栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 错题列表
            List.create();
            // 错题列表
            List.layoutWeight(1);
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 当没有错题时显示创建按钮
            if (this.questions.length === 0 && !this.isLoading) {
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
                            ListItem.margin({ top: 20 });
                            ListItem.align(Alignment.Center);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Button.createWithLabel('创建新错题记录');
                                Button.onClick(() => {
                                    router.pushUrl({
                                        url: 'pages/createQuestion',
                                        params: { collectionId: this.collectionId }
                                    });
                                });
                                Button.width('80%');
                                Button.height(48);
                                Button.type(ButtonType.Capsule);
                                Button.backgroundColor('#0a59f7');
                            }, Button);
                            Button.pop();
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        ListItem.pop();
                    }
                });
            }
            // 显示错题卡片
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 显示错题卡片
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const question = _item;
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
                            Column.padding(12);
                            Column.width('100%');
                            Column.borderRadius(8);
                            Column.backgroundColor('#FFF');
                            Column.onClick(() => {
                                router.pushUrl({
                                    url: 'pages/questionDetail',
                                    params: {
                                        id: question.id.toString(),
                                        collectionId: this.collectionId
                                    }
                                });
                            });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // 题目类型和难度标签
                            Row.create();
                            // 题目类型和难度标签
                            Row.margin({ bottom: 8 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(question.question_type);
                            Text.fontSize(12);
                            Text.fontColor('#FFF');
                            Text.padding({
                                left: 8,
                                right: 8,
                                top: 2,
                                bottom: 2
                            });
                            Text.backgroundColor('#0a59f7');
                            Text.borderRadius(4);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (question.difficulty) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`难度: ${'★'.repeat(question.difficulty)}`);
                                        Text.fontSize(12);
                                        Text.fontColor('#FFA500');
                                        Text.margin({ left: 8 });
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
                        // 题目类型和难度标签
                        Row.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // 题目内容
                            Text.create(question.question_description);
                            // 题目内容
                            Text.fontSize(16);
                            // 题目内容
                            Text.margin({ bottom: 8 });
                            // 题目内容
                            Text.maxLines(2);
                            // 题目内容
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        }, Text);
                        // 题目内容
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // 学科和错误次数
                            Row.create();
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.layoutWeight(1);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(question.subject);
                            Text.fontSize(12);
                            Text.fontColor('#666');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (question.wrong_times) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`错误 ${question.wrong_times} 次`);
                                        Text.fontSize(12);
                                        Text.fontColor('#FF4500');
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
                        // 学科和错误次数
                        Row.pop();
                        Column.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.questions, forEachItemGenFunction, (question: QuestionItem) => question.id.toString(), false, false);
        }, ForEach);
        // 显示错题卡片
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 加载更多按钮
            if (this.currentPage < this.totalPages && this.questions.length > 0) {
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
                                Button.createWithLabel('加载更多');
                                Button.onClick(() => this.loadMore());
                                Button.width('100%');
                                Button.type(ButtonType.Normal);
                            }, Button);
                            Button.pop();
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        ListItem.pop();
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // 错题列表
        List.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CollectionDetail";
    }
}
registerNamedRoute(() => new CollectionDetail(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/errorbook", pageFullPath: "entry/src/main/ets/pages/errorbook", integratedHsp: "false", moduleType: "followWithHap" });
