import OBR from "@owlbear-rodeo/sdk";
import { ID_POPOVER_EDIT, URL_PARAM_ID } from "../constants";
import type { TooltipItem } from "../state/TooltipItem";

export function openEdit(id: TooltipItem["id"]) {
    return OBR.popover.open({
        id: ID_POPOVER_EDIT,
        url: `/src/popoverEdit/popoverEdit.html?${URL_PARAM_ID}=${encodeURIComponent(
            id,
        )}`,
        width: 400,
        height: 100,
        // anchorElementId: id,
        anchorOrigin: {
            horizontal: "CENTER",
            vertical: "TOP",
        },
        // anchorReference: "ELEMENT",
    });
}
