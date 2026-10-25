# HUD真实状态接入映射

日期：2026-10-05。状态：源码核对与规则测试完成，尚未实施界面接入。目标是复用现有战斗状态驱动新美术，不给M16另写伤害、经验、技能和冲刺规则。

## 当前入口与边界

station-prototype/src/game/battle.mjs的createBattle提供真实战斗及只读snapshot；wechat-game/src/session.mjs已经复用同一战斗工厂，编排站点、战斗、到站与结算。M16仍是独立美术夹具，出土、碰撞、攻击、掉落不等于正式规则已迁移。

下一步先建立平台无关的HUD只读投影，再由现有游戏会话驱动展示。不能在M16同时运行另一套真实战斗和原演示实体，造成“画面打的是甲、结算死的是乙”。本轮不迁移工程、不替换入口、不新增循环。

## 数据映射

| 展示 | 已有来源 | 接入约束或缺口 |
|---|---|---|
| 车头左侧整列耐久 | battle.snapshot().hp | 只有一份整体hp；初值位于battle内部tuning.hp=300。快照缺maxHp，需由同一配置输出，UI禁止再硬编码300。不得生成分车厢血条 |
| 经验晶体及进度 | experience、level、nextUpgrade、growth | experience是累计值；nextUpgrade是累计门槛，不可直接当成本级经验需求。需要明确本级起始门槛再算填充比，避免升级后进度不归零 |
| 绿色能源余额 | Economy.balance，经session的station.cash可读 | scrapEarned只是本段获得量，不是钱包余额。只改图标，内部scrap与经济规则不改 |
| 已获Build | upgrades＋upgradeCards | 只显示层数大于0的项目；元数据给出weapon/name/description。无weapon的supply归通用组，不误归电弧；按武器归组、同项合并层数 |
| 无敌冲刺 | sprint.energy、invincible、sprintLocked、paused、done、choices | 只显示现有充能；操作调用原release或session.action，不通过动画开始来决定无敌。Boss封锁、选卡、暂停、结束时不能误触发 |
| 小地图 | enemies的id、x、y、hp、rank；Boss/精英独立状态 | 需与新场景共用世界到屏幕映射，排除死亡；地底怪仅在正式行为状态具备后处理。不能复用M16按时间生成的点冒充真实敌人 |
| 遭遇进度 | journey.stage、wave.number、elite、boss | waves.waveAt是循环警告/进攻/喘息阶段，不是完整远征百分比。已有wave-view以远征段数和精英/Boss组合映射五节点，应提取其规则而不是复制计时条；节点文案最终由关卡配置提供 |
| 掉落与收取 | lootFeedback、经验和经济结算 | 真实规则在击杀时结算；飞行仅反馈。禁止沿用M16第7秒假死亡/假奖励，不因飞行结束重复加钱 |

## 首个实施切片

1. 战斗快照补充maxHp及本级经验起始门槛，值由已有游戏规则维护，不由HUD推测。
2. 建立无DOM/Canvas依赖的HUD投影，只产出耐久比例、经验进度、钱包、Build列表与冲刺可用状态；缺省/无战斗状态不伪造满血。
3. 用真实createBattle/session快照测试投影，不改变战斗随机数、数值和推进时钟。
4. 再在既有游戏入口接车头左侧耐久与右侧Build展示。涉及M16美术整体迁入时另写具体迁移范围，保留现有入口回退。

本切片不同时接全部美术、寻路、兵种动画或平台SDK。Build技能图标仍需逐项资源映射；不能拿电弧图标代表所有技能，也不以文字列表代替最终视觉。

## 本轮证据

- verify-boss.mjs：PASS，Boss打断/禁止冲刺、暂停及胜负规则。
- verify-branches.mjs：PASS，12分支卡、前置、兜底叠层、经验门槛和重复选择保护。
- verify-waves.mjs：PASS，阶段边界、真实生成阶段、数量上限与暂停。
- 源码核对：PASS，以上字段及缺口已按现有文件核对。
- 新HUD、动态遮挡、微信真机：未验证，本轮没有改界面或业务代码。测试通过只说明现有规则可复用，不代表新接入完成。
