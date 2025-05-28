if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CreateQuestion_Params {
    formData?: QuestionItem;
    showTypePicker?: boolean;
    showDifficultyPicker?: boolean;
    isLoading?: boolean;
    rdbStore?: relationalStore.RdbStore;
    questionTypes?: string[];
    difficultyLevels?: number[];
}
import router from "@ohos:router";
import relationalStore from "@ohos:data.relationalStore";
import type { ValuesBucket } from "@ohos:data.ValuesBucket";
import PromptAction from "@ohos:promptAction";
import { DB_NAME } from "@bundle:com.example.errorbook/entry/ets/entryability/EntryAbility";
interface QuestionItem {
    id?: number;
    collection_id: number;
    subject: string;
    question_description: string;
    question_answer: string;
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
interface RouterParams {
    id?: string; // 根据实际情况调整类型
}
class CreateQuestion extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__formData = new ObservedPropertyObjectPU({
            collection_id: 0,
            subject: '',
            question_description: '',
            question_answer: '',
            question_type: '选择题',
            difficulty: 1,
            wrong_times: 1,
            islike: 0
        }, this, "formData");
        this.__showTypePicker = new ObservedPropertySimplePU(false, this, "showTypePicker");
        this.__showDifficultyPicker = new ObservedPropertySimplePU(false, this, "showDifficultyPicker");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.rdbStore = undefined;
        this.questionTypes = ['选择题', '判断题', '主观题'];
        this.difficultyLevels = [1, 2, 3, 4, 5];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CreateQuestion_Params) {
        if (params.formData !== undefined) {
            this.formData = params.formData;
        }
        if (params.showTypePicker !== undefined) {
            this.showTypePicker = params.showTypePicker;
        }
        if (params.showDifficultyPicker !== undefined) {
            this.showDifficultyPicker = params.showDifficultyPicker;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.rdbStore !== undefined) {
            this.rdbStore = params.rdbStore;
        }
        if (params.questionTypes !== undefined) {
            this.questionTypes = params.questionTypes;
        }
        if (params.difficultyLevels !== undefined) {
            this.difficultyLevels = params.difficultyLevels;
        }
    }
    updateStateVars(params: CreateQuestion_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__formData.purgeDependencyOnElmtId(rmElmtId);
        this.__showTypePicker.purgeDependencyOnElmtId(rmElmtId);
        this.__showDifficultyPicker.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__formData.aboutToBeDeleted();
        this.__showTypePicker.aboutToBeDeleted();
        this.__showDifficultyPicker.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __formData: ObservedPropertyObjectPU<QuestionItem>;
    get formData() {
        return this.__formData.get();
    }
    set formData(newValue: QuestionItem) {
        this.__formData.set(newValue);
    }
    private __showTypePicker: ObservedPropertySimplePU<boolean>;
    get showTypePicker() {
        return this.__showTypePicker.get();
    }
    set showTypePicker(newValue: boolean) {
        this.__showTypePicker.set(newValue);
    }
    private __showDifficultyPicker: ObservedPropertySimplePU<boolean>;
    get showDifficultyPicker() {
        return this.__showDifficultyPicker.get();
    }
    set showDifficultyPicker(newValue: boolean) {
        this.__showDifficultyPicker.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private rdbStore: relationalStore.RdbStore;
    private questionTypes: string[];
    private difficultyLevels: number[];
    async aboutToAppear() {
        const params = router.getParams() as RouterParams;
        this.formData.collection_id = parseInt(params.id || '0');
        try {
            await this.initDatabase();
        }
        catch (err) {
            console.error('数据库初始化失败:', err);
            PromptAction.showToast({ message: '数据库初始化失败' });
        }
    }
    // 初始化数据库连接
    private async initDatabase() {
        this.rdbStore = await relationalStore.getRdbStore(getContext(this), {
            name: DB_NAME,
            securityLevel: relationalStore.SecurityLevel.S1
        });
    }
    // 提交问题到数据库
    private async submitQuestion() {
        // 表单验证
        if (!this.formData.question_description.trim()) {
            PromptAction.showToast({ message: '题目描述不能为空' });
            return;
        }
        if (!this.formData.question_answer.trim()) {
            PromptAction.showToast({ message: '题目答案不能为空' });
            return;
        }
        if (!this.formData.subject.trim()) {
            PromptAction.showToast({ message: '请选择学科' });
            return;
        }
        this.isLoading = true;
        try {
            const valueBucket: ValuesBucket = {
                'collection_id': this.formData.collection_id,
                'subject': this.formData.subject,
                'question_description': this.formData.question_description,
                'question_answer': this.formData.question_answer,
                'question_type': this.formData.question_type,
                'difficulty': this.formData.difficulty || 1,
                'wrong_times': this.formData.wrong_times || 1,
                'islike': this.formData.islike || 0 // 提供默认不喜欢状态0
            };
            // 添加可选字段
            if (this.formData.options) {
                valueBucket['options'] = this.formData.options;
            }
            if (this.formData.analysis) {
                valueBucket['analysis'] = this.formData.analysis;
            }
            if (this.formData.tags) {
                valueBucket['tags'] = this.formData.tags;
            }
            // 插入数据
            await this.rdbStore.insert('mistakes', valueBucket);
            PromptAction.showToast({ message: '错题添加成功' });
            router.back();
        }
        catch (err) {
            console.error('添加错题失败:', err);
            PromptAction.showToast({ message: '添加失败，请重试' });
        }
        finally {
            this.isLoading = false;
        }
    }
    // 返回上一页
    private returnToPrevious() {
        router.back();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F7FA');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航栏
            Row.create();
            // 顶部导航栏
            Row.width('100%');
            // 顶部导航栏
            Row.padding(12);
            // 顶部导航栏
            Row.border({
                width: 1,
                color: '#F1F3F5',
                style: BorderStyle.Solid // 边框样式
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.fontSize(16);
            Button.fontColor('#0A59F7');
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => this.returnToPrevious());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('新建错题');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('完成');
            Button.fontSize(16);
            Button.fontColor('#ff4b5872');
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => this.submitQuestion());
        }, Button);
        Button.pop();
        // 顶部导航栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 表单内容
            Scroll.create();
            // 表单内容
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.width('100%');
            Column.padding(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 题目描述
            Text.create('题目描述');
            // 题目描述
            Text.fontSize(16);
            // 题目描述
            Text.fontWeight(FontWeight.Medium);
            // 题目描述
            Text.width('100%');
            // 题目描述
            Text.textAlign(TextAlign.Start);
        }, Text);
        // 题目描述
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入题目描述...', text: this.formData.question_description });
            TextInput.onChange((value: string) => {
                this.formData.question_description = value;
            });
            TextInput.height(120);
            TextInput.width('100%');
            TextInput.backgroundColor('#FFFFFF');
            TextInput.borderRadius(8);
            TextInput.padding(12);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 题目答案
            Text.create('题目答案');
            // 题目答案
            Text.fontSize(16);
            // 题目答案
            Text.fontWeight(FontWeight.Medium);
            // 题目答案
            Text.width('100%');
            // 题目答案
            Text.textAlign(TextAlign.Start);
        }, Text);
        // 题目答案
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入题目答案...', text: this.formData.question_answer });
            TextInput.onChange((value: string) => {
                this.formData.question_answer = value;
            });
            TextInput.height(120);
            TextInput.width('100%');
            TextInput.backgroundColor('#FFFFFF');
            TextInput.borderRadius(8);
            TextInput.padding(12);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 学科
            Text.create('学科');
            // 学科
            Text.fontSize(16);
            // 学科
            Text.fontWeight(FontWeight.Medium);
            // 学科
            Text.width('100%');
            // 学科
            Text.textAlign(TextAlign.Start);
        }, Text);
        // 学科
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入学科，如数学、物理等', text: this.formData.subject });
            TextInput.onChange((value: string) => {
                this.formData.subject = value;
            });
            TextInput.height(48);
            TextInput.width('100%');
            TextInput.backgroundColor('#FFFFFF');
            TextInput.borderRadius(8);
            TextInput.padding(12);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 题目类型选择
            Text.create('题目类型');
            // 题目类型选择
            Text.fontSize(16);
            // 题目类型选择
            Text.fontWeight(FontWeight.Medium);
            // 题目类型选择
            Text.width('100%');
            // 题目类型选择
            Text.textAlign(TextAlign.Start);
        }, Text);
        // 题目类型选择
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.height(48);
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor('#FFFFFF');
            Row.borderRadius(8);
            Row.onClick(() => {
                this.showTypePicker = true;
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.formData.question_type);
            Text.fontSize(16);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777235, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 难度选择
            Text.create('难度');
            // 难度选择
            Text.fontSize(16);
            // 难度选择
            Text.fontWeight(FontWeight.Medium);
            // 难度选择
            Text.width('100%');
            // 难度选择
            Text.textAlign(TextAlign.Start);
        }, Text);
        // 难度选择
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.height(48);
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor('#FFFFFF');
            Row.borderRadius(8);
            Row.onClick(() => {
                this.showDifficultyPicker = true;
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getDifficultyText(this.formData.difficulty || 1));
            Text.fontSize(16);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777235, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 解析和标签（可选）
            Text.create('题目解析（可选）');
            // 解析和标签（可选）
            Text.fontSize(16);
            // 解析和标签（可选）
            Text.fontWeight(FontWeight.Medium);
            // 解析和标签（可选）
            Text.width('100%');
            // 解析和标签（可选）
            Text.textAlign(TextAlign.Start);
        }, Text);
        // 解析和标签（可选）
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入题目解析...', text: this.formData.analysis || '' });
            TextInput.onChange((value: string) => {
                this.formData.analysis = value;
            });
            TextInput.height(80);
            TextInput.width('100%');
            TextInput.backgroundColor('#FFFFFF');
            TextInput.borderRadius(8);
            TextInput.padding(12);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('标签（可选，多个标签用逗号分隔）');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.width('100%');
            Text.textAlign(TextAlign.Start);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '例如：三角函数,几何,易错题', text: this.formData.tags || '' });
            TextInput.onChange((value: string) => {
                this.formData.tags = value;
            });
            TextInput.height(48);
            TextInput.width('100%');
            TextInput.backgroundColor('#FFFFFF');
            TextInput.borderRadius(8);
            TextInput.padding(12);
        }, TextInput);
        Column.pop();
        // 表单内容
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 题目类型选择器
            if (this.showTypePicker) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('90%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(16);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.position({ x: '5%', y: '20%' });
                        Column.zIndex(999);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('选择题目类型');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.margin({ top: 16, bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const type = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.height(48);
                                Row.width('100%');
                                Row.padding(12);
                                Row.onClick(() => {
                                    this.formData.question_type = type;
                                    this.showTypePicker = false;
                                });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(type);
                                Text.fontSize(16);
                                Text.layoutWeight(1);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.formData.question_type === type) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Image.create({ "id": 16777235, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                                            Image.width(20);
                                            Image.height(20);
                                        }, Image);
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                    });
                                }
                            }, If);
                            If.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.questionTypes, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                });
            }
            // 难度选择器
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 难度选择器
            if (this.showDifficultyPicker) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('90%');
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(16);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.position({ x: '5%', y: '20%' });
                        Column.zIndex(999);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('选择题目难度');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.margin({ top: 16, bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const level = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.height(48);
                                Row.width('100%');
                                Row.padding(12);
                                Row.onClick(() => {
                                    this.formData.difficulty = level;
                                    this.showDifficultyPicker = false;
                                });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(this.getDifficultyText(level));
                                Text.fontSize(16);
                                Text.layoutWeight(1);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.formData.difficulty === level) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Image.create({ "id": 16777235, "type": 20000, params: [], "bundleName": "com.example.errorbook", "moduleName": "entry" });
                                            Image.width(20);
                                            Image.height(20);
                                        }, Image);
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                    });
                                }
                            }, If);
                            If.pop();
                            Row.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.difficultyLevels, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                });
            }
            // 加载中遮罩
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 加载中遮罩
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#80000000');
                        Column.position({ x: 0, y: 0 });
                        Column.zIndex(9999);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(50);
                        LoadingProgress.height(50);
                        LoadingProgress.color('#0A59F7');
                    }, LoadingProgress);
                    Column.pop();
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
    // 获取难度文本
    private getDifficultyText(level: number): string {
        const stars = '★'.repeat(level);
        return `${stars} (${level}级)`;
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CreateQuestion";
    }
}
registerNamedRoute(() => new CreateQuestion(undefined, {}), "", { bundleName: "com.example.errorbook", moduleName: "entry", pagePath: "pages/createQuestion", pageFullPath: "entry/src/main/ets/pages/createQuestion", integratedHsp: "false", moduleType: "followWithHap" });
