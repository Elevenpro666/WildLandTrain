# 站内构筑原型

在本目录运行 `python -m http.server 4186 --bind 127.0.0.1`，浏览器打开 http://127.0.0.1:4186 。页面使用模块脚本，不能直接双击HTML启动。

先选车厢查看装备；选中一节车厢后点“选择此车合成”，再点另一节同阶车厢。合成后的装备全部放入周转区，由玩家选择载体后装入，也可出售或确认丢弃。周转为空才能出站。

当前为三段远征流程试作，路线1800/1800/900米，前两段到站各发48废料一次、恢复耐久并保留经验强化；末段仅距离流程终点，精英待接入。死亡或成功进入结算，可重开重置本局。含切割轮、电弧、无人机和单条充能冲刺，冲刺参数未改。

“测试返回”不发奖励、不保留本段新强化，只用于调试。初始90废料与两节满载车厢仍是夹具；所有参数非正式平衡。满载购买进入周转，满编购车可留周转参与合成；再次点击已选车厢可管理。页面刷新会重置，无正式存档、广告和微信入口。F全屏，Esc退出。

当前目标回归：verify-turnover.mjs、verify-turnover-ui.cjs、verify-disposal.cjs、verify-drag.cjs、verify-sprint.cjs、verify-grid.cjs、verify-fixed.cjs、verify-arrival.cjs、verify-upgrade-flow.cjs、verify-journey.mjs、verify-journey-ui.cjs。旧verify.cjs与verify-station-layout.cjs仍基于废弃列表/滚动交互，不属于本轮通过清单；M5整理迁移，不应拿旧断言覆盖新需求。
