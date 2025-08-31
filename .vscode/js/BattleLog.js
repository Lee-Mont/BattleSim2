import { DOMElements } from './DOMElements.js';

// ===== Battle Log =====
export function logRound(text) {
    const entry = document.createElement("div");
    entry.className = "log-entry log-round";
    entry.textContent = text;
    DOMElements.battleLog.appendChild(entry);
    DOMElements.battleLog.scrollTop = DOMElements.battleLog.scrollHeight;
}

export function logAttack(attacker, target, damage) {
    const entry = document.createElement("div");
    entry.className = "log-entry log-attack";
    entry.textContent = `${attacker} attacked ${target} for ${damage} damage!`;
    DOMElements.battleLog.appendChild(entry);
    DOMElements.battleLog.scrollTop = DOMElements.battleLog.scrollHeight;
}

// Animate attacks nicely
export function animateBattleLog(logs, attackingArmy) {
    logs.forEach((attack, i) => {
        setTimeout(() => {
            logAttack(`${attackingArmy} ${attack.attacker}`, attack.target, attack.damage);
        }, i * 200);
    });
}