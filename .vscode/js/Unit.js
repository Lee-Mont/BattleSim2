// ===== Unit Class =====
export class Unit {
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