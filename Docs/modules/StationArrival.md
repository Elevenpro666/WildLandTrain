# 自动进站试作契约

动作节奏修订：列车位移随(1-min(1,progress/.95))^1.4衰减，约2.85秒内完成入画和刹车；沿用3秒生命周期，不新增计时。320/390浏览器实时位移断言通过，实际用户端缓存情况尚未确认。

最新呈现修订：取消独立站台页面，Arrival期间直接复用整备view，传入arrivalProgress；中间rail内列车从左进入，进度完成后开放操作。适配器只同步rail内car的transform，不替换整备设备图标。进站期间整备根节点inert，命令仍由Bootstrap拒绝。无需新监听/时钟，旧独立arrivalView不再被装配入口引用。此前独立页暂停按钮取消，后台冻结仍有效。

版本1.0；执行角色：项目开发代理。状态：浏览器闭环已验证，正式模块验收未完成。

目标：成功完成战斗后自动横向进站，车头朝右、从左向右减速停靠，再开放整备。失败不自动进站；不增加奖励、跨站强化或新经济规则。

Game/arrival.mjs拥有elapsed模拟秒、暂停和结束状态，公开createArrival、step(dt)、toggle、snapshot；输入载体快照限1～5节，拷贝保存。配置时长3秒。非法dt忽略，完成后step无副作用；snapshot拷贝输出。实例构造即启动，Bootstrap移除引用即结束，无异步、事件、资源句柄或存档。

Bootstrap复用既有唯一帧调用：Battle完成且hp>0→销毁战斗引用并创建Arrival→Arrival完成→执行现有returnStation命令一次并释放Arrival。阶段输入隔离；进站仅允许暂停。浏览器后台仍由Adapter阻止推进，测试时钟共用同一更新入口。

Presentation只生成横向站台SVG与暂停按钮，复用battle-screen容器；列车车厢身份顺序保留，显示坐标不改变原业务坐标。无额外依赖。免费维修沿用既有下一次Battle初始化满耐久，不引入重复的Train生命系统。

验收：成功自动转场、左右方向、1/5节长度、暂停冻结、非法时间、重复结束、失败不进站、到站装配余额不变、再次出站满耐久。320/390浏览器截图，技能客户端回归。性能预算待真机阶段制定，不声明微信性能PASS。

结果：verify-arrival.cjs、verify-upgrade-flow.cjs、verify-upgrade.cjs、verify-upgrade-effects.mjs PASS。截图output/arrival-320.png已检查。失败分支仅代码审阅，尚缺浏览器死亡用例；五节为实例边界测试，未进行五节浏览器截图。无新资源句柄，重复完成测试PASS；完整生命周期和真机性能未验证。
