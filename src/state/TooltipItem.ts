import {
    isElement,
    isFormattedText,
    isImage,
    type Image,
    type Item,
    type Label,
    type Layer,
    type Player,
    type Vector2,
} from "@owlbear-rodeo/sdk";
import {
    containsImplies,
    isObject,
    isString,
    isVector2,
    type HasParameterizedMetadata,
} from "owlbear-utils";
import { METADATA_KEY_TOOLTIPS } from "../constants";
import { usePlayerStorage } from "./usePlayerStorage";

export interface TooltipData extends Pick<Label, "text" | "style"> {
    /**
     * Undefined = visible to all;
     * "GM" = visible to only GM
     * id = visible to that ID (and GM)
     */
    visibleTo?: Player["id"];
    /**
     * If present, overrides global offset from anchor point
     */
    offset?: Vector2;
}

function isTooltipData(data: unknown): data is TooltipData {
    return (
        isObject(data) &&
        "text" in data &&
        isObject(data.text) &&
        "style" in data &&
        isObject(data.style) &&
        containsImplies(data, "visibleTo", isString) &&
        containsImplies(data, "offset", isVector2)
    );
}

export function tooltipVisible({ visibleTo }: TooltipData) {
    const { role, playerId } = usePlayerStorage.getState();
    console.log(playerId);
    return !visibleTo || role === "GM" || playerId === visibleTo;
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
