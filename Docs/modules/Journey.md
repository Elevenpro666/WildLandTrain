# Journey远征模块

版本0.1，Game层，开发代理负责；状态：实现中。

目标：三段闭环、跨站经验与强化保留、两次奖励、胜负与重开；非目标：精英机制、正式平衡、存档与广告。配置在config.mjs，1800/1800/900米为测试路线。沿用战斗速度与起手夹具隔离流程变量。

API：createJourney({stages,credit})创建station态；depart()仅station有效，转battle；finish(snapshot)仅battle且done有效，交接成长及统计，死亡转lost，完成前两段各credit48一次并转arrival，末段转won；arrive()仅arrival有效，段号加一回station。abort()中止战斗进入lost，不给奖励。snapshot()复制状态；dispose()幂等，此后命令拒绝。

Journey为跨段成长快照Owner；Battle当前运行态通过growth快照交接，无共享可变引用。依赖标准语言库及注入Economy.credit，不引用平台或展示；Bootstrap编排既有Arrival、Station及Battle。无异步、事件订阅或自有时钟，唯一帧保持BrowserAdapter。奖励记录上限3、强化字段固定、无击杀废料；收入90+96有界，出售不套利。性能预算待定义，微信真机未验证。

验证：重复finish/arrive不重复发钱，死亡不给段奖，跨站装卸不丢类型强化但未装类型不生效，重开清零、dispose拒绝。浏览器验证两次直接整备页入站及最终结果、小屏可见。M4前明确终段为流程终点，不能标精英完成。
