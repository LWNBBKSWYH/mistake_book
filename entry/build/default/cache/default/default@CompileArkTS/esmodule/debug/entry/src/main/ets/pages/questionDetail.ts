if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface QuestionDetail_Params {
    question?: QuestionItem;
    isLoading?: boolean;
    httpRequest?: http.HttpRequest;
}
import type { QuestionItem, RouterParams, ApiResponse } from '../utils/ALL_Interface';
import router from "@ohos:router";
import http from "@ohos:net.http";
import PromptAction from "@ohos:promptAction";
import { apimistakes } from "@bundle:com.example.errorbook/entry/ets/utils/net_config";
class QuestionDetail extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__question = new ObservedPropertyObjectPU({} as QuestionItem, this, "question");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.httpRequest = http.createHttp();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: QuestionDetail_Params) {
        if (params.question !== undefined) {
            this.question = params.question;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.httpRequest !== undefined) {
            this.httpRequest = params.httpRequest;
        }
    }
    updateStateVars(params: QuestionDetail_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__question.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__question.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __question: ObservedPropertyObjectPU<QuestionItem>;
    get question() {
        return this.__question.get();
    }
    set question(newValue: QuestionItem) {
        this.__question.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private httpRequest: http.HttpRequest;
    aboutToAppear() {
        const params: RouterParams = router.getParams() as RouterParams;
        this.fetchQuestionDetail(params.id);
    }
    async fetchQuestionDetail(id: string) {
        this.isLoading = true;
        try {
            const response = await this.httpRequest.request(`${apimistakes.detail}/${id}`, { method: http.RequestMethod.GET });
            if (response.responseCode === 200) {
                const result: ApiResponse<QuestionItem> = JSON.parse(response.result.toString());
                this.question = result.data!;
            }
        }
        catch (err) {
            PromptAction.showToast({ message: '获取题目详情失败' });
        }
        finally {
            this.isLoading = false;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding(16);
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(50);
                        LoadingProgress.height(50);
                    }, LoadingProgress);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 题目详情展示
                        Text.create(this.question.question_description);
                        // 题目详情展示
                        Text.fontSize(18);
                        // 题目详情展示
                        Text.margin({ bottom: 16 });
                    }, Text);
                    // 题目详情展示
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 选择题选项展示
                        if (this.question.question_type === '选择题' && this.question.options) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                }, Column);
                                Column.pop();
                            });
                        }
                        // 答案解析
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 答案解析
                        if (this.question.analysis) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`解析: ${this.question.analysis}`);
                                    Text.fontSize(14);
                                    Text.fontColor('#666');
                                    Text.margin({ top: 16 });
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
        return "QuestionDetail";
    }
}
registerNamedRoute(() => new QuestionDetail(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/questionDetail", pageFullPath: "entry/src/main/ets/pages/questionDetail", integratedHsp: "false", moduleType: "followWithHap" });
