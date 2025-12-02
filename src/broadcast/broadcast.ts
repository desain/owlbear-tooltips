import OBR, { type Item } from "@owlbear-rodeo/sdk";
import { isObject } from "owlbear-utils";
import { CHANNEL_MESSAGE } from "../constants";
import { viewTooltips } from "./viewTooltips";

const SHOW_TOOLTIP = "SHOW_TOOLTIP";

interface ShowTooltipMessage {
    readonly type: typeof SHOW_TOOLTIP;
    readonly ids: Item["id"][];
}

function isShowTooltipMessage(message: unknown): message is ShowTooltipMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === SHOW_TOOLTIP &&
        "ids" in message &&
        Array.isArray(message.ids) &&
        message.ids.every((id) => typeof id === "string")
    );
}

export function broadcastShowTooltip(ids: Item["id"][]) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        {
            type: SHOW_TOOLTIP,
            ids,
        } satisfies ShowTooltipMessage,
        { destination: "ALL" },
    );
}

export function installBroadcastListener() {
    return OBR.broadcast.onMessage(CHANNEL_MESSAGE, ({ data }) => {
        if (isShowTooltipMessage(data)) {
            void viewTooltips(data.ids);
        }
    });
}
