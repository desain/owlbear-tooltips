import OBR from "@owlbear-rodeo/sdk";
import { ID_POPOVER_SETTINGS } from "../constants";

export function openSettings(anchorElementId: string) {
    return OBR.popover.open({
        id: ID_POPOVER_SETTINGS,
        url: "/src/popoverSettings/popoverSettings.html",
        width: 400,
        height: 200,
        anchorElementId,
        anchorOrigin: {
            horizontal: "CENTER",
            vertical: "BOTTOM",
        },
        transformOrigin: {
            horizontal: "CENTER",
            vertical: "TOP",
        },
    });
}
