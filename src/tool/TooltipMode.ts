import type {
    Label,
    ToolContext,
    ToolCursor,
    ToolEvent,
    ToolIcon,
    ToolMode,
    ToolModeFilter,
} from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import { produce } from "immer";
import arrowCursor from "../../assets/arrow-cursor.svg";
import { broadcastShowTooltip } from "../broadcast/broadcast";
import { ID_MODE_TOOLTIP, METADATA_KEY_TOOLTIPS } from "../constants";
import { openEdit } from "../popoverEdit/openEdit";
import {
    isTooltipItem,
    tooltipVisible,
    type TooltipData,
    type TooltipItem,
} from "../state/TooltipItem";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { makeTooltipLabel } from "./TooltipLabel";

const CLICK_TO_ADD_TOOLTIP: TooltipData = {
    text: {
        height: "AUTO",
        width: "AUTO",
        plainText: "",
        type: "RICH",
        richText: [
            {
                type: "paragraph",
                children: [
                    {
                        text: "Click to add tooltip",
                        italic: true,
                    },
                ],
            },
        ],
        style: {
            padding: 8,
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: 400,
            textAlign: "CENTER",
            textAlignVertical: "MIDDLE",
            fillColor: "white",
            fillOpacity: 0.4,
            strokeColor: "white",
            strokeOpacity: 1,
            strokeWidth: 0,
            lineHeight: 1.5,
        },
    },
    style: {
        backgroundColor: "#3D4051",
        backgroundOpacity: 0.4,
        cornerRadius: 8,
        pointerDirection: "DOWN",
        pointerWidth: 8,
        pointerHeight: 12,
    },
};

const GM_OWNED_INVISIBLE_TOOLTIP: TooltipData = {
    text: {
        height: "AUTO",
        width: "AUTO",
        plainText: "",
        type: "RICH",
        richText: [
            {
                type: "paragraph",
                children: [
                    {
                        text: "(Only visible to another player)",
                        italic: true,
                    },
                ],
            },
        ],
        style: {
            padding: 8,
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: 400,
            textAlign: "CENTER",
            textAlignVertical: "MIDDLE",
            fillColor: "#ff9999",
            fillOpacity: 0.4,
            strokeColor: "white",
            strokeOpacity: 1,
            strokeWidth: 0,
            lineHeight: 1.5,
        },
    },
    style: {
        backgroundColor: "#3D4051",
        backgroundOpacity: 0.4,
        cornerRadius: 8,
        pointerDirection: "DOWN",
        pointerWidth: 8,
        pointerHeight: 12,
    },
};

/**
 * @param data item tooltip, or undefined if there isn't one
 * @param ownerId player ID who owns the item the tooltip is on
 * @returns 'click to add' tooltip if there's no tooltip
 * @returns 'gm owned' tooltip if the tooltip is extant but invisible to currentp player
 * @returns tooltip if it's extant and visible, with an extra 'click to edit' line if
 *          the tooltip is editable
 */
function processTooltip(data: TooltipData | undefined): TooltipData {
    return !data
        ? CLICK_TO_ADD_TOOLTIP
        : !tooltipVisible(data)
        ? GM_OWNED_INVISIBLE_TOOLTIP
        : produce(data, (draft) => {
              if (canEditTooltips()) {
                  draft.text.richText.push({
                      type: "paragraph",
                      children: [
                          {
                              text: "(Click to edit, shift-click to show to all)",
                              italic: true,
                          },
                      ],
                  });
              }
          });
}

function canEditTooltips() {
    const state = usePlayerStorage.getState();
    return state.role === "GM" || state.permissions.includes("TEXT_UPDATE");
}

export class TooltipMode implements ToolMode {
    id = ID_MODE_TOOLTIP;
    shortcut = "O";
    icons: ToolIcon[] = [
        {
            icon: arrowCursor,
            label: "View and Manage Tooltips",
            filter: {
                activeTools: ["rodeo.owlbear.tool/text"],
            },
        },
    ];
    cursors: ToolCursor[] = [
        {
            cursor: "context-menu",
            filter: {
                permissions: ["TEXT_UPDATE"],
                target: [
                    {
                        key: ["metadata", METADATA_KEY_TOOLTIPS],
                        operator: "!=",
                        value: undefined,
                    },
                ],
            },
        },
        {
            cursor: "copy",
            filter: {
                permissions: ["TEXT_UPDATE"],
                target: [
                    {
                        key: ["metadata", METADATA_KEY_TOOLTIPS],
                        operator: "==",
                        value: undefined,
                        coordinator: "&&",
                    },
                    {
                        key: "layer",
                        operator: "!=",
                        value: "MAP",
                        coordinator: "&&",
                    },
                    {
                        key: "type",
                        operator: "==",
                        value: "IMAGE",
                        // coordinator: "||",
                    },
                    // {
                    //     key: "type",
                    //     operator: "==",
                    //     value: "SHAPE",
                    //     coordinator: "||",
                    // },
                ],
            },
        },
        {
            cursor: "not-allowed",
            filter: {
                permissions: ["TEXT_UPDATE"],
            },
        },
    ];
    preventDrag: ToolModeFilter = {
        target: [
            {
                key: "layer",
                operator: "==",
                value: "MAP",
            },
        ],
    };

    #target?: TooltipItem;
    #tooltipLabel?: Label["id"];

    #removePreview() {
        this.#target = undefined;
        if (this.#tooltipLabel) {
            void OBR.scene.local.deleteItems([this.#tooltipLabel]);
            this.#tooltipLabel = undefined;
        }
    }

    onToolClick = (_context: ToolContext, event: ToolEvent) => {
        void this;
        if (event.target && isTooltipItem(event.target)) {
            const data = event.target.metadata[METADATA_KEY_TOOLTIPS];
            if (data && tooltipVisible(data) && event.shiftKey) {
                // show to everyone
                this.#removePreview();
                void broadcastShowTooltip([event.target.id]);
            } else if (data && !tooltipVisible(data)) {
                // don't edit an invisible tooltip
                return;
            } else if (canEditTooltips()) {
                this.#removePreview();
                void openEdit(event.target.id);
            }
        }
    };

    // Don't allow double-click to select
    // eslint-disable-next-line class-methods-use-this
    onToolDoubleClick = () => false;

    onToolMove = (_context: ToolContext, event: ToolEvent) => {
        if (event.target?.id !== this.#target?.id) {
            // hover target changed
            if (this.#tooltipLabel) {
                void OBR.scene.local.deleteItems([this.#tooltipLabel]);
                this.#tooltipLabel = undefined;
            }

            if (event.target && isTooltipItem(event.target)) {
                // moved to new target
                this.#target = event.target;
                const data = processTooltip(
                    event.target.metadata[METADATA_KEY_TOOLTIPS],
                );
                const label = makeTooltipLabel(event.target, data);
                this.#tooltipLabel = label.id;
                void OBR.scene.local.addItems([label]);
            } else {
                // moved off target
                this.#target = undefined;
            }
        }
    };

    onDeactivate = () => {
        this.#removePreview();
    };
}
