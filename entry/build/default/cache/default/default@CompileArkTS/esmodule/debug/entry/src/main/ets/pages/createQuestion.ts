if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CreateQuestion_Params {
    formData?: Partial<QuestionItem>;
    httpRequest?: http.HttpRequest;
}
import type { QuestionItem, resinformation } from '../utils/ALL_Interface';
import router from "@ohos:router";
import http from "@ohos:net.http";
import PromptAction from "@ohos:promptAction";
import { apimistakeCollections } from "@bundle:com.example.errorbook/entry/ets/utils/net_config";
class CreateQuestion extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__formData = new ObservedPropertyObjectPU({
            question_description: '',
            question_answer: '',
            subject: '',
            chapter: '',
            question_type: '',
            difficulty: 0
        }, this, "formData");
        this.httpRequest = http.createHttp();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CreateQuestion_Params) {
        if (params.formData !== undefined) {
            this.formData = params.formData;
        }
        if (params.httpRequest !== undefined) {
            this.httpRequest = params.httpRequest;
        }
    }
    updateStateVars(params: CreateQuestion_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__formData.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__formData.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __formData: ObservedPropertyObjectPU<Partial<QuestionItem>>;
    get formData() {
        return this.__formData.get();
    }
    set formData(newValue: Partial<QuestionItem>) {
        this.__formData.set(newValue);
    }
    private httpRequest: http.HttpRequest;
    // 提交问题
    async submitQuestion() {
        try {
            // 表单验证
            if (!this.formData.question_description || !this.formData.question_answer) {
                PromptAction.showToast({ message: '题目和答案不能为空' });
                return;
            }
            const response = await this.httpRequest.request(`${apimistakeCollections.create}`, {
                method: http.RequestMethod.POST,
                header: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const result: resinformation = JSON.parse(response.result.toString());
            if (response.responseCode === 200 && result.code === 200) {
                PromptAction.showToast({ message: '创建成功' });
                router.back();
            }
            else {
                PromptAction.showToast({
                    message: result.message || '创建失败'
                });
            }
        }
        catch (err) {
            console.error(`创建错题失败: ${err.code}, ${err.message}`);
            PromptAction.showToast({
                message: `创建失败: ${err.message || '网络错误'}`
            });
        }
    }
    returnpage() {
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '题目描述' });
            TextInput.onChange(value => this.formData.question_description = value);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '答案' });
            TextInput.onChange(value => this.formData.question_answer = value);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 其他表单字段...
            Button.createWithLabel('提交');
            // 其他表单字段...
            Button.onClick(() => this.submitQuestion());
        }, Button);
        // 其他表单字段...
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.onClick(() => this.returnpage());
        }, Button);
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CreateQuestion";
    }
}
registerNamedRoute(() => new CreateQuestion(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/createQuestion", pageFullPath: "entry/src/main/ets/pages/createQuestion", integratedHsp: "false", moduleType: "followWithHap" });
