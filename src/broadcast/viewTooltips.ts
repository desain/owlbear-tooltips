import OBR, { type Label } from "@owlbear-rodeo/sdk";
import { getId } from "owlbear-utils";
import { METADATA_KEY_TOOLTIPS } from "../constants";
import { isTooltipItem, type TooltipItem } from "../state/TooltipItem";
import { makeTooltipLabel } from "../tool/TooltipLabel";

const PREVIEW_MS = 5000;

export async function viewTooltips(ids: TooltipItem["id"][]) {
    const items = (await OBR.scene.items.getItems(ids)).filter(isTooltipItem);
    const labels: Label[] = [];
    for (const item of items) {
        const data = item.metadata[METADATA_KEY_TOOLTIPS];
        if (data) {
            labels.push(makeTooltipLabel(item, data));
        }
    }

    await OBR.scene.local.addItems(labels);

    await new Promise((resolve) => setTimeout(resolve, PREVIEW_MS));

    await OBR.scene.local.deleteItems(labels.map(getId));
}
