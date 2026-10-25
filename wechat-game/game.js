(() => {
  // ../station-prototype/config.mjs
  var lootConfig = Object.freeze({ scrapPerKill: 1 });
  var journeyStages = Object.freeze([
    { distance: 1800, reward: 48 },
    { distance: 1800, reward: 48 },
    { distance: 900, reward: 0, boss: true }
  ]);
  var config = Object.freeze({
    cash: 90,
    cartPrice: 30,
    capacities: [0, 4, 6, 10],
    maxCarts: 5,
    cartSellValues: [0, 12, 24, 48],
    modules: [
      { key: "saw", name: "\u5207\u5272\u8F6E", size: 2, price: 20, sellValue: 8, icon: "\u25C9" },
      { key: "arc", name: "\u7535\u5F27\u7EBF\u5708", size: 1, price: 12, sellValue: 4, icon: "\u03DF" },
      { key: "drone", name: "\u65E0\u4EBA\u673A\u8231", size: 3, price: 32, sellValue: 12, icon: "\u2723" },
      { key: "boost", name: "\u52A8\u529B\u52A9\u63A8\u5668", size: 1, price: 20, sellValue: 8, icon: "\u2191" }
    ]
  });

  // ../station-prototype/src/game/train.mjs
  function createTrain(config3) {
    let nextId = 10;
    const reserveCars = [];
    const carriers = [{ id: "head", name: "\u8F66\u5934", level: 0, capacity: 4 }, { id: "c1", name: "\u8F66\u53A2 01", level: 1, capacity: 4 }, { id: "c2", name: "\u8F66\u53A2 02", level: 1, capacity: 4 }];
    const equipment = [["e1", "arc", "head"], ["e2", "saw", "c1"], ["e3", "saw", "c1"], ["e4", "drone", "c2"], ["e5", "arc", "c2"]].map(([id, key, carrier]) => ({ ...config3.modules.find((m) => m.key === key), id, carrier, paid: 0 }));
    const find = (id) => carriers.find((c) => c.id === id);
    const findCart = (id) => find(id) || reserveCars.find((c) => c.id === id);
    const used = (id) => equipment.filter((e) => e.carrier === id).reduce((n, e) => n + e.size, 0);
    return {
      snapshot: () => ({ carriers: carriers.map((c) => ({ ...c, used: used(c.id) })), reserveCars: reserveCars.map((c) => ({ ...c, used: 0 })), equipment: equipment.map((e) => ({ ...e })) }),
      canAdd: () => carriers.length - 1 < config3.maxCarts,
      add() {
        const id = "c" + nextId++;
        const list = this.canAdd() ? carriers : reserveCars;
        list.push({ id, name: "\u8F66\u53A2 " + id.slice(1), level: 1, capacity: config3.capacities[1] });
        return id;
      },
      attachCart(id) {
        const i = reserveCars.findIndex((c) => c.id === id);
        if (i < 0 || !this.canAdd()) return false;
        carriers.push(reserveCars.splice(i, 1)[0]);
        return true;
      },
      detachCart(id) {
        const i = carriers.findIndex((c) => c.id === id && c.level > 0);
        if (i < 0) return false;
        equipment.forEach((e) => {
          if (e.carrier === id) e.carrier = null;
        });
        reserveCars.push(carriers.splice(i, 1)[0]);
        return true;
      },
      removeCart(id) {
        const c = findCart(id);
        if (!c || c.level === 0) return null;
        equipment.forEach((e) => {
          if (e.carrier === id) e.carrier = null;
        });
        const list = find(id) ? carriers : reserveCars;
        return list.splice(list.indexOf(c), 1)[0];
      },
      canInstall(id, size) {
        const c = find(id);
        return !!c && used(id) + size <= c.capacity;
      },
      buy(key, id) {
        const m = config3.modules.find((m2) => m2.key === key);
        if (!m) return false;
        equipment.push({ ...m, id: "e" + nextId++, carrier: this.canInstall(id, m.size) ? id : null, paid: m.price });
        return true;
      },
      move(id, to) {
        const e = equipment.find((e2) => e2.id === id);
        if (!e) return false;
        if (e.carrier === to) return true;
        if (to !== null && !this.canInstall(to, e.size)) return false;
        e.carrier = to;
        return true;
      },
      remove(id) {
        const i = equipment.findIndex((e) => e.id === id);
        if (i < 0) return null;
        return equipment.splice(i, 1)[0];
      },
      merge(a, b) {
        let ca = findCart(a), cb = findCart(b);
        if (!ca || !cb || a === b || ca.level === 0 || ca.level !== cb.level || ca.level >= config3.capacities.length - 1) return false;
        if (!find(ca.id) && find(cb.id)) [ca, cb] = [cb, ca];
        equipment.forEach((e) => {
          if (e.carrier === a || e.carrier === b) e.carrier = null;
        });
        ca.level++;
        ca.capacity = config3.capacities[ca.level];
        const list = find(cb.id) ? carriers : reserveCars;
        list.splice(list.indexOf(cb), 1);
        return true;
      }
    };
  }

  // ../station-prototype/src/game/economy.mjs
  function createEconomy(initial) {
    let cash = initial;
    return {
      balance: () => cash,
      purchase(cost, commit) {
        if (!Number.isFinite(cost) || cost < 0 || cash < cost) return false;
        if (commit() === false) return false;
        cash -= cost;
        return true;
      },
      credit(value) {
        if (!Number.isInteger(value) || value < 0) throw Error("Invalid credit");
        cash += value;
      }
    };
  }

  // ../station-prototype/src/game/station.mjs
  function createStation({ train, economy, config: config3 }) {
    let mode = "station", lastId = 0, disposed = false;
    const snapshot = () => ({ mode, cash: economy.balance(), ...train.snapshot(), shop: config3.modules.map((m) => ({ ...m })), cartPrice: config3.cartPrice, cartSellValues: [...config3.cartSellValues] });
    return { snapshot, dispose() {
      disposed = true;
    }, dispatch(cmd) {
      if (disposed) return { ok: false, message: "\u6574\u5907\u5DF2\u5173\u95ED" };
      if (!cmd || !Number.isSafeInteger(cmd.commandId) || cmd.commandId <= lastId) return { ok: false, message: "\u91CD\u590D\u6216\u8FC7\u671F\u64CD\u4F5C" };
      lastId = cmd.commandId;
      if (cmd.type === "returnStation" && mode === "ready") {
        mode = "station";
        return { ok: true, message: "\u5DF2\u8FD4\u56DE\u6574\u5907\uFF0C\u88C5\u5907\u4E0E\u4F59\u989D\u4FDD\u7559" };
      }
      if (mode !== "station") return { ok: false, message: "\u5DF2\u7ECF\u5B8C\u6210\u51FA\u7AD9\u68C0\u67E5" };
      let ok = false, message = "\u65E0\u6CD5\u6267\u884C\uFF0C\u8BF7\u68C0\u67E5\u9009\u62E9";
      if (cmd.type === "buyCart") {
        const attached = train.canAdd();
        ok = economy.purchase(config3.cartPrice, () => train.add());
        message = ok ? attached ? "\u65B0\u8F66\u53A2\u5DF2\u63A5\u5165" : "\u5DF2\u83B7\u5F97\u8F66\u53A2\uFF0C\u6682\u653E\u5468\u8F6C\u533A\uFF0C\u53EF\u5408\u6210\u6216\u81EA\u884C\u5904\u7406" : "\u5E9F\u6599\u4E0D\u8DB3";
      } else if (cmd.type === "buyModule") {
        const m = config3.modules.find((m2) => m2.key === cmd.key);
        if (!m) message = "\u672A\u77E5\u88C5\u5907";
        else {
          const installed = train.canInstall(cmd.to, m.size);
          ok = economy.purchase(m.price, () => train.buy(cmd.key, cmd.to));
          message = ok ? installed ? "\u88C5\u5907\u5DF2\u5B89\u88C5" : "\u5DF2\u83B7\u5F97\u88C5\u5907\uFF0C\u6682\u653E\u5468\u8F6C\u533A\uFF0C\u88C5\u8F7D\u540E\u751F\u6548" : "\u5E9F\u6599\u4E0D\u8DB3";
        }
      } else if (cmd.type === "move") {
        ok = train.move(cmd.id, cmd.to);
        message = ok ? cmd.to === null ? "\u88C5\u5907\u5DF2\u79FB\u81F3\u5468\u8F6C\u533A" : "\u88C5\u5907\u5DF2\u88C5\u56DE" : "\u8BE5\u88C5\u5907\u4E0D\u5B58\u5728\u6216\u76EE\u6807\u5BB9\u91CF\u4E0D\u8DB3";
      } else if (cmd.type === "merge") {
        ok = train.merge(cmd.a, cmd.b);
        message = ok ? "\u5408\u6210\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u88C5\u56DE\u5468\u8F6C\u88C5\u5907" : "\u53EA\u80FD\u5408\u6210\u4E24\u8282\u540C\u9636\u8F66\u53A2\uFF0C\u6700\u9AD8\u4E09\u7EA7";
      } else if (cmd.type === "attachCart" || cmd.type === "detachCart") {
        ok = train[cmd.type](cmd.id);
        message = ok ? cmd.type === "attachCart" ? "\u8F66\u53A2\u5DF2\u7F16\u5165" : "\u8F66\u53A2\u53CA\u5176\u88C5\u5907\u5DF2\u79FB\u81F3\u5468\u8F6C\u533A" : "\u65E0\u6CD5\u7F16\u5165\u6216\u79FB\u51FA\uFF0C\u8BF7\u68C0\u67E5\u7F16\u7EC4\u4F4D\u7F6E";
      } else if (cmd.type === "sellCart" || cmd.type === "discardCart") {
        const c = train.removeCart(cmd.id);
        ok = !!c;
        if (c && cmd.type === "sellCart") economy.credit(config3.cartSellValues[c.level]);
        message = ok ? "\u8F66\u53A2\u5DF2\u5904\u7F6E\uFF0C\u539F\u88C5\u5907\u4FDD\u7559\u5728\u5468\u8F6C\u533A" : "\u8F66\u53A2\u4E0D\u5B58\u5728\u6216\u4E3A\u8F66\u5934";
      } else if (cmd.type === "sell" || cmd.type === "discard") {
        const e = train.remove(cmd.id);
        ok = !!e;
        if (e && cmd.type === "sell") economy.credit(e.sellValue);
        message = ok ? cmd.type === "sell" ? "\u88C5\u5907\u5DF2\u51FA\u552E" : "\u88C5\u5907\u5DF2\u4E22\u5F03" : "\u88C5\u5907\u5DF2\u4E0D\u5B58\u5728";
      } else if (cmd.type === "depart") {
        const s = train.snapshot();
        if (s.equipment.some((e) => e.carrier === null) || s.reserveCars.length) message = "\u5468\u8F6C\u533A\u8FD8\u6709\u7269\u54C1\uFF0C\u8BF7\u88C5\u8F7D\u3001\u7F16\u5165\u6216\u81EA\u884C\u5904\u7F6E\u540E\u51FA\u7AD9";
        else {
          mode = "ready";
          ok = true;
          message = "\u51FA\u7AD9\u68C0\u67E5\u901A\u8FC7";
        }
      }
      return { ok, message };
    } };
  }

  // ../station-prototype/src/game/sprint.mjs
  var sprintConfig = Object.freeze({ baseDistance: Object.freeze([300, 420, 540]), boostDistance: 120, speed: 100, chargeSeconds: 8 });
  function createSprint(quality = 1, boosters = 0) {
    if (!Number.isInteger(quality) || quality < 1 || quality > 3 || !Number.isInteger(boosters) || boosters < 0) throw new RangeError("Invalid sprint loadout");
    const distance2 = sprintConfig.baseDistance[quality - 1] + boosters * sprintConfig.boostDistance;
    let remaining = distance2, energy = 0, active2 = true;
    return {
      step(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return;
        if (active2) {
          const elapsed = Math.min(dt, remaining / sprintConfig.speed);
          remaining = Math.max(0, remaining - sprintConfig.speed * elapsed);
          dt -= elapsed;
          if (remaining < 1e-8) {
            remaining = 0;
            active2 = false;
          }
        }
        if (!active2) energy = Math.min(100, energy + 100 * dt / sprintConfig.chargeSeconds);
      },
      release() {
        if (active2 || energy < 100) return false;
        energy = 0;
        remaining = distance2;
        active2 = true;
        return true;
      },
      interrupt() {
        const wasActive = active2;
        active2 = false;
        return wasActive;
      },
      snapshot() {
        return { active: active2, energy, remaining, distance: distance2, quality, boosters };
      }
    };
  }

  // ../station-prototype/src/game/waves.mjs
  var waveConfig = Object.freeze({ departure: 3, warning: 4, assault: 14, respite: 6, interval: 0.42, groundFlyingChance: 0.1, mixedFlyingChance: 0.45 });
  for (const key of ["departure", "warning", "assault", "respite", "interval"]) if (!Number.isFinite(waveConfig[key]) || waveConfig[key] <= 0) throw Error("Invalid wave duration");
  for (const key of ["groundFlyingChance", "mixedFlyingChance"]) if (waveConfig[key] < 0 || waveConfig[key] > 1) throw Error("Invalid wave probability");
  function waveAt(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) throw Error("Invalid wave time");
    if (seconds < waveConfig.departure) return { number: 0, phase: "departure", label: "\u51B2\u51FA\u5305\u56F4", remaining: waveConfig.departure - seconds, progress: seconds / waveConfig.departure };
    const length = waveConfig.warning + waveConfig.assault + waveConfig.respite, age = seconds - waveConfig.departure;
    const number = Math.floor(age / length) + 1, local = age % length, mixed = number % 2 === 0;
    const phase = local < waveConfig.warning ? "warning" : local < waveConfig.warning + waveConfig.assault ? "assault" : "respite";
    const start = phase === "warning" ? 0 : phase === "assault" ? waveConfig.warning : waveConfig.warning + waveConfig.assault;
    const duration = waveConfig[phase];
    return { number, phase, label: mixed ? "\u7A7A\u5730\u6DF7\u7F16" : "\u5730\u9762\u56F4\u653B", remaining: duration - (local - start), progress: (local - start) / duration, interval: waveConfig.interval, flyingChance: mixed ? waveConfig.mixedFlyingChance : waveConfig.groundFlyingChance };
  }

  // ../station-prototype/src/game/enemy-pools.mjs
  function createEnemyCatalog(input) {
    const fail = (message) => {
      throw new Error(`Enemy catalog: ${message}`);
    };
    const positive = (n, label) => {
      if (!Number.isFinite(n) || n <= 0) fail(label);
    };
    const integer = (n, label) => {
      positive(n, label);
      if (!Number.isSafeInteger(n)) fail(label);
    };
    const index = (list, limit, label) => {
      if (!Array.isArray(list) || !list.length || list.length > limit) fail(label);
      const map = /* @__PURE__ */ new Map();
      for (const item of list) {
        if (!item || typeof item.id !== "string" || !item.id.trim() || map.has(item.id)) fail(`${label} id`);
        map.set(item.id, item);
      }
      return map;
    };
    if (!input || typeof input !== "object") fail("missing config");
    const enemies = index(input.enemies, 256, "enemies"), pools = index(input.pools, 128, "pools"), encounters = index(input.encounters, 128, "encounters");
    for (const [id, e] of enemies) {
      if (typeof e.name !== "string" || !e.name.trim() || !["normal", "elite", "boss"].includes(e.rank) || !["ground", "flying"].includes(e.movement)) fail(`enemy ${id}`);
      for (const key of ["hp", "damage", "attackInterval", "speed"]) positive(e[key], `${id}.${key}`);
      integer(e.minChapter, `${id}.minChapter`);
      enemies.set(id, Object.freeze({ id, name: e.name, rank: e.rank, movement: e.movement, hp: e.hp, damage: e.damage, attackInterval: e.attackInterval, speed: e.speed, minChapter: e.minChapter }));
    }
    for (const [id, p] of pools) {
      if (!Array.isArray(p.entries) || !p.entries.length || p.entries.length > 256) fail(`pool ${id}`);
      const seen = /* @__PURE__ */ new Set();
      let total = 0;
      const entries = p.entries.map((e) => {
        if (!e || !enemies.has(e.enemyId) || seen.has(e.enemyId)) fail(`pool ${id} reference`);
        positive(e.weight, `pool ${id} weight`);
        seen.add(e.enemyId);
        total += e.weight;
        return Object.freeze({ enemyId: e.enemyId, weight: e.weight });
      });
      if (!Number.isFinite(total)) fail(`pool ${id} total weight`);
      pools.set(id, Object.freeze({ id, entries: Object.freeze(entries) }));
    }
    for (const [id, e] of encounters) {
      if (!e.source || !["pool", "fixed"].includes(e.source.type)) fail(`encounter ${id} source`);
      if (!(e.source.type === "pool" ? pools : enemies).has(e.source.id)) fail(`encounter ${id} reference`);
      integer(e.count, `${id}.count`);
      integer(e.maxAlive, `${id}.maxAlive`);
      positive(e.interval, `${id}.interval`);
      encounters.set(id, Object.freeze({ id, source: Object.freeze({ type: e.source.type, id: e.source.id }), count: e.count, interval: e.interval, maxAlive: e.maxAlive }));
    }
    return Object.freeze({
      getEnemy: (id) => enemies.get(id) || null,
      getEncounter: (id) => encounters.get(id) || null,
      pick(id, chapter, random) {
        integer(chapter, "chapter");
        const encounter = encounters.get(id);
        if (!encounter) return { ok: false, reason: "UNKNOWN_ENCOUNTER" };
        if (encounter.source.type === "fixed") {
          const enemy = enemies.get(encounter.source.id);
          return enemy.minChapter <= chapter ? { ok: true, enemy } : { ok: false, reason: "LOCKED" };
        }
        const entries = pools.get(encounter.source.id).entries;
        let total = 0;
        for (const e of entries) if (enemies.get(e.enemyId).minChapter <= chapter) total += e.weight;
        if (!total) return { ok: false, reason: "EMPTY_POOL" };
        if (typeof random !== "function") fail("random required");
        const value = random();
        if (!Number.isFinite(value) || value < 0 || value >= 1) fail("random must be in [0,1)");
        let threshold = value * total, last2;
        for (const entry of entries) {
          const enemy = enemies.get(entry.enemyId);
          if (enemy.minChapter > chapter) continue;
          last2 = enemy;
          threshold -= entry.weight;
          if (threshold < 0) return { ok: true, enemy };
        }
        return { ok: true, enemy: last2 };
      }
    });
  }

  // ../station-prototype/configs/enemies.mjs
  var enemyCatalogConfig = {
    enemies: [
      { id: "walker", name: "\u6E38\u8361\u8005", rank: "normal", movement: "ground", hp: 24, damage: 4, attackInterval: 1.5, speed: 40, minChapter: 1 },
      { id: "flyer", name: "\u98DE\u884C\u602A", rank: "normal", movement: "flying", hp: 32, damage: 5, attackInterval: 2, speed: 40, minChapter: 1 },
      { id: "brute", name: "\u91CD\u88C5\u7CBE\u82F1", rank: "elite", movement: "ground", hp: 120, damage: 8, attackInterval: 2, speed: 32, minChapter: 1 },
      { id: "ironBearer", name: "\u6301\u94C1\u8005", rank: "boss", movement: "ground", hp: 600, damage: 12, attackInterval: 2, speed: 40, minChapter: 1 }
    ],
    pools: [
      { id: "groundGroup", entries: [{ enemyId: "walker", weight: 90 }, { enemyId: "flyer", weight: 10 }] },
      { id: "mixedGroup", entries: [{ enemyId: "walker", weight: 55 }, { enemyId: "flyer", weight: 45 }] }
    ],
    encounters: [
      { id: "groundWave", source: { type: "pool", id: "groundGroup" }, count: 34, interval: 0.42, maxAlive: 40 },
      { id: "mixedWave", source: { type: "pool", id: "mixedGroup" }, count: 34, interval: 0.42, maxAlive: 40 },
      { id: "eliteEncounter", source: { type: "fixed", id: "brute" }, count: 1, interval: 1, maxAlive: 1 },
      { id: "bossEncounter", source: { type: "fixed", id: "ironBearer" }, count: 1, interval: 1, maxAlive: 1 }
    ]
  };

  // ../station-prototype/config.mjs?v=scrap-1
  var lootConfig2 = Object.freeze({ scrapPerKill: 1 });
  var journeyStages2 = Object.freeze([
    { distance: 1800, reward: 48 },
    { distance: 1800, reward: 48 },
    { distance: 900, reward: 0, boss: true }
  ]);
  var config2 = Object.freeze({
    cash: 90,
    cartPrice: 30,
    capacities: [0, 4, 6, 10],
    maxCarts: 5,
    cartSellValues: [0, 12, 24, 48],
    modules: [
      { key: "saw", name: "\u5207\u5272\u8F6E", size: 2, price: 20, sellValue: 8, icon: "\u25C9" },
      { key: "arc", name: "\u7535\u5F27\u7EBF\u5708", size: 1, price: 12, sellValue: 4, icon: "\u03DF" },
      { key: "drone", name: "\u65E0\u4EBA\u673A\u8231", size: 3, price: 32, sellValue: 12, icon: "\u2723" },
      { key: "boost", name: "\u52A8\u529B\u52A9\u63A8\u5668", size: 1, price: 20, sellValue: 8, icon: "\u2191" }
    ]
  });

  // ../station-prototype/src/game/upgrades.mjs
  var upgradeCards = Object.freeze([
    { id: "sawReach", weapon: "saw", name: "\u52A0\u957F\u652F\u67B6", description: "\u5207\u5272\u8F6E\u5DE6\u53F3\u8986\u76D655\u219270\uFF0C\u6269\u5927\u63A5\u89E6\u8303\u56F4\u3002" },
    { id: "sawLinked", weapon: "saw", requires: "sawReach", name: "\u8054\u52A8\u5200\u76D8", description: "\u589E\u52A0\u5200\u76D8\uFF0C\u6CBF\u8F68\u8986\u76D6\u524D\u540E30\u219250\uFF1B\u540C\u654C\u4E0D\u91CD\u590D\u4F24\u5BB3\u3002" },
    { id: "sawDamage", weapon: "saw", name: "\u5F3A\u5316\u9F7F\u5203", description: "\u5207\u5272\u8F6E\u6BCF\u8F6E\u4F24\u5BB38\u219212\u3002" },
    { id: "sawRate", weapon: "saw", requires: "sawDamage", name: "\u9AD8\u901F\u4F20\u52A8", description: "\u5207\u5272\u8F6E\u653B\u51FB\u95F4\u96940.5\u21920.35\u79D2\u3002" },
    { id: "arcReach", weapon: "arc", name: "\u5EF6\u4F38\u7535\u5F27", description: "\u76EE\u6807\u95F4\u8FDE\u9501\u8DDD\u79BB60\u219290\uFF0C\u66F4\u6613\u8FDE\u63A5\u654C\u7FA4\u3002" },
    { id: "arcCount", weapon: "arc", requires: "arcReach", name: "\u591A\u7EA7\u4F20\u5BFC", description: "\u7535\u5F27\u6700\u591A\u8FDE\u63A53\u21925\u4E2A\u4E0D\u540C\u76EE\u6807\u3002" },
    { id: "arcDamage", weapon: "arc", name: "\u9AD8\u538B\u7ED5\u7EC4", description: "\u7535\u5F27\u9996\u76EE\u6807\u4F24\u5BB312\u219218\u3002" },
    { id: "arcPulse", weapon: "arc", requires: "arcDamage", name: "\u53CC\u8109\u51B2", description: "0.15\u79D2\u540E\u518D\u51FB\u4E2D\u9996\u76EE\u6807\u4E00\u6B21\uFF0C\u4E0D\u518D\u6B21\u8FDE\u9501\u3002" },
    { id: "droneCount", weapon: "drone", name: "\u6269\u7F16\u673A\u7EC4", description: "\u6BCF\u4E2A\u673A\u8231\u65E0\u4EBA\u673A1\u21922\u67B6\uFF0C\u4E0D\u5360\u989D\u5916\u5BB9\u91CF\u3002" },
    { id: "dronePatrol", weapon: "drone", requires: "droneCount", name: "\u534F\u540C\u5DE1\u9632", description: "\u5DE1\u822A\u8303\u56F4180\u2192240\uFF0C\u4F18\u5148\u5206\u6563\u76EE\u6807\u3002" },
    { id: "droneDamage", weapon: "drone", name: "\u5F3A\u5316\u7535\u6781", description: "\u65E0\u4EBA\u673A\u63A5\u654C\u4F24\u5BB314\u219220\u3002" },
    { id: "droneFocus", weapon: "drone", requires: "droneDamage", name: "\u96C6\u4E2D\u4F5C\u4E1A", description: "\u540C\u8231\u96C6\u4E2D\u653B\u51FB\u6700\u5927\u8010\u4E45\u6700\u9AD8\u7684\u76EE\u6807\uFF0C\u4F18\u5148\u4E8E\u5206\u6563\u7B56\u7565\u3002" },
    { id: "supply", name: "\u5F3A\u5316\u4F9B\u80FD", repeatable: true, description: "\u653B\u51FB\u8BBE\u5907\u4F24\u5BB3\u6BCF\u5C42+10%\uFF0C\u4E0D\u5F71\u54CD\u51B2\u523A\u3002\u4E34\u65F6\u515C\u5E95\uFF0C\u540E\u7EED\u6269\u5145\u5206\u652F\u3002" }
  ].map(Object.freeze));
  function eligibleCards(weapons, owned) {
    const types = new Set(weapons.map((w) => w.key));
    const pool = upgradeCards.filter((c) => c.weapon && types.has(c.weapon) && !owned[c.id] && (!c.requires || owned[c.requires]));
    if (pool.length < 3) pool.push(upgradeCards.find((c) => c.id === "supply"));
    return pool;
  }
  var initialUpgrades = () => Object.fromEntries(upgradeCards.map((c) => [c.id, 0]));
  var upgradeCost = (level) => [5, 8, 12, 16, 20, 24][Math.min(5, Math.max(0, level - 1))];
  function weaponStats(key, u) {
    const factor = 1 + 0.1 * (u.supply || 0);
    if (key === "saw") return { damage: (u.sawDamage ? 12 : 8) * factor, interval: u.sawRate ? 0.35 : 0.5, reach: u.sawReach ? 70 : 55, length: u.sawLinked ? 50 : 30 };
    if (key === "arc") return { damage: (u.arcDamage ? 18 : 12) * factor, chainDamage: 8 * factor, interval: 1, range: 120, jump: u.arcReach ? 90 : 60, count: u.arcCount ? 5 : 3, pulse: !!u.arcPulse };
    if (key === "drone") return { damage: (u.droneDamage ? 20 : 14) * factor, interval: 0.8, range: u.dronePatrol ? 240 : 180, speed: 140, contact: 25, count: u.droneCount ? 2 : 1, spread: !!u.dronePatrol, focus: !!u.droneFocus };
    return null;
  }

  // ../station-prototype/src/game/weapon-targets.mjs
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var alive = (e) => e.hp > 0 && !e.knock && !e.exited;
  function arcTargets(origin, enemies, p) {
    const hit = [];
    let from = origin, range = p.range;
    while (hit.length < p.count) {
      const next = enemies.filter((e) => alive(e) && !hit.includes(e) && distance(from, e) <= range).sort((a, b) => distance(from, a) - distance(from, b) || a.id - b.id)[0];
      if (!next) break;
      hit.push(next);
      from = next;
      range = p.jump;
    }
    return hit;
  }
  function sawTargets(origin, enemies, p) {
    return enemies.filter((e) => alive(e) && !e.fly && Math.abs(e.x - origin.x) >= 25 && Math.abs(e.x - origin.x) <= p.reach && Math.abs(e.y - (origin.y + 25)) <= p.length);
  }
  function droneTarget(origin, drone, enemies, p, claimed) {
    const candidates = enemies.filter((e) => alive(e) && distance(origin, e) <= p.range);
    candidates.sort((a, b) => {
      var _a2, _b;
      return p.focus ? ((_a2 = b.maxHp) != null ? _a2 : b.hp) - ((_b = a.maxHp) != null ? _b : a.hp) || a.id - b.id : (p.spread ? Number(claimed.has(a.id)) - Number(claimed.has(b.id)) : 0) || distance(drone, a) - distance(drone, b) || a.id - b.id;
    });
    return candidates[0] || null;
  }

  // ../station-prototype/src/game/battle.mjs
  var tuning = {
    routeLength: 975,
    cruiseSpeed: 25,
    hp: 300,
    crowd: 36,
    knockSpeed: 250,
    knockDuration: 1.1,
    shieldWidth: 78
  };
  var bossTuning = Object.freeze({ entrySeconds: 1.5 });
  function createBattle(loadout, quality = 1, options = {}) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const catalog = (_a2 = options.catalog) != null ? _a2 : createEnemyCatalog(enemyCatalogConfig), chapter = (_b = options.chapter) != null ? _b : 1;
    const definition = (id2) => {
      const result = catalog.pick(id2, chapter, random);
      if (!result.ok) throw Error("Encounter unavailable: " + id2);
      return result.enemy;
    };
    let waveSpawned = 0, spawnWave = 0, elite = null;
    const routeLength = (_c = options.routeLength) != null ? _c : tuning.routeLength;
    if (!Number.isFinite(routeLength) || routeLength <= 0) throw Error("Invalid route length");
    const sprint = createSprint(quality, loadout.equipment.filter((e) => e.carrier && e.key === "boost").length);
    let scroll = 0, impact = 0, knocked = 0, hurtFx = null;
    let boss = null, sprintInterruptedAt = null;
    const complete = () => hp <= 0 || (options.boss ? (boss == null ? void 0 : boss.defeated) === true : scroll >= routeLength);
    const sprintStarts = [0];
    let t = 0, hp = tuning.hp, kills = 0, spawn = 0, id = 0, seed = 17, paused = false;
    let enemies = [], effects = [];
    let lootFeedback = [];
    let scrapEarned = 0;
    if (options.creditLoot !== void 0 && typeof options.creditLoot !== "function") throw Error("Invalid loot callback");
    let level = (_e = (_d = options.growth) == null ? void 0 : _d.level) != null ? _e : 1, nextUpgrade = (_g = (_f = options.growth) == null ? void 0 : _f.nextUpgrade) != null ? _g : 5, choices = [], upgradeId = 0, lastUpgrade = null;
    const priorKills = (_i = (_h = options.growth) == null ? void 0 : _h.experience) != null ? _i : 0;
    let firstSupplyLevel = (_k = (_j = options.growth) == null ? void 0 : _j.firstSupplyLevel) != null ? _k : null;
    const upgrades = { ...initialUpgrades(), ...(_l = options.growth) == null ? void 0 : _l.upgrades };
    const random = () => {
      seed = seed * 1664525 + 1013904223 >>> 0;
      return seed / 4294967296;
    };
    const cars = loadout.carriers.map((c, i) => ({ ...c, x: 210, y: 260 + i * 85 }));
    const makeEnemy = (d, x, y) => ({ id: ++id, definitionId: d.id, name: d.name, rank: d.rank, x, y, hp: d.hp, maxHp: d.hp, damage: d.damage, interval: d.attackInterval, speed: d.speed, attackTimer: 0, fly: d.movement === "flying" });
    for (let i = 0; i < tuning.crowd; i++) enemies.push(makeEnemy(catalog.getEnemy("walker"), 65 + i % 6 * 58 + random() * 12, 35 + Math.floor(i / 6) * 34));
    const weapons = loadout.equipment.filter((e) => e.carrier).map((e) => {
      const c = cars.find((c2) => c2.id === e.carrier);
      return { ...e, x: c.x, y: c.y, timer: 0 };
    });
    const drones = [];
    const pulses = [];
    const syncDrones = () => {
      for (const w of weapons.filter((w2) => w2.key === "drone")) {
        const count = weaponStats("drone", upgrades).count;
        for (let n = drones.filter((d) => d.owner === w.id).length; n < count; n++) drones.push({ id: w.id + "-drone-" + n, owner: w.id, x: w.x + (n ? 35 : -35), y: w.y + 25, timer: 0, target: null });
      }
    };
    syncDrones();
    const hit = (w, e, damage, origin = { x: w.x, y: w.y + 25 }) => {
      if (!alive(e)) return;
      e.hp -= damage;
      effects.push({ weaponId: w.id, targetId: e.id, damage, x: origin.x, y: origin.y, tx: e.x, ty: e.y, key: w.key, life: 0.25 });
    };
    return { choose(cardId, offerId) {
      if (offerId !== upgradeId || !choices.some((c) => c.id === cardId)) return false;
      lastUpgrade = { id: cardId, time: t };
      upgrades[cardId]++;
      level++;
      if (cardId === "supply" && firstSupplyLevel === null) firstSupplyLevel = level;
      choices = [];
      nextUpgrade += upgradeCost(level);
      syncDrones();
      return true;
    }, toggle() {
      if (!choices.length) paused = !paused;
    }, release() {
      if (boss || choices.length || paused || complete() || !sprint.release()) return false;
      sprintStarts.push(t);
      return true;
    }, step(dt) {
      var _a3, _b2, _c2;
      if (choices.length || paused || complete() || !Number.isFinite(dt) || dt <= 0) return;
      t += dt;
      spawn -= dt;
      const sprintBefore = sprint.snapshot(), invincible = sprintBefore.active;
      const fastTime = invincible ? Math.min(dt, sprintBefore.remaining / sprintConfig.speed) : 0;
      scroll = Math.min(routeLength, scroll + fastTime * sprintConfig.speed + (dt - fastTime) * tuning.cruiseSpeed);
      if (!boss) sprint.step(dt);
      impact = Math.max(0, impact - dt);
      const wave = waveAt(t);
      if (wave.number !== spawnWave) {
        spawnWave = wave.number;
        waveSpawned = 0;
      }
      if (wave.phase !== "assault") spawn = 0;
      if (!boss && options.elite && !elite && wave.phase === "assault" && enemies.length < 40) {
        const e = makeEnemy(definition("eliteEncounter"), 335, 235);
        e.elite = true;
        enemies.push(e);
        elite = { id: e.id, status: "active", name: e.name };
      }
      const encounterId = wave.number % 2 === 0 ? "mixedWave" : "groundWave", encounter = catalog.getEncounter(encounterId);
      if (!boss && wave.phase === "assault" && spawn <= 0 && waveSpawned < encounter.count && enemies.length < encounter.maxAlive) {
        spawn = encounter.interval;
        const x = random() < 0.5 ? 15 : 405, y = 170 + random() * 400;
        const e = makeEnemy(definition(encounterId), x, y);
        e.wave = wave.number;
        enemies.push(e);
        waveSpawned++;
      }
      for (const e of enemies) {
        if (e.boss) {
          const age = t - boss.startedAt, p = Math.min(1, age / bossTuning.entrySeconds);
          e.x = 335 - 70 * p;
          e.y = 245 + (cars[0].y + 25 - 245) * p;
          if (p >= 1) {
            e.attackTimer -= dt;
            if (e.attackTimer <= 0) {
              hp = Math.max(0, hp - e.damage);
              hurtFx = { x: cars[0].x + 25, y: cars[0].y + 10, time: t };
              e.attackTimer = e.interval;
            }
          }
          continue;
        }
        if (e.knock) {
          e.knock -= dt;
          e.knockAge += dt;
          e.x += e.vx * dt;
          e.y += 130 * dt;
          e.angle += e.vx * dt * 2;
          if (e.knock <= 0) e.exited = true;
          continue;
        }
        if (invincible && Math.abs(e.x - 210) < tuning.shieldWidth && e.y > cars[0].y - 85 && e.y < cars[cars.length - 1].y + 65) {
          e.knock = tuning.knockDuration;
          e.knockAge = 0;
          e.knockOrigin = { x: e.x, y: e.y };
          e.vx = (e.x < 210 ? -1 : 1) * tuning.knockSpeed;
          e.angle = 0;
          impact = 0.16;
          knocked++;
          continue;
        }
        if (invincible && !e.fly) {
          e.y += sprintConfig.speed * dt;
          continue;
        }
        e.attackTimer = Math.max(0, e.attackTimer - dt);
        const c = cars.reduce((a, b) => Math.hypot(e.x - a.x, e.y - a.y) < Math.hypot(e.x - b.x, e.y - b.y) ? a : b);
        let dx = c.x - e.x, dy = c.y - e.y, d = Math.hypot(dx, dy);
        if (d > 32) {
          e.x += dx / d * e.speed * dt;
          e.y += dy / d * e.speed * dt;
        } else if (!invincible && e.attackTimer <= 0) {
          hp = Math.max(0, hp - e.damage);
          hurtFx = { x: (e.x + c.x) / 2, y: (e.y + c.y) / 2, time: t };
          e.attackTimer = e.interval;
        }
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.remaining -= dt;
        if (pulse.remaining <= 0) {
          const e = enemies.find((e2) => e2.id === pulse.target);
          if (e) hit(pulse.weapon, e, pulse.damage);
          pulses.splice(i, 1);
        }
      }
      for (const w of weapons) {
        w.timer -= dt;
        const p = weaponStats(w.key, upgrades);
        if (!p || w.key === "drone" || w.timer > 0) continue;
        const targets = w.key === "saw" ? sawTargets(w, enemies, p) : arcTargets({ x: w.x, y: w.y + 25 }, enemies, p);
        if (!targets.length) continue;
        w.timer = p.interval;
        let origin = { x: w.x, y: w.y + 25 };
        for (let i = 0; i < targets.length; i++) {
          const e = targets[i];
          hit(w, e, w.key === "arc" && i > 0 ? p.chainDamage : p.damage, origin);
          origin = e;
        }
        if (w.key === "arc" && p.pulse) pulses.push({ weapon: w, target: targets[0].id, damage: p.damage, remaining: 0.15 });
      }
      const claimed = /* @__PURE__ */ new Set();
      for (const d of drones) {
        const w = weapons.find((w2) => w2.id === d.owner);
        const p = weaponStats("drone", upgrades);
        d.timer -= dt;
        const target = droneTarget(w, d, enemies, p, claimed);
        d.target = (_a3 = target == null ? void 0 : target.id) != null ? _a3 : null;
        if (target) claimed.add(target.id);
        const dest = target || { x: w.x + 35, y: w.y + 25 };
        const dx = dest.x - d.x, dy = dest.y - d.y, dist = Math.hypot(dx, dy);
        const travel = Math.min(Math.max(0, dist - (target ? p.contact * 0.8 : 0)), p.speed * dt);
        if (dist > 0) {
          d.x += dx / dist * travel;
          d.y += dy / dist * travel;
        }
        if (target && Math.hypot(target.x - d.x, target.y - d.y) <= p.contact && d.timer <= 0) {
          hit(w, target, p.damage, d);
          d.timer = p.interval;
        }
      }
      if (boss) {
        const target = enemies.find((e) => e.id === boss.id);
        boss.hp = Math.max(0, (_b2 = target == null ? void 0 : target.hp) != null ? _b2 : 0);
        boss.defeated = boss.hp === 0;
      }
      lootFeedback = lootFeedback.filter((drop) => t - drop.time < 0.8);
      let scrapThisStep = 0;
      for (const e of enemies) if (e.hp <= 0) {
        kills++;
        scrapThisStep += lootConfig2.scrapPerKill;
        lootFeedback.push({ id: e.id, x: e.x, y: e.y, time: t, scrap: lootConfig2.scrapPerKill });
      }
      if (lootFeedback.length > 64) lootFeedback.splice(0, lootFeedback.length - 64);
      if ((elite == null ? void 0 : elite.status) === "active") {
        const e = enemies.find((e2) => e2.id === elite.id);
        if ((e == null ? void 0 : e.hp) <= 0) elite.status = "defeated";
        else if (!e || e.exited || e.y >= 700) elite.status = "passed";
      }
      enemies = enemies.filter((e) => e.hp > 0 && e.y < 700 && !e.exited);
      effects.forEach((e) => e.life -= dt);
      effects = effects.filter((e) => e.life > 0);
      if (scrapThisStep) {
        scrapEarned += scrapThisStep;
        (_c2 = options.creditLoot) == null ? void 0 : _c2.call(options, scrapThisStep);
      }
      if (options.boss && !boss && hp > 0 && scroll >= routeLength) {
        const e = makeEnemy(definition("bossEncounter"), 335, 245);
        e.boss = true;
        e.attackTimer = e.interval;
        boss = { id: e.id, name: e.name, hp: e.hp, maxHp: e.hp, startedAt: t, defeated: false };
        if (sprint.interrupt()) sprintInterruptedAt = t;
        enemies.push(e);
      }
      if (!complete() && priorKills + kills >= nextUpgrade) {
        const pool = eligibleCards(weapons, upgrades);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        choices = pool.slice(0, 3);
        if (choices.length) upgradeId++;
      }
    }, snapshot() {
      return JSON.parse(JSON.stringify({ mode: "battle", elite, routeLength, wave: waveAt(t), scrapEarned, lootFeedback, boss, sprintLocked: !!boss, sprintInterruptedAt, routeRemaining: Math.max(0, routeLength - scroll), growth: { level, nextUpgrade, experience: priorKills + kills, upgrades, firstSupplyLevel }, experience: priorKills + kills, lastUpgrade, level, nextUpgrade, choices, upgradeId, upgrades, t, hp, kills, paused, done: complete(), scroll, sprintStarts, impact, knocked, hurtFx, sprint: sprint.snapshot(), invincible: sprint.snapshot().active, cars, weapons, drones, enemies, effects }));
    } };
  }

  // ../station-prototype/src/game/journey.mjs
  function createJourney({ stages, credit }) {
    if (!Array.isArray(stages) || stages.length !== 3 || stages.some((s) => !Number.isFinite(s.distance) || s.distance <= 0 || !Number.isInteger(s.reward) || s.reward < 0)) throw Error("Invalid journey stages");
    const route = stages.map((s) => ({ ...s }));
    let stage = 0, phase = "station", growth = null, disposed = false, kills = 0;
    const completed = [];
    return {
      snapshot() {
        return JSON.parse(JSON.stringify({ stage: stage + 1, total: route.length, phase, growth, kills, completed, rewardTotal: completed.reduce((n, id) => n + route[id - 1].reward, 0), route: route[stage] }));
      },
      depart() {
        if (disposed || phase !== "station") return false;
        phase = "battle";
        return true;
      },
      finish(battle) {
        var _a2;
        if (disposed || phase !== "battle" || !(battle == null ? void 0 : battle.done) || !battle.growth || !Number.isFinite(battle.hp) || !Number.isInteger(battle.kills) || battle.kills < 0 || !Number.isFinite(battle.routeRemaining) || battle.routeRemaining < 0 || battle.hp > 0 && battle.routeRemaining > 0) return false;
        if (battle.hp > 0 && route[stage].boss && !((_a2 = battle.boss) == null ? void 0 : _a2.defeated)) return false;
        growth = JSON.parse(JSON.stringify(battle.growth));
        kills += battle.kills;
        if (battle.hp <= 0) {
          phase = "lost";
          return true;
        }
        completed.push(stage + 1);
        if (route[stage].reward) credit(route[stage].reward);
        phase = stage === route.length - 1 ? "won" : "arrival";
        return true;
      },
      arrive() {
        if (disposed || phase !== "arrival") return false;
        stage++;
        phase = "station";
        return true;
      },
      abort() {
        if (disposed || phase !== "battle") return false;
        phase = "lost";
        return true;
      },
      debugReturn() {
        if (disposed || phase !== "battle") return false;
        phase = "station";
        return true;
      },
      dispose() {
        disposed = true;
      }
    };
  }

  // ../station-prototype/src/game/arrival.mjs
  var arrivalConfig = Object.freeze({ duration: 3 });
  function createArrival(carriers) {
    if (!Array.isArray(carriers) || carriers.length < 1 || carriers.length > 6) throw new Error("Invalid arrival train");
    const cars = carriers.map((c) => ({ id: c.id, level: c.level }));
    let elapsed = 0, paused = false;
    return {
      step(dt) {
        if (!paused && Number.isFinite(dt) && dt > 0) elapsed = Math.min(arrivalConfig.duration, elapsed + dt);
      },
      toggle() {
        if (elapsed < arrivalConfig.duration) paused = !paused;
      },
      snapshot() {
        return { mode: "arrival", elapsed, paused, done: elapsed >= arrivalConfig.duration, progress: elapsed / arrivalConfig.duration, cars: cars.map((c) => ({ ...c })), coordinate: "screen x right, y down; locomotive faces right" };
      }
    };
  }

  // src/session.mjs
  function createSession() {
    let station, economy, journey, battle = null, arrival = null, seq = 0, selected = "c1", mergeFrom = null, confirm = null, message = "", result = null;
    function reset() {
      station == null ? void 0 : station.dispose();
      journey == null ? void 0 : journey.dispose();
      economy = createEconomy(config.cash);
      station = createStation({ config, train: createTrain(config), economy });
      journey = createJourney({ stages: journeyStages, credit: (amount) => economy.credit(amount) });
      battle = null;
      arrival = null;
      seq = 0;
      selected = "c1";
      mergeFrom = null;
      confirm = null;
      message = "";
      result = null;
    }
    reset();
    const send = (command) => {
      const response = station.dispatch({ ...command, commandId: ++seq });
      message = response.message;
      return response.ok;
    };
    const state = () => {
      var _a2, _b;
      return { mode: result ? "result" : arrival ? "arrival" : battle ? "battle" : "station", station: station.snapshot(), journey: journey.snapshot(), battle: (_a2 = battle == null ? void 0 : battle.snapshot()) != null ? _a2 : null, arrival: (_b = arrival == null ? void 0 : arrival.snapshot()) != null ? _b : null, selected, mergeFrom, confirm, message, result };
    };
    function action(input) {
      if (!input || !input.type) return false;
      if (result) {
        if (input.type === "reset") {
          reset();
          return true;
        }
        return false;
      }
      if (arrival) return false;
      if (battle) {
        if (input.type === "sprint") return battle.release();
        if (input.type === "choose") {
          const s = battle.snapshot();
          return battle.choose(input.id, s.upgradeId);
        }
        return false;
      }
      if (confirm) {
        if (input.type === "cancel") {
          confirm = null;
          return true;
        }
        if (input.type === "confirm") {
          const pending = confirm;
          confirm = null;
          mergeFrom = null;
          return send(pending);
        }
        return false;
      }
      if (input.type === "selectCar") {
        selected = input.id;
        message = "";
        return true;
      }
      if (input.type === "buyCart") return send({ type: "buyCart" });
      if (input.type === "buyModule") return send({ type: "buyModule", key: input.key, to: selected });
      if (input.type === "stash") return send({ type: "move", id: input.id, to: null });
      if (input.type === "install") return send({ type: "move", id: input.id, to: selected });
      if (input.type === "attachCart") return send({ type: "attachCart", id: input.id });
      if (input.type === "sell") {
        confirm = { type: "sell", id: input.id };
        return true;
      }
      if (input.type === "sellCart") {
        confirm = { type: "sellCart", id: input.id };
        return true;
      }
      if (input.type === "mergeStart") {
        mergeFrom = input.id;
        message = "\u518D\u70B9\u4E00\u8282\u540C\u7EA7\u8F66\u53A2";
        return true;
      }
      if (input.type === "mergeWith") {
        const cars = [...station.snapshot().carriers, ...station.snapshot().reserveCars];
        const from = cars.find((c) => c.id === mergeFrom), to = cars.find((c) => c.id === input.id);
        if (!from || !to || from.id === to.id || from.level !== to.level || from.level === 0 || from.level >= 3) {
          message = "\u53EA\u80FD\u5408\u6210\u4E24\u8282\u4E0D\u540C\u7684\u540C\u7EA7\u8F66\u53A2";
          return false;
        }
        confirm = { type: "merge", a: from.id, b: to.id };
        return true;
      }
      if (input.type === "depart") {
        if (!send({ type: "depart" })) return false;
        if (!journey.depart()) return false;
        const j = journey.snapshot();
        battle = createBattle(station.snapshot(), 1, { routeLength: j.route.distance, growth: j.growth, boss: j.route.boss, elite: j.stage === 2, creditLoot: (amount) => economy.credit(amount) });
        return true;
      }
      return false;
    }
    function step(dt) {
      if (arrival) {
        arrival.step(dt);
        if (arrival.snapshot().done) {
          arrival = null;
          journey.arrive();
          send({ type: "returnStation" });
          message = "\u5230\u7AD9\u4FEE\u590D\u5B8C\u6210\uFF0C\u5F3A\u5316\u4FDD\u7559";
        }
        return;
      }
      if (!battle || !Number.isFinite(dt) || dt <= 0) return;
      battle.step(dt);
      const end = battle.snapshot();
      if (end.done) {
        journey.finish(end);
        const phase = journey.snapshot().phase;
        if (phase === "arrival") arrival = createArrival(end.cars);
        else result = { win: phase === "won", kills: journey.snapshot().kills };
        battle = null;
      }
    }
    return { state, action, step, reset };
  }

  // src/render.mjs
  var ink = "#20252a";
  var paper = "#e8e5da";
  var dark = "#303843";
  var gold = "#e7ae42";
  var cyan = "#55d8e7";
  var names = { saw: "\u5207\u5272\u8F6E", arc: "\u7535\u5F27", drone: "\u65E0\u4EBA\u673A", boost: "\u52A9\u63A8\u5668" };
  function createRenderer(canvas2, ctx2, images2) {
    let W = 390, H = 844, hits = [];
    const box = (x, y, w, h, fill = paper, stroke = ink, r = 8) => {
      const R = Math.min(r, w / 2, h / 2);
      ctx2.beginPath();
      ctx2.moveTo(x + R, y);
      ctx2.lineTo(x + w - R, y);
      ctx2.quadraticCurveTo(x + w, y, x + w, y + R);
      ctx2.lineTo(x + w, y + h - R);
      ctx2.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
      ctx2.lineTo(x + R, y + h);
      ctx2.quadraticCurveTo(x, y + h, x, y + h - R);
      ctx2.lineTo(x, y + R);
      ctx2.quadraticCurveTo(x, y, x + R, y);
      ctx2.closePath();
      ctx2.fillStyle = fill;
      ctx2.fill();
      if (stroke) {
        ctx2.strokeStyle = stroke;
        ctx2.lineWidth = 2;
        ctx2.stroke();
      }
    };
    const line = (x, y, X, Y, color = ink, width = 2) => {
      ctx2.strokeStyle = color;
      ctx2.lineWidth = width;
      ctx2.beginPath();
      ctx2.moveTo(x, y);
      ctx2.lineTo(X, Y);
      ctx2.stroke();
    };
    const txt = (value, x, y, size = 16, color = ink, align = "left", weight = "normal") => {
      ctx2.fillStyle = color;
      ctx2.font = `${weight} ${size}px sans-serif`;
      ctx2.textAlign = align;
      ctx2.textBaseline = "middle";
      ctx2.fillText(String(value), x, y);
    };
    const picture = (name, x, y, w, h, flip = false) => {
      const im = images2[name];
      if ((im == null ? void 0 : im.loaded) && im.width) {
        ctx2.save();
        if (flip) {
          ctx2.translate(x + w, y);
          ctx2.scale(-1, 1);
          ctx2.drawImage(im, 0, 0, w, h);
        } else ctx2.drawImage(im, x, y, w, h);
        ctx2.restore();
        return true;
      }
      return false;
    };
    const button = (label, x, y, w, h, action, kind = "light") => {
      box(x, y, w, h, kind === "dark" ? dark : kind === "gold" ? gold : "#f6f4ea", kind === "dark" ? null : ink, 8);
      txt(label, x + w / 2, y + h / 2, 17, kind === "dark" ? "#fff" : ink, "center", "bold");
      hits.push({ x, y, w, h, action });
    };
    const hit = (x, y, w, h, action) => hits.push({ x, y, w, h, action });
    const icon = (key, x, y, size) => {
      if (key === "boost") {
        txt("\u2191", x + size / 2, y + size / 2, size * 0.78, ink, "center", "bold");
        return;
      }
      if (!picture(key, x, y, size, size)) txt({ saw: "\u25C9", arc: "\u03DF", drone: "\u2723" }[key], x + size / 2, y + size / 2, size * 0.7, ink, "center");
    };
    const bg = () => {
      ctx2.fillStyle = paper;
      ctx2.fillRect(0, 0, W, H);
    };
    const header = (left, right) => {
      box(12, 14, W - 24, 49, "#f2efe5", ink, 7);
      txt(left, 26, 39, 20, ink, "left", "bold");
      txt(right, W - 24, 39, 15, ink, "right", "bold");
    };
    const hash = (n) => {
      let x = n * 1664525 + 1013904223 >>> 0;
      x ^= x >>> 16;
      return x / 4294967296;
    };
    function earthBlob(cx, cy, rx, ry, color, seed) {
      ctx2.beginPath();
      for (let i = 0; i < 15; i++) {
        const a = i * Math.PI * 2 / 15, r = 0.58 + hash(seed * 17 + i) * 0.72, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
        if (i === 0) ctx2.moveTo(x, y);
        else ctx2.lineTo(x, y);
      }
      ctx2.closePath();
      ctx2.fillStyle = color;
      ctx2.fill();
    }
    function wasteland(scroll) {
      ctx2.fillStyle = "#d5d3c9";
      ctx2.fillRect(-180, -100, 780, 1250);
      const unit = 290, offset = scroll * 0.62 % unit, index = Math.floor(scroll * 0.62 / unit);
      for (let j = -2; j < 6; j++) {
        const id = j - index, y = j * unit + offset, lx = -40 + hash(id * 7) * 100, rx = 390 - hash(id * 11) * 70;
        earthBlob(lx, y + hash(id * 3) * 95, 120 + hash(id * 5) * 53, 86 + hash(id * 13) * 48, "#aeb9bf", id * 3);
        earthBlob(lx + 57, y + 53 + hash(id * 17) * 72, 74, 77, "#aeb9bf", id * 3 + 19);
        if (id % 3 !== 0) {
          earthBlob(rx, y + 116 + hash(id * 23) * 95, 113 + hash(id * 29) * 45, 95 + hash(id * 37) * 54, "#b7b9b2", id * 5 + 1);
          earthBlob(rx - 42, y + 95, 64, 72, "#b7b9b2", id * 5 + 7);
        }
        if (id % 2 === 0) earthBlob(18 + hash(id * 19) * 385, y + 212, 75, 36, "#c5c4b9", id * 13 + 2);
        for (let k = 0; k < 5; k++) {
          const x = 14 + hash(id * 31 + k * 13) * 390, py = y + 15 + hash(id * 23 + k * 17) * 260, size = 5 + hash(id * 37 + k * 7) * 10;
          ctx2.fillStyle = k === 0 ? "#818a90" : "#969991";
          ctx2.beginPath();
          ctx2.moveTo(x - size, py + size * 0.45);
          ctx2.lineTo(x - size * 0.45, py - size * 0.5);
          ctx2.lineTo(x + size * 0.5, py - size * 0.4);
          ctx2.lineTo(x + size, py + size * 0.4);
          ctx2.closePath();
          ctx2.fill();
        }
        if (id % 3 === 0) {
          ctx2.fillStyle = "#5c6266";
          ctx2.fillRect(3, y + 68, 18, 24);
          ctx2.fillStyle = "#788087";
          ctx2.fillRect(5, y + 64, 20, 7);
        }
        if (id % 4 === 1) {
          ctx2.fillStyle = "#575f63";
          ctx2.fillRect(391, y + 35, 25, 16);
          ctx2.fillStyle = "#7e8180";
          ctx2.fillRect(382, y + 32, 25, 6);
        }
      }
    }
    function battleMount(w, t) {
      if (w.key === "saw") {
        const x = w.x + 48, y = w.y + 1;
        line(w.x + 23, w.y + 7, x - 10, y, "#303943", 9);
        ctx2.fillStyle = "#aeb8b8";
        ctx2.strokeStyle = ink;
        ctx2.lineWidth = 4;
        ctx2.beginPath();
        ctx2.arc(x, y, 18, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.stroke();
        for (let i = 0; i < 9; i++) {
          const a = i * Math.PI * 2 / 9 + t * 5;
          line(x + Math.cos(a) * 17, y + Math.sin(a) * 17, x + Math.cos(a) * 24, y + Math.sin(a) * 24, "#263039", 4);
        }
        ctx2.fillStyle = "#5ad7de";
        ctx2.beginPath();
        ctx2.arc(x, y, 5, 0, Math.PI * 2);
        ctx2.fill();
        return;
      }
      if (w.key === "arc") {
        for (const side of [-1, 1]) {
          line(w.x + side * 17, w.y + 4, w.x + side * 23, w.y - 23, "#222c33", 7);
          ctx2.fillStyle = cyan;
          ctx2.beginPath();
          ctx2.arc(w.x + side * 23, w.y - 25, 5, 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.fillStyle = "#263944";
        ctx2.beginPath();
        ctx2.arc(w.x, w.y - 1, 9, 0, Math.PI * 2);
        ctx2.fill();
        return;
      }
      if (w.key === "drone") {
        icon(w.key, w.x - 20, w.y - 18, 40);
        return;
      }
      ctx2.fillStyle = gold;
      ctx2.beginPath();
      ctx2.moveTo(w.x - 12, w.y + 33);
      ctx2.lineTo(w.x, w.y + 52 + Math.sin(t * 16) * 7);
      ctx2.lineTo(w.x + 12, w.y + 33);
      ctx2.closePath();
      ctx2.fill();
    }
    function station(s) {
      bg();
      const st = s.station, carriers = st.carriers, reserve = st.reserveCars, arriving = s.mode === "arrival", selected = [...carriers, ...reserve].find((c) => c.id === s.selected) || carriers[0], equipped = st.equipment.filter((e) => e.carrier === selected.id), turnover = st.equipment.filter((e) => e.carrier === null);
      header("\u5E9F\u571F\u6574\u5907\u7AD9", `${st.cash} \u25C8`);
      txt(`${selected.name}  Lv.${selected.level}   ${selected.used}/${selected.capacity}`, 20, 82, 17, ink, "left", "bold");
      box(14, 101, W - 28, 137, "#dcdacf", "#6a6c60", 8);
      for (let i = 0; i < selected.capacity; i++) {
        const col = i % 5, row = Math.floor(i / 5), slotW = 62, gap = 8, x = 25 + col * (slotW + gap), y = 112 + row * 58;
        box(x, y, slotW, 51, "#eeece2", "#9c9d90", 6);
      }
      let used = 0;
      for (const e of equipped) {
        const x = 25 + used % 5 * 70, y = 112 + Math.floor(used / 5) * 58;
        const w = Math.min(e.size, 5 - used % 5) * 62 + (Math.min(e.size, 5 - used % 5) - 1) * 8;
        box(x, y, w, 51, "#fbf8eb", ink, 6);
        icon(e.key, x + 5, y + 6, 37);
        txt(e.size > 1 ? `\xD7${e.size}` : "", x + w - 5, y + 36, 13, ink, "right");
        hit(x, y, w, 51, { type: "stash", id: e.id });
        used += e.size;
      }
      txt("\u70B9\u88C5\u5907\u79FB\u5165\u5468\u8F6C \xB7 \u70B9\u5468\u8F6C\u88C5\u5907\u88C5\u5165\u6240\u9009\u8F66\u53A2", 19, 253, 13, "#63675e");
      const trainTop = 281, trainBottom = H - 316, trainY = (trainTop + trainBottom) / 2;
      box(14, trainTop, W - 28, Math.max(100, trainBottom - trainTop), "#d5d4c8", null, 8);
      line(24, trainY - 24, W - 24, trainY - 24, "#797e73", 4);
      line(24, trainY + 24, W - 24, trainY + 24, "#797e73", 4);
      const count = carriers.length, space = Math.min(65, (W - 65) / count), start = W / 2 - (count - 1) * space / 2;
      carriers.forEach((c, i) => {
        const x = start + (count - 1 - i) * space - (arriving ? (1 - s.arrival.progress) * (W + 100) : 0), y = trainY;
        const isHead = i === 0;
        ctx2.save();
        ctx2.translate(x, y);
        ctx2.rotate(Math.PI / 2);
        if (!picture(isHead ? "head" : "car", -24, -34, 48, 68)) {
          box(-22, -30, 44, 60, "#898d80", ink, 4);
        }
        ctx2.restore();
        if (c.id === selected.id) {
          ctx2.strokeStyle = gold;
          ctx2.lineWidth = 4;
          ctx2.strokeRect(x - 29, y - 40, 58, 80);
        }
        txt(isHead ? "\u8F66\u5934" : `L${c.level}`, x, y + 49, 13, ink, "center", "bold");
        hit(x - 30, y - 42, 60, 89, { type: s.mergeFrom ? "mergeWith" : "selectCar", id: c.id });
      });
      if (reserve.length) {
        txt("\u5F85\u7F16", 24, trainBottom - 20, 13, ink);
        reserve.slice(0, 3).forEach((c, i) => {
          const x = 70 + i * 70, y = trainBottom - 38;
          box(x, y, 58, 32, "#f3efe1", ink, 4);
          txt(`L${c.level}`, x + 29, y + 16, 14, ink, "center");
          hit(x, y, 58, 32, { type: s.mergeFrom ? "mergeWith" : "selectCar", id: c.id });
        });
      }
      if (arriving) txt("\u5217\u8F66\u9A76\u5165\u6574\u5907\u7AD9 \u2192", W / 2, trainTop + 25, 15, ink, "center", "bold");
      else if (s.message) txt(s.message, W / 2, trainTop + 25, 13, "#654d35", "center");
      const bottom = H - 302;
      box(14, bottom, W - 28, 102, "#eeeadd", ink, 8);
      txt(`\u5468\u8F6C ${turnover.length} \u4EF6${reserve.length ? " \xB7 \u5F85\u7F16 " + reserve.length + " \u8282" : ""}`, 25, bottom + 21, 16, ink, "left", "bold");
      turnover.slice(0, 5).forEach((e, i) => {
        const x = 25 + i * 69, y = bottom + 38;
        box(x, y, 60, 61, "#faf7ee", ink, 6);
        icon(e.key, x + 5, y + 5, 36);
        txt(`${e.size}\u683C`, x + 53, y + 47, 12, ink, "right");
        hit(x, y, 60, 61, { type: "install", id: e.id });
        box(x + 42, y + 1, 18, 20, "#f2e5d8", "#9c6d5a", 3);
        txt("\u552E", x + 51, y + 11, 11, "#743e30", "center");
        hit(x + 37, y, 23, 26, { type: "sell", id: e.id });
      });
      if (reserve.length) {
        button("\u7F16\u5165\u5F85\u7F16\u8F66\u53A2", W - 166, bottom + 12, 139, 35, { type: "attachCart", id: reserve[0].id });
      }
      const shop = H - 161;
      txt("\u88C5\u5907\u8865\u7ED9", 19, shop - 17, 17, ink, "left", "bold");
      const moduleW = (W - 38) / 4;
      st.shop.forEach((m, i) => {
        const x = 14 + i * (moduleW + 3);
        box(x, shop, moduleW, 76, "#f7f3e8", ink, 6);
        icon(m.key, x + (moduleW - 39) / 2, shop + 5, 39);
        txt(m.name, x + moduleW / 2, shop + 51, 12, ink, "center", "bold");
        txt(`${m.price}\u25C8`, x + moduleW / 2, shop + 68, 12, ink, "center");
        hit(x, shop, moduleW, 76, { type: "buyModule", key: m.key });
      });
      button("\u4E70\u8F66 30\u25C8", 14, H - 76, 108, 57, { type: "buyCart" });
      button(s.mergeFrom ? "\u53D6\u6D88\u5408\u6210" : "\u5408\u6210\u8F66\u53A2", 130, H - 76, 111, 57, s.mergeFrom ? { type: "mergeStart", id: null } : { type: "mergeStart", id: selected.id });
      button("\u51FA\u7AD9 \u2192", 249, H - 76, W - 263, 57, { type: "depart" }, "dark");
      if (s.confirm) {
        ctx2.fillStyle = "rgba(22,26,22,.56)";
        ctx2.fillRect(0, 0, W, H);
        box(33, H / 2 - 83, W - 66, 166, "#f5f1e6", ink, 10);
        txt(s.confirm.type === "merge" ? "\u4E24\u8282\u8F66\u53A2\u5408\u6210\uFF0C\u88C5\u5907\u8FDB\u5468\u8F6C\uFF1F" : "\u786E\u8BA4\u51FA\u552E\uFF1F", W / 2, H / 2 - 39, 17, ink, "center", "bold");
        button("\u53D6\u6D88", 52, H / 2 + 13, 132, 48, { type: "cancel" });
        button("\u786E\u8BA4", W - 184, H / 2 + 13, 132, 48, { type: "confirm" }, "dark");
      }
    }
    function encounterLine(s) {
      const labels = ["\u5C0F\u602A", "\u5C0F\u602A", "\u7CBE\u82F1", "\u5C0F\u602A", "BOSS"];
      const active2 = s.boss ? 4 : Math.min(3, Math.max(0, Math.floor(s.wave.number / 2)));
      const y = 90, w = (W - 32) / 5;
      labels.forEach((label, i) => {
        const x = 16 + i * w;
        line(x + 9, y + 14, x + w - 7, y + 14, i <= active2 ? dark : "#acada2", 2);
        ctx2.fillStyle = i === active2 ? dark : i < active2 ? "#777c70" : "#c8c7bc";
        ctx2.beginPath();
        ctx2.arc(x + 6, y + 14, 5, 0, Math.PI * 2);
        ctx2.fill();
        txt(label, x + w / 2, y + 34, 12, ink, "center", i === active2 ? "bold" : "normal");
      });
    }
    function battle(s) {
      bg();
      const b = s.battle, scale = Math.min(W / 420, (H - 130) / 760), top = H < 760 ? 10 : 55, dx = W / 2 - 210 * scale;
      ctx2.save();
      ctx2.translate(dx, -top * scale);
      ctx2.scale(scale, scale);
      wasteland(b.scroll);
      const travel = b.scroll % 43;
      for (let y = -43; y < 1150; y += 43) {
        line(161, y + travel, 259, y + travel, "#8c918b", 6);
      }
      line(171, 0, 171, 1150, "#4b5457", 5);
      line(249, 0, 249, 1150, "#4b5457", 5);
      const forward = b.invincible ? -Math.min(110, (b.sprint.distance - b.sprint.remaining) * 0.5) : 0;
      const formationOffset = Math.max(70, 280 - (b.cars.length - 3) * 65);
      ctx2.save();
      ctx2.translate(0, formationOffset);
      ctx2.save();
      ctx2.translate(0, forward);
      b.cars.forEach((c, i) => {
        const im = i === 0 ? "head" : "car", width = i === 0 ? 78 : 84, height = i === 0 ? 113 : 101;
        ctx2.fillStyle = "rgba(24,28,28,.19)";
        ctx2.beginPath();
        ctx2.ellipse(c.x + 4, c.y + 33, width * 0.57, 18, 0, 0, Math.PI * 2);
        ctx2.fill();
        if (!picture(im, c.x - width / 2, c.y - height / 2, width, height)) box(c.x - width / 2, c.y - height / 2, width, height, "#81888a", ink, 5);
      });
      b.weapons.forEach((w) => battleMount(w, b.t));
      ctx2.restore();
      b.enemies.slice(0, 90).forEach((e) => {
        const name = e.boss ? "boss" : e.elite ? "elite" : e.fly ? "flyer" : "walker", size = e.boss ? 126 : e.elite ? 68 : e.fly ? 43 : 40, x = e.x + (e.boss ? 0 : (hash(e.id * 9) - 0.5) * 21), y = e.y + (e.boss ? 0 : (hash(e.id * 23) - 0.5) * 18);
        ctx2.fillStyle = "rgba(26,30,31,.19)";
        ctx2.beginPath();
        ctx2.ellipse(x + 3, y + size * 0.31, size * 0.38, size * 0.12, 0, 0, Math.PI * 2);
        ctx2.fill();
        if (!picture(name, x - size / 2, y - size / 2, size, size, !e.boss && hash(e.id * 31) > 0.5)) box(x - size / 2, y - size / 2, size, size, e.boss ? "#a25b36" : "#826d5b", ink, 8);
        if (e.boss || e.elite) {
          ctx2.fillStyle = "#a64135";
          ctx2.fillRect(x - size / 2, y - size / 2 - 8, size * Math.max(0, e.hp / e.maxHp), 5);
        }
      });
      b.drones.forEach((d) => {
        ctx2.strokeStyle = ink;
        ctx2.lineWidth = 3;
        line(d.x - 13, d.y, d.x + 13, d.y, ink, 3);
        ctx2.fillStyle = "#4ecbd7";
        ctx2.beginPath();
        ctx2.arc(d.x, d.y, 7, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.stroke();
        ctx2.fillStyle = "#f3ede0";
        ctx2.fillRect(d.x - 2, d.y - 2, 4, 4);
      });
      b.effects.slice(-18).forEach((e) => {
        const color = e.key === "arc" ? cyan : gold, sy = e.y + forward, mx = (e.x + e.tx) / 2 + (e.key === "arc" ? 9 : -4), my = (sy + e.ty) / 2;
        line(e.x, sy, mx, my, color, e.key === "arc" ? 5 : 3);
        line(mx, my, e.tx, e.ty, color, e.key === "arc" ? 5 : 3);
        ctx2.fillStyle = color;
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          line(e.tx + Math.cos(a) * 3, e.ty + Math.sin(a) * 3, e.tx + Math.cos(a) * 11, e.ty + Math.sin(a) * 11, color, 3);
        }
        ctx2.beginPath();
        ctx2.arc(e.tx, e.ty, 5, 0, Math.PI * 2);
        ctx2.fill();
      });
      b.lootFeedback.slice(-8).forEach((drop) => {
        const age = b.t - drop.time, fy = drop.y - age * 38;
        ctx2.fillStyle = cyan;
        ctx2.beginPath();
        ctx2.moveTo(drop.x, fy - 7);
        ctx2.lineTo(drop.x + 5, fy);
        ctx2.lineTo(drop.x, fy + 7);
        ctx2.lineTo(drop.x - 5, fy);
        ctx2.closePath();
        ctx2.fill();
        ctx2.fillStyle = gold;
        ctx2.fillRect(drop.x + 8, fy - 3, 5, 6);
      });
      if (b.invincible) {
        ctx2.save();
        ctx2.translate(0, forward);
        ctx2.strokeStyle = "#fffdf0";
        ctx2.lineWidth = 4;
        ctx2.beginPath();
        ctx2.arc(210, b.cars[0].y - 24, 43, Math.PI, Math.PI * 2);
        ctx2.stroke();
        for (let i = 0; i < 8; i++) line(150 + i * 17, b.cars[b.cars.length - 1].y + 55, 145 + i * 17, b.cars[b.cars.length - 1].y + 90, "#fff9df", 3);
        ctx2.restore();
      }
      ctx2.restore();
      ctx2.restore();
      box(12, 12, W - 24, 62, "rgba(34,42,48,.93)", null, 9);
      ctx2.fillStyle = cyan;
      ctx2.fillRect(13, 12, 4, 62);
      txt(`\u8010\u4E45 ${Math.ceil(b.hp)}/300`, 24, 30, 18, "#fff9ec", "left", "bold");
      ctx2.fillStyle = "#778285";
      ctx2.fillRect(24, 49, 173, 8);
      ctx2.fillStyle = b.hp < 90 ? "#e38c57" : cyan;
      ctx2.fillRect(24, 49, 173 * Math.max(0, b.hp / 300), 8);
      txt(`Lv.${b.level}`, W - 23, 31, 16, "#fff9ec", "right", "bold");
      txt(`\u25C8 ${s.station.cash}`, W - 23, 54, 14, gold, "right");
      encounterLine(b);
      if (b.boss) {
        box(W / 2 - 110, 132, 220, 36, "#e7d7ce", "#914335", 5);
        txt(`\u6301\u94C1\u8005  ${Math.ceil(b.boss.hp)}/${b.boss.maxHp}`, W / 2, 150, 15, "#692f27", "center", "bold");
      }
      const state = b.choices.length ? "choose" : b.sprintLocked ? "locked" : b.invincible ? "active" : b.sprint.energy >= 100 ? "ready" : "charge";
      const bx = W - 91, by = H - 99, cx = bx + 37, cy = by + 37;
      ctx2.fillStyle = state === "ready" ? "#263c45" : "#3a4649";
      ctx2.strokeStyle = ink;
      ctx2.lineWidth = 4;
      ctx2.beginPath();
      ctx2.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
      ctx2.strokeStyle = state === "ready" ? gold : cyan;
      ctx2.lineWidth = 5;
      ctx2.beginPath();
      ctx2.arc(cx, cy, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (state === "active" ? 1 : b.sprint.energy / 100));
      ctx2.stroke();
      txt(state === "locked" ? "\xD7" : state === "active" ? "\u2191\u2191" : "\u2191", cx, cy - 9, 30, "#f7f3e4", "center", "bold");
      txt(state === "locked" ? "\u5C01\u9501" : "\u51B2\u523A", cx, cy + 20, 14, "#fff", "center", "bold");
      hit(bx - 7, by - 7, 89, 89, { type: "sprint" });
      if (b.choices.length) {
        ctx2.fillStyle = "rgba(31,36,31,.73)";
        ctx2.fillRect(0, 0, W, H);
        txt("\u9009\u62E9\u5F3A\u5316", W / 2, H * 0.27, 25, "#fff", "center", "bold");
        b.choices.forEach((card, i) => {
          const y = H * 0.35 + i * 91;
          box(28, y, W - 56, 78, "#f1efe5", ink, 8);
          icon(card.weapon || "boost", 43, y + 16, 45);
          txt(card.name, 102, y + 26, 18, ink, "left", "bold");
          txt(card.weapon ? names[card.weapon] : "\u901A\u7528\u5F3A\u5316", 102, y + 55, 14, "#5d675d");
          hit(28, y, W - 56, 78, { type: "choose", id: card.id });
        });
      }
    }
    function arrival(s) {
      station(s);
      hits = [];
    }
    function result(s) {
      bg();
      txt(s.result.win ? "\u8FDC\u5F81\u5B8C\u6210" : "\u5217\u8F66\u5931\u5B88", W / 2, H * 0.37, 29, ink, "center", "bold");
      txt(`\u51FB\u8D25 ${s.result.kills}`, W / 2, H * 0.45, 18, ink, "center");
      button("\u91CD\u65B0\u51FA\u53D1", W / 2 - 100, H * 0.57, 200, 62, { type: "reset" }, "dark");
    }
    return { resize(width, height) {
      W = 390;
      H = height / width * 390;
      canvas2.width = Math.round(width);
      canvas2.height = Math.round(height);
      if (canvas2.style) {
        canvas2.style.width = width + "px";
        canvas2.style.height = height + "px";
      }
      ctx2.setTransform(canvas2.width / W, 0, 0, canvas2.height / H, 0, 0);
    }, render(state) {
      hits = [];
      ctx2.clearRect(0, 0, W, H);
      if (state.mode === "battle") battle(state);
      else if (state.mode === "arrival") arrival(state);
      else if (state.mode === "result") result(state);
      else station(state);
    }, touch(px, py) {
      const x = px / canvas2.width * W, y = py / canvas2.height * H;
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i];
        if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h.action;
      }
      return null;
    }, size: () => ({ W, H }) };
  }

  // src/main.mjs
  var canvas = wx.createCanvas();
  var ctx = canvas.getContext("2d");
  var session = createSession();
  var images = {};
  for (const key of ["head", "car", "walker", "flyer", "elite", "boss", "saw", "arc", "drone"]) {
    const image = wx.createImage();
    image.loaded = false;
    image.onload = () => {
      image.loaded = true;
      render();
    };
    image.onerror = () => {
      image.loaded = false;
    };
    image.src = `assets/${key}.png`;
    images[key] = image;
  }
  var renderer = createRenderer(canvas, ctx, images);
  function dimensions() {
    const info = wx.getSystemInfoSync();
    return { width: info.windowWidth || info.screenWidth || 390, height: info.windowHeight || info.screenHeight || 844, dpr: info.pixelRatio || 1 };
  }
  function resize() {
    const d = dimensions();
    renderer.resize(d.width, d.height);
    render();
  }
  function render() {
    renderer.render(session.state());
  }
  resize();
  var active = true;
  var last = 0;
  var accumulator = 0;
  function frame(now) {
    if (active) {
      if (last) {
        accumulator = Math.min(0.1, accumulator + Math.min(0.1, (now - last) / 1e3));
        while (accumulator >= 1 / 60) {
          session.step(1 / 60);
          accumulator -= 1 / 60;
        }
      }
      last = now;
      render();
    }
    (canvas.requestAnimationFrame || requestAnimationFrame)(frame);
  }
  (canvas.requestAnimationFrame || requestAnimationFrame)(frame);
  wx.onTouchEnd((event) => {
    var _a2;
    const touch = (_a2 = event.changedTouches) == null ? void 0 : _a2[0];
    if (!touch) return;
    const command = renderer.touch(touch.clientX, touch.clientY);
    if (command) {
      session.action(command);
      render();
    }
  });
  wx.onHide(() => {
    active = false;
    last = 0;
    accumulator = 0;
  });
  wx.onShow(() => {
    active = true;
    last = 0;
    accumulator = 0;
    resize();
  });
  var _a;
  (_a = wx.onWindowResize) == null ? void 0 : _a.call(wx, resize);
  if (typeof globalThis !== "undefined") globalThis.__ER_CHECK__ = () => {
    var _a2, _b, _c, _d, _e, _f, _g, _h;
    const s = session.state();
    return { mode: s.mode, stage: s.journey.stage, phase: s.journey.phase, hp: (_a2 = s.battle) == null ? void 0 : _a2.hp, choices: (_b = s.battle) == null ? void 0 : _b.choices.map((c) => c.id), boss: (_d = (_c = s.battle) == null ? void 0 : _c.boss) == null ? void 0 : _d.hp, sprintEnergy: (_e = s.battle) == null ? void 0 : _e.sprint.energy, sprintActive: (_f = s.battle) == null ? void 0 : _f.sprint.active, sprintLocked: (_g = s.battle) == null ? void 0 : _g.sprintLocked, selected: s.selected, cash: s.station.cash, cars: s.station.carriers.length, turnover: s.station.equipment.filter((e) => !e.carrier).length, confirm: ((_h = s.confirm) == null ? void 0 : _h.type) || null };
  };
  if (typeof globalThis !== "undefined") {
    globalThis.__ER_STEP__ = (dt) => session.step(dt);
    globalThis.__ER_RENDER__ = render;
  }
})();
