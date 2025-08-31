import { DOMElements } from './DOMElements.js';
import { renderArmyUnits, updatePowers, showFinalStats } from './UIRenderer.js';
import { logRound, animateBattleLog } from './BattleLog.js';
import { 
    setBattleInterval, 
    setRound, 
    setIsPaused, 
    getBattleInterval, 
    getBattleSpeed, 
    getRound, 
    getIsPaused 
} from './BattleState.js';

// ===== Battle Logic =====
export function startBattle(armies, adjustUnitCountCallback) {
    if (getBattleInterval()) return; // Already running

    if (!armies.alliance.isAlive() || !armies.federation.isAlive()) {
        alert("Both armies must have units to start the battle.");
        return;
    }

    DOMElements.battleStatus.textContent = "Battle Started!";
    DOMElements.startBtn.style.display = "none";
    DOMElements.pauseBtn.style.display = "inline-block";
    DOMElements.statsGrid.style.display = "none";
    DOMElements.winnerBanner.style.display = "none";
    DOMElements.battleLog.innerHTML = "";
    setRound(0);
    setIsPaused(false);

    const interval = setInterval(() => {
        if (getIsPaused()) return;

        const currentRound = getRound() + 1;
        setRound(currentRound);
        DOMElements.roundCounter.textContent = `Round ${currentRound}`;

        logRound(`Round ${currentRound} begins!`);

        // Alliance attacks first
        const allianceLog = armies.alliance.attack(armies.federation);
        animateBattleLog(allianceLog, "Alliance");

        // Federation attacks second only if alive
        if (armies.federation.isAlive()) {
            const federationLog = armies.federation.attack(armies.alliance);
            animateBattleLog(federationLog, "Federation");
        }

        renderArmyUnits(armies, "alliance", adjustUnitCountCallback);
        renderArmyUnits(armies, "federation", adjustUnitCountCallback);
        updatePowers(armies);

        checkWinner(armies);

    }, getBattleSpeed());

    setBattleInterval(interval);
}

export function pauseBattle() {
    if (!getBattleInterval()) return;
    setIsPaused(!getIsPaused());
    DOMElements.pauseBtn.textContent = getIsPaused() ? "▶️ Resume" : "⏸️ Pause";
    DOMElements.battleStatus.textContent = getIsPaused() ? "Battle Paused" : "Battle Running";
}

export function resetBattle(armies, applyPresetCallback, adjustUnitCountCallback) {
    clearInterval(getBattleInterval());
    setBattleInterval(null);
    setIsPaused(false);
    DOMElements.pauseBtn.style.display = "none";
    DOMElements.startBtn.style.display = "inline-block";

    // Reset units to initial preset balanced
    applyPresetCallback("alliance", "balanced");
    applyPresetCallback("federation", "balanced");

    DOMElements.battleStatus.textContent = "Ready to Battle!";
    DOMElements.roundCounter.textContent = "Round 0";
    DOMElements.battleLog.innerHTML = "";
    DOMElements.winnerBanner.style.display = "none";
    DOMElements.statsGrid.style.display = "none";

    renderArmyUnits(armies, "alliance", adjustUnitCountCallback);
    renderArmyUnits(armies, "federation", adjustUnitCountCallback);
    updatePowers(armies);
}

function checkWinner(armies) {
    const allianceAlive = armies.alliance.isAlive();
    const federationAlive = armies.federation.isAlive();

    if (!allianceAlive && !federationAlive) {
        announceWinner(armies, "It's a draw!");
    } else if (!federationAlive) {
        announceWinner(armies, "🛡️ Alliance Forces Win!");
    } else if (!allianceAlive) {
        announceWinner(armies, "⚔️ Federation Troops Win!");
    }
}

function announceWinner(armies, text) {
    clearInterval(getBattleInterval());
    setBattleInterval(null);
    DOMElements.battleStatus.textContent = "Battle Finished!";
    DOMElements.winnerBanner.textContent = text;
    DOMElements.winnerBanner.style.display = "block";
    DOMElements.pauseBtn.style.display = "none";
    DOMElements.startBtn.style.display = "inline-block";

    showFinalStats(armies, getRound());
}