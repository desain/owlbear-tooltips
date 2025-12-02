import { buildLabel, type Label } from "@owlbear-rodeo/sdk";
import { getBounds, type BoundableItem } from "owlbear-utils";
import type { TooltipData } from "../state/TooltipItem";
import { usePlayerStorage } from "../state/usePlayerStorage";

/**
 * Px to move the tail of the speech bubble down from the top of the token.
 */
const TOOLTIP_VERTICAL_OFFSET = 0;

export function makeTooltipLabel(
    item: BoundableItem,
    data: TooltipData,
): Label {
    const { center, min } = getBounds(item, usePlayerStorage.getState().grid);
    const position = {
        x: center.x,
        y: min.y + TOOLTIP_VERTICAL_OFFSET,
    };

    return buildLabel()
        .layer(item.layer)
        .position(position)
        .text(data.text)
        .style(data.style)
        .disableHit(true)
        .visible(item.visible)
        .locked(true)
        .attachedTo(item.id)
        .disableAttachmentBehavior(["COPY", "LOCKED", "SCALE"])
        .name("Tooltip")
        .build();
}
