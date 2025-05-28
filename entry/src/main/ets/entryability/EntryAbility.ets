import { AbilityConstant, ConfigurationConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import relationalStore from '@ohos.data.relationalStore';
import preferences from '@ohos.data.preferences';
import  ValuesBucket  from '@ohos.data.relationalStore';
const DOMAIN = 0x0000;
export const DB_NAME = 'mistake_book.db';
export interface StoreConfig {
  name: string;
  securityLevel: relationalStore.SecurityLevel;
  encrypt?: boolean; // 可选参数
}

export default class EntryAbility extends UIAbility {
  private rdbStore: relationalStore.RdbStore | null = null;

  async onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');

    // 初始化数据库
    await this.initDatabase();
  }

  private async initDatabase() {
    try {
      const prefs = await preferences.getPreferences(this.context, 'db_prefs');
      const isInitialized = await prefs.get('db_initialized', false);

      if (!isInitialized) {
        // 创建数据库配置
        const STORE_CONFIG:StoreConfig = {
          name: DB_NAME,
          securityLevel: relationalStore.SecurityLevel.S1,
          encrypt: false
        };

        // 获取数据库实例
        this.rdbStore = await relationalStore.getRdbStore(this.context, STORE_CONFIG);

        // 创建错题集合表
        await this.rdbStore.executeSql(`
          CREATE TABLE IF NOT EXISTS mistakes_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            question_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
          )
        `);

        // 创建错题表
        await this.rdbStore.executeSql(`
          CREATE TABLE IF NOT EXISTS mistakes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            question_description TEXT NOT NULL,
            question_answer TEXT NOT NULL,
            question_type TEXT CHECK(question_type IN ('选择题','判断题','主观题')) NOT NULL,
            options TEXT,
            analysis TEXT,
            tags TEXT,
            difficulty INTEGER,
            wrong_times INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime')),
            islike INTEGER DEFAULT 0,
            FOREIGN KEY (collection_id) REFERENCES mistakes_collections(id) ON DELETE CASCADE
          )
        `);
        await this.rdbStore.insert('mistakes_collections', {
          'name': '默认错题集',
          'description': '系统自动创建的默认错题集',
          'question_count': 0
        });
        // 标记已初始化
        await prefs.put('db_initialized', true);
        await prefs.flush();
        hilog.info(DOMAIN, 'testTag', 'Database initialized successfully');
      } else {
        // 直接获取已存在的数据库实例
        this.rdbStore = await relationalStore.getRdbStore(this.context, {
          name: DB_NAME,
          securityLevel: relationalStore.SecurityLevel.S1
        });
      }
    } catch (err) {
      hilog.error(DOMAIN, 'testTag', 'Database init failed: %{public}s', JSON.stringify(err));
    }
  }

  onDestroy() {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageCreate');

    windowStage.loadContent('pages/home', (err) => {
      if (err.code) {
        hilog.error(DOMAIN, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err));
        return;
      }
      hilog.info(DOMAIN, 'testTag', 'Succeeded in loading the content.');
    });
  }

  onWindowStageDestroy() {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');
  }

  onForeground() {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onForeground');
  }

  onBackground() {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onBackground');
  }
}