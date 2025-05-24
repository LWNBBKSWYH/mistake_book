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
    httpRequest?: http.HttpRequest;
}
import router from "@ohos:router";
import http from "@ohos:net.http";
import PromptAction from "@ohos:promptAction";
import { apimistakeCollections } from "@bundle:com.example.errorbook/entry/ets/utils/net_config";
import type { QuestionItem, RouterParams, CollectionInfo, resinformation } from '../utils/ALL_Interface';
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
        this.httpRequest = http.createHttp();
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
        if (params.httpRequest !== undefined) {
            this.httpRequest = params.httpRequest;
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
    private httpRequest: http.HttpRequest;
    aboutToAppear() {
        const params: RouterParams = router.getParams() as RouterParams;
        this.collectionId = params.id;
        this.fetchQuestions();
    }
    // 获取错题列表
    async fetchQuestions() {
        this.isLoading = true;
        try {
            const response = await this.httpRequest.request(`${apimistakeCollections.questions}/${this.collectionId}`, {
                method: http.RequestMethod.GET,
                extraData: {
                    keyword: this.searchKeyword,
                    page: this.currentPage,
                    pageSize: 10
                }
            });
            const result: resinformation = JSON.parse(response.result.toString());
            if (result.code !== 200) {
                PromptAction.showToast({
                    message: result.message || '获取列表失败'
                });
                return;
            }
            this.collectionInfo.question_count = result.total;
            this.questions = result.list;
            this.totalPages = Math.ceil(result.total / 10);
        }
        catch (err) {
            console.error(err);
            PromptAction.showToast({
                message: `请求失败: ${err.code || '网络错误'}`
            });
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
            Column.debugLine("entry/src/main/ets/pages/errorbook.ets(81:5)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 错题集信息卡片
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/errorbook.ets(83:7)", "entry");
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
            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(84:9)", "entry");
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.collectionInfo.description);
            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(89:9)", "entry");
            Text.fontSize(14);
            Text.fontColor('#666');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共${this.collectionInfo.question_count}题`);
            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(94:9)", "entry");
            Text.fontSize(12);
            Text.fontColor('#999');
        }, Text);
        Text.pop();
        // 错题集信息卡片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索栏
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/errorbook.ets(104:7)", "entry");
            // 搜索栏
            Row.padding({ left: 16, right: 16 });
            // 搜索栏
            Row.margin({ bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索题目' });
            TextInput.debugLine("entry/src/main/ets/pages/errorbook.ets(105:9)", "entry");
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
            Button.debugLine("entry/src/main/ets/pages/errorbook.ets(115:9)", "entry");
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
            // 在 build() 方法中修改 List 部分
            List.create();
            List.debugLine("entry/src/main/ets/pages/errorbook.ets(126:7)", "entry");
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 当没有错题时显示创建按钮
            if (this.questions.length === 0) {
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
                            ListItem.debugLine("entry/src/main/ets/pages/errorbook.ets(129:11)", "entry");
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Button.createWithLabel('创建新错题记录');
                                Button.debugLine("entry/src/main/ets/pages/errorbook.ets(130:13)", "entry");
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
                        ListItem.debugLine("entry/src/main/ets/pages/errorbook.ets(148:11)", "entry");
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.debugLine("entry/src/main/ets/pages/errorbook.ets(149:13)", "entry");
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
                            Row.debugLine("entry/src/main/ets/pages/errorbook.ets(151:15)", "entry");
                            // 题目类型和难度标签
                            Row.margin({ bottom: 8 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(question.question_type);
                            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(152:17)", "entry");
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
                            // 添加难度显示（假设接口返回 difficulty 字段）
                            if (question.difficulty) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`难度: ${'★'.repeat(question.difficulty)}`);
                                        Text.debugLine("entry/src/main/ets/pages/errorbook.ets(166:19)", "entry");
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
                            // 题目内容（限制显示行数）
                            Text.create(question.question_description);
                            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(175:15)", "entry");
                            // 题目内容（限制显示行数）
                            Text.fontSize(16);
                            // 题目内容（限制显示行数）
                            Text.margin({ bottom: 8 });
                            // 题目内容（限制显示行数）
                            Text.maxLines(2);
                            // 题目内容（限制显示行数）
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        }, Text);
                        // 题目内容（限制显示行数）
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // 学科、章节和错误次数
                            Row.create();
                            Row.debugLine("entry/src/main/ets/pages/errorbook.ets(182:15)", "entry");
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.debugLine("entry/src/main/ets/pages/errorbook.ets(183:17)", "entry");
                            Column.layoutWeight(1);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(question.subject);
                            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(184:19)", "entry");
                            Text.fontSize(12);
                            Text.fontColor('#666');
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(question.chapter);
                            Text.debugLine("entry/src/main/ets/pages/errorbook.ets(188:19)", "entry");
                            Text.fontSize(12);
                            Text.fontColor('#666');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            // 显示错误次数（假设接口返回 wrong_times 字段）
                            if (question.wrong_times) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`错误 ${question.wrong_times} 次`);
                                        Text.debugLine("entry/src/main/ets/pages/errorbook.ets(196:19)", "entry");
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
                        // 学科、章节和错误次数
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
                            ListItem.debugLine("entry/src/main/ets/pages/errorbook.ets(220:11)", "entry");
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Button.createWithLabel('加载更多');
                                Button.debugLine("entry/src/main/ets/pages/errorbook.ets(221:13)", "entry");
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
        // 在 build() 方法中修改 List 部分
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
