# 怪池配置框架
2026-09-25；Game层；执行：开发代理。范围：用户要求先落框架，不改变当前战斗。

## 结构
- enemy-pools.mjs：校验并编译定义、怪池、遭遇。不是对象复用池，不管理活体敌人。
- configs/enemies.mjs：普通/飞行、精英和持铁者示例配置。普通值参照当前原型；精英120耐久是未接入的测试建议，非确认运行值。
- 定义：id、name、rank、movement、hp、damage、attackInterval、speed、minChapter。
- 池：id、entries（enemyId、weight）。同一池不允许重复引用。先过滤章节资格，再按权重抽取。
- 遭遇：id、source（type=pool/fixed，id）、count、interval、maxAlive。普通用池，精英/Boss可固定；实际生成器下一轮接入。

## API与边界
createEnemyCatalog(config)复制并冻结配置，初始化失败抛出带原因的Error，不带病运行。getEnemy/getEncounter返回冻结对象或null。pick(encounterId,chapter,random)返回{ok:true,enemy}或{ok:false,reason}；固定项不消费随机数，无合资格怪返回EMPTY_POOL/LOCKED，不降级成其他怪。random由调用者注入，值必须[0,1)，非法值抛错。
只选定义，不扣除count、不执行interval或maxAlive；后续Battle仍是生成、上限、模拟时钟和生命唯一Owner。调用者必须落实遭遇参数，不能把本框架测试视为生成已实现。
单个目录上限256种怪/128池/128遭遇，每池最多256项；加载期拷贝，选取只读循环，无缓存、事件、异步、平台API或新循环。无可变全局状态；无需start/stop，丢弃实例即可释放；无持久化。

## 验收与后续

### 运行接入（2026-09-25）
Battle创建时编译目录（可注入catalog供测试），普通增援按奇偶波引用groundWave/mixedWave，每波遵守count、interval和maxAlive；围站怪引用walker定义。固定Boss引用bossEncounter，保留原入场与禁冲刺行为。
第二段通过elite选项启用一次精英，在首轮增援开始时生成。精英复用地面追击/冲开规则；击杀、冲开出界或驶离均记录结果，只有击杀给掉落。精英与普通怪共享40在场约束，满员延后生成，不删除旧怪。
路线是整次三段远征概览而非每段固定五波：第一段前后半对应两个小怪节点；第二段先精英后小怪；第三段接持铁者。节点变灰表示已通过，不表示全部击杀。进站期间暂不展示战斗路线。当前节点来自Battle/Journey快照，不改变计时刷怪。
新增精英生命120/攻击8每2秒/速度32为测试配置。掉落仍1经验/1废料；未增加新奖励层。
验证重复id/坏引用/非法数值/空池、权重边界、章节过滤、固定选择、不变性和种子可复现。浏览器功能与微信性能本轮不适用/未验证（未接运行链）。下一轮接真实生成、精英及简洁遭遇路线；精英允许冲刺，Boss强制打断且禁止冲刺。
