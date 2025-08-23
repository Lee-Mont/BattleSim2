// ===== Unit Class =====
class Unit {
    constructor(name, count, baseDamage, hitPoints, icon) {
        this.name = name;
        this.count = count;
        this.initialCount = count;
        this.baseDamage = baseDamage;
        this.hitPoints = hitPoints;
        this.damageDealt = 0;
        this.icon = icon;
    }

    isAlive() {
        return this.count > 0;
    }

    getTotalPower() {
        return this.isAlive() ? this.count * this.baseDamage : 0;
    }

    getHealthPercentage() {
        return this.initialCount > 0 ? (this.count / this.initialCount) * 100 : 0;
    }

    receiveDamage(damage) {
        if (!this.isAlive()) return 0;
        const totalHP = this.count * this.hitPoints;
        const remainingHP = Math.max(0, totalHP - damage);
        this.count = Math.floor(remainingHP / this.hitPoints);
        return damage;
    }

    addUnits(amount) {
        this.count += amount;
        this.initialCount += amount;
    }

    removeUnits(amount) {
        const actualRemoved = Math.min(amount, this.count);
        this.count -= actualRemoved;
        this.initialCount -= actualRemoved;
        return actualRemoved;
    }

    setUnits(newCount) {
        this.count = Math.max(0, newCount);
        this.initialCount = Math.max(0, newCount);
    }
}

// ===== Army Class =====
class Army {
    constructor(name, units) {
        this.name = name;
        this.units = units;
        this.totalDamageDealt = 0;
    }

    isAlive() {
        return this.units.some(unit => unit.isAlive());
    }

    getAliveUnits() {
        return this.units.filter(unit => unit.isAlive());
    }

    getTotalPower() {
        return this.getAliveUnits().reduce((sum, unit) => sum + unit.getTotalPower(), 0);
    }

    attack(enemyArmy) {
        if (!this.isAlive()) return [];

        const attackers = this.getAliveUnits();
        const totalPower = this.getTotalPower();
        let totalDamage = totalPower * (Math.random() * 0.6 + 0.7);
        this.totalDamageDealt += totalDamage;

        const targets = enemyArmy.getAliveUnits();
        if (targets.length === 0) return [];

        const attackLog = [];

        for (const attacker of attackers) {
            if (totalDamage <= 0) break;
            const contribution = attacker.getTotalPower() / totalPower;
            const unitDamage = totalDamage * contribution;

            let damageLeft = unitDamage;

            while (damageLeft > 0 && targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                const damageAmount = Math.min(damageLeft, target.count * target.hitPoints);
                const actualDamage = target.receiveDamage(damageAmount);
                attacker.damageDealt += actualDamage;

                attackLog.push({
                    attacker: attacker.name,
                    target: target.name,
                    damage: Math.floor(actualDamage),
                });

                damageLeft -= actualDamage;

                if (!target.isAlive()) {
                    const idx = targets.indexOf(target);
                    if (idx > -1) targets.splice(idx, 1);
                }
            }
        }
        return attackLog;
    }
}

// ===== Global Variables =====
const armies = {
    alliance: new Army("Alliance", [
        new Unit("Infantry", 100, 5, 10, "🪖"),
        new Unit("Tanks", 25, 20, 50, "� tank"),
        new Unit("Air Force", 15, 30, 25, "✈️"),
    ]),
    federation: new Army("Federation", [
        new Unit("Infantry", 100, 6, 10, "🪖"),
        new Unit("Tanks", 20, 22, 50, "� tank"),
        new Unit("Air Force", 15, 28, 25, "✈️"),
    ]),
};

let battleInterval = null;
let battleSpeed = 2500;
let round = 0;
let isPaused = false;

// ===== DOM Elements =====
const battleStatus = document.getElementById("battleStatus");
const roundCounter = document.getElementById("roundCounter");
const battleLog = document.getElementById("battleLog");
const speedSlider = document.getElementById("speedSlider");
const speedDisplay = document.getElementById("speedDisplay");
const winnerBanner = document.getElementById("winnerBanner");
const alliancePower = document.getElementById("alliancePower");
const federationPower = document.getElementById("federationPower");
const allianceUnitsContainer = document.getElementById("allianceUnits");
const federationUnitsContainer = document.getElementById("federationUnits");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const statsGrid = document.getElementById("statsGrid");
const finalResults = document.getElementById("finalResults");
const damageStats = document.getElementById("damageStats");
const survivorStats = document.getElementById("survivorStats");

// ===== Initialization =====
function init() {
    renderArmyUnits("alliance");
    renderArmyUnits("federation");
    updatePowers();
    updateSpeedDisplay();
    battleStatus.textContent = "Ready to Battle!";
    roundCounter.textContent = "Round 0";
    battleLog.innerHTML = "";
    winnerBanner.style.display = "none";
    statsGrid.style.display = "none";
    pauseBtn.style.display = "none";
    startBtn.style.display = "inline-block";
}

init();

// ===== Rendering Units =====
function renderArmyUnits(armyKey) {
    const army = armies[armyKey];
    const container = armyKey === "alliance" ? allianceUnitsContainer : federationUnitsContainer;

    container.innerHTML = "";

    army.units.forEach((unit, idx) => {
        const unitDiv = document.createElement("div");
        unitDiv.className = "unit";
        unitDiv.id = `${armyKey}-unit-${idx}`;

        unitDiv.innerHTML = `
            <div class="unit-info">
                <div class="unit-name">${unit.icon} ${unit.name}</div>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${unit.getHealthPercentage()}%"></div>
                </div>
                <div class="unit-stats">
                    <div class="stat">Count: <span id="${armyKey}-count-${idx}">${unit.count}</span></div>
                    <div class="stat">HP: ${unit.hitPoints}</div>
                    <div class="stat">Damage: ${unit.baseDamage}</div>
                </div>
            </div>
            <div class="unit-controls">
                <div class="unit-control-row">
                    <button class="unit-control-btn remove" onclick="adjustUnitCount('${armyKey}', ${idx}, -10)">-10</button>
                    <button class="unit-control-btn remove" onclick="adjustUnitCount('${armyKey}', ${idx}, -1)">-1</button>
                    <input type="number" class="unit-count-input" id="${armyKey}-input-${idx}" value="${unit.count}" min="0" max="999" />
                    <button class="unit-control-btn add" onclick="adjustUnitCount('${armyKey}', ${idx}, 1)">+1</button>
                    <button class="unit-control-btn add" onclick="adjustUnitCount('${armyKey}', ${idx}, 10)">+10</button>
                </div>
            </div>
        `;

        container.appendChild(unitDiv);

        // Add listener for manual input change
        const input = document.getElementById(`${armyKey}-input-${idx}`);
        input.addEventListener("change", (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 999) val = 999;
            e.target.value = val;
            armies[armyKey].units[idx].setUnits(val);
            updatePowers();
            renderArmyUnits(armyKey);
        });
    });
}

// ===== Adjust Unit Count =====
function adjustUnitCount(armyKey, unitIdx, amount) {
    const unit = armies[armyKey].units[unitIdx];
    const newCount = Math.max(0, unit.count + amount);
    unit.setUnits(newCount);
    renderArmyUnits(armyKey);
    updatePowers();
}

// ===== Update Powers =====
function updatePowers() {
    alliancePower.textContent = `Total Power: ${armies.alliance.getTotalPower()}`;
    federationPower.textContent = `Total Power: ${armies.federation.getTotalPower()}`;
}

// ===== Presets =====
const presets = {
    balanced: [
        { infantry: 100, tanks: 25, air: 15 },
        { infantry: 100, tanks: 20, air: 15 }
    ],
    infantry: [
        { infantry: 150, tanks: 10, air: 5 },
        { infantry: 150, tanks: 10, air: 5 }
    ],
    tanks: [
        { infantry: 50, tanks: 50, air: 10 },
        { infantry: 50, tanks: 40, air: 10 }
    ],
    air: [
        { infantry: 40, tanks: 10, air: 40 },
        { infantry: 40, tanks: 10, air: 40 }
    ],
};

function applyPreset(armyKey, presetName) {
    const preset = presets[presetName];
    if (!preset) return;

    const armyIndex = armyKey === "alliance" ? 0 : 1;
    const armyUnits = armies[armyKey].units;

    // Map preset to units by name
    armyUnits.forEach(unit => {
        if (unit.name.toLowerCase().includes("infantry")) {
            unit.setUnits(preset[armyIndex].infantry);
        } else if (unit.name.toLowerCase().includes("tank")) {
            unit.setUnits(preset[armyIndex].tanks);
        } else if (unit.name.toLowerCase().includes("air")) {
            unit.setUnits(preset[armyIndex].air);
        }
    });

    renderArmyUnits(armyKey);
    updatePowers();
}

// ===== Battle Logic =====

function startBattle() {
    if (battleInterval) return; // Already running

    if (!armies.alliance.isAlive() || !armies.federation.isAlive()) {
        alert("Both armies must have units to start the battle.");
        return;
    }

    battleStatus.textContent = "Battle Started!";
    startBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
    statsGrid.style.display = "none";
    winnerBanner.style.display = "none";
    battleLog.innerHTML = "";
    round = 0;
    isPaused = false;

    battleInterval = setInterval(() => {
        if (isPaused) return;

        round++;
        roundCounter.textContent = `Round ${round}`;

        logRound(`Round ${round} begins!`);

        // Alliance attacks first
        const allianceLog = armies.alliance.attack(armies.federation);
        animateBattleLog(allianceLog, "Alliance");

        // Federation attacks second only if alive
        if (armies.federation.isAlive()) {
            const federationLog = armies.federation.attack(armies.alliance);
            animateBattleLog(federationLog, "Federation");
        }

        renderArmyUnits("alliance");
        renderArmyUnits("federation");
        updatePowers();

        checkWinner();

    }, battleSpeed);
}

function pauseBattle() {
    if (!battleInterval) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶️ Resume" : "⏸️ Pause";
    battleStatus.textContent = isPaused ? "Battle Paused" : "Battle Running";
}

function resetBattle() {
    clearInterval(battleInterval);
    battleInterval = null;
    isPaused = false;
    pauseBtn.style.display = "none";
    startBtn.style.display = "inline-block";

    // Reset units to initial preset balanced
    applyPreset("alliance", "balanced");
    applyPreset("federation", "balanced");

    battleStatus.textContent = "Ready to Battle!";
    roundCounter.textContent = "Round 0";
    battleLog.innerHTML = "";
    winnerBanner.style.display = "none";
    statsGrid.style.display = "none";

    renderArmyUnits("alliance");
    renderArmyUnits("federation");
    updatePowers();
}

function checkWinner() {
    const allianceAlive = armies.alliance.isAlive();
    const federationAlive = armies.federation.isAlive();

    if (!allianceAlive && !federationAlive) {
        announceWinner("It's a draw!");
    } else if (!federationAlive) {
        announceWinner("🛡️ Alliance Forces Win!");
    } else if (!allianceAlive) {
        announceWinner("⚔️ Federation Troops Win!");
    }
}

function announceWinner(text) {
    clearInterval(battleInterval);
    battleInterval = null;
    battleStatus.textContent = "Battle Finished!";
    winnerBanner.textContent = text;
    winnerBanner.style.display = "block";
    pauseBtn.style.display = "none";
    startBtn.style.display = "inline-block";

    showFinalStats();
}

// ===== Battle Log =====
function logRound(text) {
    const entry = document.createElement("div");
    entry.className = "log-entry log-round";
    entry.textContent = text;
    battleLog.appendChild(entry);
    battleLog.scrollTop = battleLog.scrollHeight;
}

function logAttack(attacker, target, damage) {
    const entry = document.createElement("div");
    entry.className = "log-entry log-attack";
    entry.textContent = `${attacker} attacked ${target} for ${damage} damage!`;
    battleLog.appendChild(entry);
    battleLog.scrollTop = battleLog.scrollHeight;
}

// Animate attacks nicely
function animateBattleLog(logs, attackingArmy) {
    logs.forEach((attack, i) => {
        setTimeout(() => {
            logAttack(`${attackingArmy} ${attack.attacker}`, attack.target, attack.damage);
        }, i * 200);
    });
}

// ===== Speed Control =====
speedSlider.addEventListener("input", (e) => {
    battleSpeed = parseInt(e.target.value);
    updateSpeedDisplay();

    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = setInterval(() => {
            if (isPaused) return;

            round++;
            roundCounter.textContent = `Round ${round}`;

            logRound(`Round ${round} begins!`);

            const allianceLog = armies.alliance.attack(armies.federation);
            animateBattleLog(allianceLog, "Alliance");

            if (armies.federation.isAlive()) {
                const federationLog = armies.federation.attack(armies.alliance);
                animateBattleLog(federationLog, "Federation");
            }

            renderArmyUnits("alliance");
            renderArmyUnits("federation");
            updatePowers();

            checkWinner();

        }, battleSpeed);
    }
});

function updateSpeedDisplay() {
    const val = battleSpeed;
    let label = "Normal";
    if (val <= 1000) label = "Fast";
    else if (val >= 4000) label = "Slow";
    else if (val <= 2000) label = "Medium";

    speedDisplay.textContent = label;
}

// ===== Final Stats =====
function showFinalStats() {
    statsGrid.style.display = "grid";

    // Final results summary
    finalResults.innerHTML = `
        <p><strong>Rounds Fought:</strong> ${round}</p>
        <p><strong>Alliance Total Power:</strong> ${armies.alliance.getTotalPower()}</p>
        <p><strong>Federation Total Power:</strong> ${armies.federation.getTotalPower()}</p>
    `;

    // Damage stats
    damageStats.innerHTML = `
        <p><strong>Alliance Damage Dealt:</strong> ${Math.floor(armies.alliance.totalDamageDealt)}</p>
        <p><strong>Federation Damage Dealt:</strong> ${Math.floor(armies.federation.totalDamageDealt)}</p>
    `;

    // Survivors
    const allianceSurvivors = armies.alliance.getAliveUnits()
        .map(u => `${u.name}: ${u.count}`)
        .join(", ") || "None";

    const federationSurvivors = armies.federation.getAliveUnits()
        .map(u => `${u.name}: ${u.count}`)
        .join(", ") || "None";

    survivorStats.innerHTML = `
        <p><strong>Alliance Survivors:</strong> ${allianceSurvivors}</p>
        <p><strong>Federation Survivors:</strong> ${federationSurvivors}</p>
    `;
}
