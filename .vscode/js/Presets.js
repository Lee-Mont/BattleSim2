// ===== Presets =====
export const presets = {
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

export function applyPreset(armies, armyKey, presetName) {
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
}