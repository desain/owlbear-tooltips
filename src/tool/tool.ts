import OBR from "@owlbear-rodeo/sdk";
import { ID_ACTION_SETTINGS, ID_MODE_TOOLTIP } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { TooltipMode } from "./TooltipMode";

import arrowCursorSettings from "../../assets/arrow-cursor-settings.svg";
import type { ModeShortcut } from "../popoverSettings/ModeShortcutSelector";
import { openSettings } from "../popoverSettings/openSettings";

export async function startWatchingToolEnabled(): Promise<VoidFunction> {
    const shortcut = usePlayerStorage.getState().modeShortcut;
    if (shortcut) {
        await installTool(shortcut);
    }
    return usePlayerStorage.subscribe(
        (store) => store.modeShortcut,
        async (shortcut) => {
            if (shortcut) {
                await installTool(shortcut);
            } else {
                await uninstallTool();
            }
        },
    );
}

async function installTool(modeShortcut: ModeShortcut) {
    await Promise.all([
        OBR.tool.createMode(new TooltipMode(modeShortcut)),
        OBR.tool.createAction({
            id: ID_ACTION_SETTINGS,
            icons: [
                {
                    icon: arrowCursorSettings,
                    label: "Tooltip Settings",
                    filter: {
                        activeTools: ["rodeo.owlbear.tool/text"],
                    },
                },
            ],
            onClick: (_context, elementId) => {
                void openSettings(elementId);
            },
        }),
    ]);
}

async function uninstallTool() {
    await OBR.tool.removeMode(ID_MODE_TOOLTIP);
}
