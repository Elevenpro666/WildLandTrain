# Build展示首版

追加：用户认可交互密度。verify-build-live.cjs检查实际mount的普通刷新、新增组、叠层、全量draw、清空与stop通过。修复全量draw丢失展开状态；按组ID保留，不按索引误开新组。

范围：真实station-prototype战斗入口，不迁M16、不修改战斗、经验或升级数值。buildView只读取upgrades，返回HTML描述。13张卡从既有upgradeCards取得信息；只显示已获项，四组为切割轮/电弧/无人机/通用供能。角标为该组强化总层数，不是武器数。

资源：复用upgrade-saw/arc/drone/supply-v1.svg四个装备组图标；不是13张分支卡均有独立图标。分支名、描述、同卡叠层仅展开后出现。最多四个常驻入口，详情限高滚动。原生details支持键盘，不新增监听/定时器。

生命周期：依附原battleView及浏览器mount；战斗离开随根节点移除。adapter仅在upgrades签名变化时替换Build区域，按组key恢复展开；不会每帧关闭详情。全量draw仍沿用原逻辑，可能收起详情，不改变暂停规则。不新增业务Owner、事件、存档、异步资源流程。

验收：verify-build.mjs空态/已获/分组/叠层测试PASS；verify-build-browser.cjs两档屏宽图标加载、展开、键盘收起PASS，320截图已目检。浏览器测试使用真实createBattle恢复growth数据，不等于手动完整远征获得全部技能。持续刷新保留和新分组插入的动态回归、微信真机未验证。

待审核：右侧四组入口的密度与详情交互。此版为旧战斗UI，不代表M16视觉资产已迁移；新场景统一接入另切片。性能预算待定义，不引入新循环。
