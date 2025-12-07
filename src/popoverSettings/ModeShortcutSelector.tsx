import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Control } from "owlbear-utils";
import type React from "react";

const MODE_SHORTCUTS = [
    "B",
    "C",
    "E",
    "G",
    "L",
    "N",
    "O",
    "P",
    "R",
    "V",
    "X",
] as const;

export type ModeShortcut = (typeof MODE_SHORTCUTS)[number];

function isModeShortcut(value: unknown): value is ModeShortcut {
    const modeShortcuts2: readonly unknown[] = MODE_SHORTCUTS;
    return modeShortcuts2.includes(value);
}

interface ModeShortcutSelectorProps {
    value?: ModeShortcut;
    onChange: (shortcut?: ModeShortcut) => void;
}

export const ModeShortcutSelector: React.FC<ModeShortcutSelectorProps> = ({
    value,
    onChange,
}) => (
    <Control label="Tooltip tool shortcut">
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_e, shortcut) => {
                if (isModeShortcut(shortcut)) {
                    onChange(shortcut);
                }
            }}
        >
            {MODE_SHORTCUTS.map((mode) => (
                <ToggleButton key={mode} value={mode}>
                    {mode}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    </Control>
);
