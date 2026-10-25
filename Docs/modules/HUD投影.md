# HUD投影

版本1。Presentation纯函数，入口station-prototype/src/presentation/hud-state.mjs，执行角色开发代理。

范围：真实战斗快照加钱包余额转换为耐久、经验、Build、冲刺状态，不绘图、不处理输入、不结算。依赖Game公开upgradeCards元数据；调用方显式传snapshot和cash。无战斗返回null，无效字段抛错，重复调用无副作用；输出新对象，不能修改游戏权威状态。

战斗快照新增maxHp和levelStartExperience，后者随growth跨站保存；旧growth缺字段时用nextUpgrade减当前upgradeCost恢复起点，初始等级为0。选择升级成功才推进起点，不丢超额经验。血量上限来自原tuning，不改数值。

兼容说明：旧测试允许自定义等级和门槛组合，缺字段推导最小截为0以保留其行为；这不是任意历史存档的精确还原。自定义成长应显式传levelStartExperience。

生命周期/事件/异步/存档：投影无Owner资源或监听，不需启动释放，无事件、无异步、无存档；字段由battle拥有。输出有效期为输入快照时刻。每次遍历固定13项卡定义，不建缓存；真机性能预算待正式接入测量。

验收：初始、升级超额、重复选择、growth恢复、Boss封锁、暂停、空状态和输入输出隔离；既有Boss/分支/波次回归。本轮不接UI，视觉验收不适用。旧原型架构问题不在此扩大重构。

执行结果：verify-hud-state、verify-branches、verify-boss、verify-waves、verify-journey均PASS。纯投影无平台API和资源生命周期；UI/真机性能未验证。当前入口仅由测试消费，下一轮接入真实展示调用方。
