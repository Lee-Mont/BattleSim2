// ===== Army Class =====
export class Army {
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