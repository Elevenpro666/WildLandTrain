// Stable semantic IDs for the train and booster art currently used by the prototype.
// Hashes are SHA-256 of the source file bytes; assetUrl adds a cache-busting revision.
const artAssets = Object.freeze({
  'train.head.platform': Object.freeze({ path: '../../../美术设计/M11用户车头地表对照/车头空载四格平台候选V1.png', sha256: '116bda7468fceac2bf8b2d0711c2da1650ed18d785b17cdd46accaf3d5a69ccc', status: 'candidate' }),
  'train.head.current': Object.freeze({ path: '../../../美术设计/M11用户车头地表对照/去背景候选.png', sha256: 'ecb7d7a01d0f284f91456627bba643d0605a36c6a66604f3211549bb5f307e95', status: 'candidate' }),
  'train.head.compat': Object.freeze({ path: '../../assets/style-v2/head.png', sha256: 'f648bb84527dbd9d772633f0c8237c3ad82807ba56129f0d3c1053322a5b2bda', status: 'compatibility' }),
  'train.car.platform': Object.freeze({ path: '../../../美术设计/M17同系列平台车厢/车厢空载四格平台候选V1.png', sha256: '9af24a929202e6f3cf29b6ddb966f6b2d63a17a0b74633ebc732943e04359a30', status: 'candidate' }),
  'train.car.current': Object.freeze({ path: '../../../美术设计/M17同系列平台车厢/车厢候选V2.png', sha256: 'cae9523e66f1a25e7de4c58ddef8e7c53b673405a8e9c259bf4adbd50a0a97c3', status: 'candidate' }),
  'train.car.level1V6': Object.freeze({ path: '../../../美术设计/M17同系列平台车厢/车厢现版同系L1候选V6.png', sha256: '16f648ef0e4e97392b936de759078d2f8e68dc215279d5550b39298306e42e22', status: 'candidate' }),
  'train.car.level2V6': Object.freeze({ path: '../../../美术设计/M17同系列平台车厢/车厢现版同系L2候选V6.png', sha256: '2a930763cac8bf0bbf8747e3e7e4a15777a5eb8ed4f4ff80083560e7e49a026d', status: 'candidate' }),
  'train.car.level3V6': Object.freeze({ path: '../../../美术设计/M17同系列平台车厢/车厢现版同系L3候选V6.png', sha256: '1510635fc6f53920a6ed8c696a8d9717a3c5bca3044c5404128e8c632d85100b', status: 'candidate' }),
  'train.car.compat': Object.freeze({ path: '../../assets/style-v3-candidate/long-platform-car-v1.png', sha256: '0ac935d6232036523308865806575f4143bebec5dab58b8ce10210216433d31d', status: 'compatibility' }),
  'booster.rear.base': Object.freeze({ path: '../../../美术设计/M21推进装置/尾排短助推器正俯视候选V3.png', sha256: 'f9bd9bda4ce684d5e74586cec2b10a9ed98691ab4a5d6565b4c60bb562916e17', status: 'candidate' }),
  'booster.rear.turbine': Object.freeze({ path: '../../../美术设计/M21推进装置/尾排短助推器强化涡轮双喷口候选V1.png', sha256: 'bd6bd6aed7b85f87b98f84c1f21dfd90222cdb77ffe0cb0a8bb77be307fdc47a', status: 'candidate' }),
  'booster.rear.rocket': Object.freeze({ path: '../../../美术设计/M21推进装置/尾排短助推器强化火箭喷口候选V2.png', sha256: 'd85502708448fe963066d241e29759f3027122d729b72fd5874446f9fed5fc4e', status: 'candidate' }),
  'booster.sidePod.integrated': Object.freeze({ path: '../../../美术设计/M21推进装置/助推器短舱蓝灰材质原创候选V2.png', sha256: '6806ac3aa17b11358580b582cc9d25b73c49ee254bdfb996d3a9c45450e7d886', status: 'candidate' }),
  'booster.compat': Object.freeze({ path: '../../assets/weapons/boost-module-v1-candidate.png', sha256: '85725ec170b094b4d90fa2745c1d02133ae75b87eb1b4e3b9ea04e1db5e4eef0', status: 'compatibility' }),
  'arc.emitter.basic': Object.freeze({ path: '../../assets/weapons/arc-basic-source-v2.png', sha256: '1d4ca6a11a7d03ce43cbe3122b599bcb31ac0457f9119fc41be3d3ebbe23c741', status: 'candidate' }),
  'arc.emitter.advanced': Object.freeze({ path: '../../assets/weapons/arc-advanced-source-v2.png', sha256: '0a20637735e89efd1d177afdbb1cee4e41c75cd183063647802806300119b231', status: 'candidate' }),
  'arc.upgrade.highVoltageCapacitor': Object.freeze({ path: '../../assets/weapons/arc-high-voltage-capacitor-v1.svg', sha256: 'bc236c214fbaa84001635fe332bf37cd91376d784133526bbe0da207e838cecb', status: 'candidate' }),
  'arc.upgrade.pulseCapacitor': Object.freeze({ path: '../../assets/weapons/arc-pulse-capacitor-v1.svg', sha256: '53fe502291e205e4a33e6fcb8d89087e3ea26d757e3dbd1241310bfd3f651a26', status: 'candidate' }),
  'arc.upgrade.reachConductor': Object.freeze({ path: '../../assets/weapons/arc-reach-conductor-v1.svg', sha256: 'a69e564eac47c13cc9ac194bd42e02d3aec28c3a0d7eccdbe1c7591899f336e7', status: 'candidate' }),
  'arc.upgrade.chainInductionRings': Object.freeze({ path: '../../assets/weapons/arc-count-induction-rings-v2.svg', sha256: '829741c86327ee79edead9ca194fd5e1e0c112983fa76c0532512fd537342095', status: 'candidate' }),
  'arc.emitter.highVoltageSingle': Object.freeze({ path: '../../assets/weapons/arc-highvoltage-single-v2-candidate.png', sha256: '534b576308af22488e5d20302e356936b571630b539d3c2519f2d0d2ccb8c58e', status: 'candidate' }),
  'arc.emitter.highVoltageDual': Object.freeze({ path: '../../assets/weapons/arc-highvoltage-dual-v2-candidate.png', sha256: 'df13c50a0682bb8f83599b516dd05f6ecb0038892fd56b43b1240e292e98cd85', status: 'candidate' }),
  'arc.upgrade.reachAntenna': Object.freeze({ path: '../../assets/battle-state/arc-antenna-v1.svg', sha256: '8c6a1c034267c5bf102c8115aac29d3181b6eb58556cee936749c15f5fd1c4b7', status: 'candidate' }),
  'arc.emitter.seed': Object.freeze({ path: '../../../美术设计/M18电弧挂载验证/电弧武器_单线圈基础态候选V2.png', sha256: 'f13e7638c80fc67b0231e20941a071a5af1a57d42e36c6adcf4e21f47521e364', status: 'candidate' }),
  'arc.emitter.singleFork': Object.freeze({ path: '../../../美术设计/M18电弧挂载验证/电弧单板叉口发射器原创候选V1.png', sha256: 'd83e67dfed03b85696249944ddb60320b86d3db9dfc241a54478739e0a4b7728', status: 'candidate' }),
  'arc.emitter.singleForkBasic': Object.freeze({ path: '../../../美术设计/M18电弧挂载验证/电弧单板基础叉口原创候选V1.png', sha256: '8a83c6bd5707e31dec6039a5b469d4531a57d31ebb1eb29e6af3e60661968fa7', status: 'candidate' }),
  'repel.wall.basic': Object.freeze({ path: '../../assets/weapons/wall-repulsor-basic-topdown-v2-trimmed-candidate.png', sha256: 'd0f557944c2aa0547cbd1f04e0de8665a6c7d180281aaa327aaf4a8c56b39a7f', status: 'candidate' }),
  'repulsor.tslot.basic': Object.freeze({ path: '../../assets/weapons/repulsor-t-slot-basic-v1.svg', sha256: '9870dd9b5918766d008c0480306102af8d0789174110450a0f106cc9a5fba623', status: 'candidate' }),
  'mine.wall.dispenser.basic': Object.freeze({ path: '../../assets/weapons/radiation-mine-dispenser-side-v2-trimmed-candidate.png', sha256: '4517336c1bda562c8fe58df439dbe4f41b9e17c8947e9ad936fb07b7e2687d63', status: 'candidate' }),
  'mine.wall.dispenser.forwardThrow': Object.freeze({ path: '../../assets/weapons/radiation-mine-dispenser-side-v3-forward-throw-trimmed-candidate.png', sha256: 'f3400a63746ac9c180fe769821d599fe61ddc3f140e0d0eecde316aa2ce2d29a', status: 'candidate' })
});

export function assetUrl(id) {
  const asset = artAssets[id];
  if (!asset) throw new Error(`Unknown art asset ID: ${id}`);
  const url = new URL(asset.path, import.meta.url);
  url.searchParams.set('rev', asset.sha256.slice(0, 16));
  return url.href;
}

export { artAssets };
