import OBR, {
    buildImage,
    isImage,
    Math2,
    type Image,
    type ImageContent,
    type ImageGrid,
    type Item,
    type Label,
} from "@owlbear-rodeo/sdk";
import { diffSets, getBounds, Patcher, waitFor } from "owlbear-utils";
import { METADATA_KEY_TOOLTIPS } from "../constants";
import {
    tooltipVisible,
    type TooltipData,
    type TooltipItem,
} from "../state/TooltipItem";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { makeTooltipLabel } from "../tool/TooltipLabel";

import infoActive from "../../assets/info-active.svg";
import info from "../../assets/info.svg";

type InfoIcon = Image & { attachedTo: NonNullable<Image["attachedTo"]> };

const POISON_CHECK_TIME_MS = 100;

export function buildSvgIcon(url: string, size = 512) {
    const imageContent = {
        url: window.location.origin + url,
        mime: "image/svg+xml",
        width: size,
        height: size,
    } satisfies ImageContent;
    const imageGrid = {
        dpi: size,
        offset: { x: size / 2, y: size / 2 },
    } satisfies ImageGrid;

    return buildImage(imageContent, imageGrid);
}

function makeIcon(item: TooltipItem): InfoIcon {
    const roomMetadata = usePlayerStorage.getState().roomMetadata;
    const { min, max } = getBounds(item, usePlayerStorage.getState().grid);
    const position = Math2.add(roomMetadata.offset, {
        x: roomMetadata.anchor.endsWith("L") ? min.x : max.x,
        y: roomMetadata.anchor.startsWith("T") ? min.y : max.y,
    });
    return buildSvgIcon(info)
        .disableHit(false)
        .layer("CONTROL")
        .position(position)
        .attachedTo(item.id)
        .scale({ x: 0.3, y: 0.3 })
        .disableAttachmentBehavior(["COPY", "LOCKED", "SCALE"])
        .build() as InfoIcon;
}

interface IconData {
    item: Image & { attachedTo: string };
    /**
     * When an icon's token is deselected, it is poisoned and starts dying.
     * If the icon is selected quickly after (since the reason for the
     * token's deselection was that the player clicked on the icon),
     * then the icon is cured.
     * If the icon is not selected quickly after (since the player just
     * clicked away from the icon), then the icon dies.
     */
    poisoned: boolean;
    expandedId?: Label["id"];
}

export function startWatchingExpandIcons() {
    const tokenToIcon = new Map<TooltipItem["id"], InfoIcon["id"]>();
    const icons = new Map<InfoIcon["id"], IconData>();
    const patcher = new Patcher();

    const expand = (iconId: InfoIcon["id"], tooltipData: TooltipData) => {
        const iconData = icons.get(iconId);
        if (!iconData) {
            console.error("cannot expand icon without data", iconId);
            return;
        }

        const label = makeTooltipLabel(iconData.item, tooltipData);
        icons.set(iconId, {
            ...iconData,
            expandedId: label.id,
        });
        patcher.addLocal(label);
        patcher.updateLocal(iconId, (draft) => {
            if (isImage(draft)) {
                draft.image.url = window.location.origin + infoActive;
            }
        });
    };

    const collapse = (iconId: InfoIcon["id"]) => {
        const iconData = icons.get(iconId);
        if (!iconData) {
            console.error("cannot collapse icon without data", iconId);
            return;
        }

        icons.set(iconId, { ...iconData, expandedId: undefined });
        if (iconData.expandedId) {
            patcher.deleteLocal(iconData.expandedId);
            patcher.updateLocal(iconId, (draft) => {
                if (isImage(draft)) {
                    draft.image.url = window.location.origin + info;
                }
            });
        }
    };

    const cure = (iconId: InfoIcon["id"]) => {
        // console.debug("curing", iconId);
        const iconData = icons.get(iconId);
        if (iconData) {
            icons.set(iconId, { ...iconData, poisoned: false });
        } else {
            console.warn("cannot cure nonexistent icon", iconId);
        }
    };

    const checkPoisonedIcons = async () => {
        await waitFor(POISON_CHECK_TIME_MS);

        let needsPatcherApply = false;
        for (const iconData of icons.values()) {
            if (iconData.poisoned) {
                // console.debug("killing via poison", iconData);
                deleteIconForToken(iconData.item.attachedTo);
                needsPatcherApply = true;
            }
        }

        if (needsPatcherApply) {
            await patcher.apply();
        }
    };

    const deleteIconForToken = (tokenId: TooltipItem["id"]) => {
        const iconId = tokenToIcon.get(tokenId);
        if (iconId) {
            tokenToIcon.delete(tokenId);
            icons.delete(iconId);
            patcher.deleteLocal(iconId);
        } else {
            console.warn("cannot delete nonexistent icon for token", tokenId);
        }
    };

    return usePlayerStorage.subscribe(
        (s) => s.selection,
        (newSelection, oldSelection) => {
            // setup poison
            let needSchedulePoisonCheck = false;
            const poison = (iconId: InfoIcon["id"]) => {
                // console.debug("poisoning", iconId);
                needSchedulePoisonCheck = true;
                const iconData = icons.get(iconId);
                if (iconData) {
                    icons.set(iconId, { ...iconData, poisoned: true });
                } else {
                    console.warn("cannot poison icon with no data", iconId);
                }
            };

            // console.debug(newSelection);
            const tooltipItems = usePlayerStorage.getState().tooltipItems;
            const newSelectionSet = new Set(newSelection ?? []);
            const oldSelectionSet = new Set(oldSelection ?? []);
            const { created: newlySelected, deleted: deselected } = diffSets(
                oldSelectionSet,
                newSelectionSet,
            );

            const toSelect: Item["id"][] = [];
            const toDeselect: Image["id"][] = [];

            // handle clicks on icons
            for (const newSelectedIcon of newlySelected.filter((id) =>
                icons.has(id),
            )) {
                const {
                    item: { attachedTo: tokenId },
                    expandedId,
                } = icons.get(newSelectedIcon)!;

                // never leave icons selected
                toDeselect.push(newSelectedIcon);

                // Re-select its token if it wasn't already selected
                if (!newSelectionSet.has(tokenId)) {
                    toSelect.push(tokenId);
                }

                // icon was selected, so don't let poison delete it
                cure(newSelectedIcon);

                // did we click an expanded icon?
                if (expandedId) {
                    // It was expanded, so collapse it
                    collapse(newSelectedIcon);
                } else {
                    // clicked a collapsed icon. Expand it
                    const tooltipData =
                        tooltipItems.get(tokenId)?.metadata[
                            METADATA_KEY_TOOLTIPS
                        ];
                    if (tooltipData) {
                        expand(newSelectedIcon, tooltipData);
                    }
                }
            }

            // poison icons of deselected tokens
            for (const tokenId of deselected.filter((id) =>
                tokenToIcon.has(id),
            )) {
                const iconId = tokenToIcon.get(tokenId)!;
                if (!newSelectionSet.has(iconId)) {
                    poison(iconId);
                }
            }

            // create icons for newly selected tokens that don't already have them
            for (const tokenId of newlySelected.filter((id) =>
                tooltipItems.has(id),
            )) {
                const token = tooltipItems.get(tokenId)!;
                if (
                    !tokenToIcon.has(tokenId) &&
                    token.metadata[METADATA_KEY_TOOLTIPS] &&
                    tooltipVisible(token.metadata[METADATA_KEY_TOOLTIPS])
                ) {
                    const icon = makeIcon(token);
                    patcher.addLocal(icon);
                    tokenToIcon.set(tokenId, icon.id);
                    icons.set(icon.id, { item: icon, poisoned: false });
                }
            }

            if (needSchedulePoisonCheck) {
                void checkPoisonedIcons();
            }
            if (toSelect.length > 0) {
                void OBR.player.select(toSelect, false);
            }
            if (toDeselect.length > 0) {
                void OBR.player.deselect(toDeselect);
            }

            void patcher.apply();
        },
    );
}
