import { DOMElements } from './DOMElements.js';
import { armies, setBattleSpeed, getBattleSpeed, getBattleInterval, setBattleInterval } from './BattleState.js';
import { applyPreset } from './Presets.js';
import { renderArmyUnits, updatePowers, updateSpeedDisplay } from './UIRenderer.js';
import { startBattle, pauseBattle, resetBattle } from './BattleController.js';
import { logRound, animateBattleLog } from './BattleLog.js';

// ===== Adjust Unit Count =====
function adjustUnitCount(armyKey, unitIdx, amount) {
    const unit = armies[armyKey].units[unitIdx];
    const newCount = Math.max(0, unit.count + amount);
    unit.setUnits(newCount);
    renderArmyUnits(armies, armyKey, adjustUnitCount);
    updatePowers(armies);
}

// Make adjustUnitCount globally available for onclick handlers
window.adjustUnitCount = adjustUnitCount;

// ===== Preset Application Helper =====
function applyPresetWrapper(armyKey, presetName) {
    applyPreset(armies, armyKey, presetName);
    renderArmyUnits(armies, armyKey, adjustUnitCount);
    updatePowers(armies);
}

// Make preset function globally available
window.applyPreset = applyPresetWrapper;

// ===== Initialization =====
function init() {
    renderArmyUnits(armies, "alliance", adjustUnitCount);
    renderArmyUnits(armies, "federation", adjustUnitCount);
    updatePowers(armies);
    updateSpeedDisplay(getBattleSpeed());
    DOMElements.battleStatus.textContent = "Ready to Battle!";
    DOMElements.roundCounter.textContent = "Round 0";
    DOMElements.battleLog.innerHTML = "";
    DOMElements.winnerBanner.style.display = "none";
    DOMElements.statsGrid.style.display = "none";
    DOMElements.pauseBtn.style.display = "none";
    DOMElements.startBtn.style.display = "inline-block";
}

// ===== Event Listeners =====
DOMElements.startBtn.addEventListener("click", () => {
    startBattle(armies, adjustUnitCount);
});

DOMElements.pauseBtn.addEventListener("click", () => {
    pauseBattle();
});

DOMElements.resetBtn.addEventListener("click", () => {
    resetBattle(armies, applyPresetWrapper, adjustUnitCount);
});

// ===== Speed Control =====
DOMElements.speedSlider.addEventListener("input", (e) => {
    const newSpeed = parseInt(e.target.value);
    setBattleSpeed(newSpeed);
    updateSpeedDisplay(getBattleSpeed());

    if (getBattleInterval()) {
        clearInterval(getBattleInterval());
        
        const interval = setInterval(() => {
        }, getBattleSpeed());
        
        setBattleInterval(interval);
    }
});

// ===== Initialize Application =====
init();