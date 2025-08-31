import { Unit } from './Unit.js';
import { Army } from './Army.js';

// ===== Global Variables =====
export const armies = {
    alliance: new Army("Alliance", [
        new Unit("Infantry", 100, 5, 10, "🪖"),
        new Unit("Tanks", 25, 20, 50, "🚗 tank"),
        new Unit("Air Force", 15, 30, 25, "✈️"),
    ]),
    federation: new Army("Federation", [
        new Unit("Infantry", 100, 6, 10, "🪖"),
        new Unit("Tanks", 20, 22, 50, "🚗 tank"),
        new Unit("Air Force", 15, 28, 25, "✈️"),
    ]),
};

export let battleInterval = null;
export let battleSpeed = 2500;
export let round = 0;
export let isPaused = false;

export function setBattleInterval(interval) {
    battleInterval = interval;
}

export function setBattleSpeed(speed) {
    battleSpeed = speed;
}

export function setRound(newRound) {
    round = newRound;
}

export function setIsPaused(paused) {
    isPaused = paused;
}

export function getBattleInterval() {
    return battleInterval;
}

export function getBattleSpeed() {
    return battleSpeed;
}

export function getRound() {
    return round;
}

export function getIsPaused() {
    return isPaused;
}