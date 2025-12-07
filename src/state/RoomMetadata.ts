import type { Vector2 } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import { isObject, isVector2 } from "owlbear-utils";
import { METADATA_KEY_ROOM } from "../constants";

type InfoIconAnchorHorizontal = "L" | "R";
type InfoIconAnchorVertical = "T" | "B";

export type InfoIconAnchor =
    `${InfoIconAnchorVertical}${InfoIconAnchorHorizontal}`;

function isInfoIconAnchor(s: unknown): s is InfoIconAnchor {
    return s === "TL" || s === "TR" || s === "BL" || s === "BR";
}

export interface RoomMetadata {
    anchor: InfoIconAnchor;
    offset: Vector2;
}
export function isRoomMetadata(metadata: unknown): metadata is RoomMetadata {
    return (
        isObject(metadata) &&
        "anchor" in metadata &&
        isInfoIconAnchor(metadata.anchor) &&
        "offset" in metadata &&
        isVector2(metadata.offset)
    );
}

export function setRoomMetadata(roomMetadata: RoomMetadata) {
    console.log(roomMetadata);
    return OBR.room.setMetadata({
        [METADATA_KEY_ROOM]: roomMetadata,
    });
}
