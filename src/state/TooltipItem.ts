import {
    isElement,
    isFormattedText,
    isImage,
    type Image,
    type Item,
    type Label,
    type Layer,
} from "@owlbear-rodeo/sdk";
import {
    containsImplies,
    isObject,
    type HasParameterizedMetadata,
} from "owlbear-utils";
import { METADATA_KEY_TOOLTIPS } from "../constants";
import { usePlayerStorage } from "./usePlayerStorage";

export interface TooltipData extends Pick<Label, "text" | "style"> {
    /**
     * Undefined = visible to all;
     */
    visibleTo?: "GM";
}

function isTooltipData(data: unknown): data is TooltipData {
    return (
        isObject(data) &&
        "text" in data &&
        isObject(data.text) &&
        "style" in data &&
        isObject(data.style) &&
        containsImplies(data, "visibleTo", (visibleTo) => visibleTo === "GM")
    );
}

export function tooltipVisible(data: TooltipData) {
    return data.visibleTo !== "GM" || usePlayerStorage.getState().role === "GM";
}

export function tooltipIsEmpty(data: TooltipData) {
    return (
        data.text.richText.length === 1 &&
        data.text.richText[0] &&
        (isElement(data.text.richText[0])
            ? data.text.richText[0].children.length === 1 &&
              data.text.richText[0].children[0] &&
              isFormattedText(data.text.richText[0].children[0]) &&
              data.text.richText[0].children[0].text === ""
            : data.text.richText[0].text === "")
    );
}

export type TooltipItem = Image & {
    layer: Exclude<Layer, "MAP">;
} & HasParameterizedMetadata<
        typeof METADATA_KEY_TOOLTIPS,
        TooltipData | undefined
    >;

export function isTooltipItem(item: Item): item is TooltipItem {
    return (
        isImage(item) &&
        item.layer !== "MAP" &&
        containsImplies(item.metadata, METADATA_KEY_TOOLTIPS, isTooltipData)
    );
}
