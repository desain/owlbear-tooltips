import OBR from "@owlbear-rodeo/sdk";
import { ID_ACTION_SETTINGS, ID_MODE_TOOLTIP } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { TooltipMode } from "./TooltipMode";

import arrowCursorSettings from "../../assets/arrow-cursor-settings.svg";
import { openSettings } from "../popoverSettings/openSettings";

export async function startWatchingToolEnabled(): Promise<VoidFunction> {
    if (usePlayerStorage.getState().toolEnabled) {
        await installTool();
    }
    return usePlayerStorage.subscribe(
        (store) => store.toolEnabled,
        async (enabled) => {
            if (enabled) {
                await installTool();
            } else {
                await uninstallTool();
            }
        },
    );
}

async function installTool() {
    await Promise.all([
        OBR.tool.createMode(new TooltipMode()),
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
