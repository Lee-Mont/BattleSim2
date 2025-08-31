import { DOMElements } from './DOMElements.js';

// ===== Rendering Units =====
export function renderArmyUnits(armies, armyKey, adjustUnitCountCallback) {
    const army = armies[armyKey];
    const container = armyKey === "alliance" ? DOMElements.allianceUnitsContainer : DOMElements.federationUnitsContainer;

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
            updatePowers(armies);
            renderArmyUnits(armies, armyKey, adjustUnitCountCallback);
        });
    });
}

// ===== Update Powers =====
export function updatePowers(armies) {
    DOMElements.alliancePower.textContent = `Total Power: ${armies.alliance.getTotalPower()}`;
    DOMElements.federationPower.textContent = `Total Power: ${armies.federation.getTotalPower()}`;
}

// ===== Speed Control =====
export function updateSpeedDisplay(battleSpeed) {
    const val = battleSpeed;
    let label = "Normal";
    if (val <= 1000) label = "Fast";
    else if (val >= 4000) label = "Slow";
    else if (val <= 2000) label = "Medium";

    DOMElements.speedDisplay.textContent = label;
}

// ===== Final Stats =====
export function showFinalStats(armies, round) {
    DOMElements.statsGrid.style.display = "grid";

    // Final results summary
    DOMElements.finalResults.innerHTML = `
        <p><strong>Rounds Fought:</strong> ${round}</p>
        <p><strong>Alliance Total Power:</strong> ${armies.alliance.getTotalPower()}</p>
        <p><strong>Federation Total Power:</strong> ${armies.federation.getTotalPower()}</p>
    `;

    // Damage stats
    DOMElements.damageStats.innerHTML = `
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

    DOMElements.survivorStats.innerHTML = `
        <p><strong>Alliance Survivors:</strong> ${allianceSurvivors}</p>
        <p><strong>Federation Survivors:</strong> ${federationSurvivors}</p>
    `;
}