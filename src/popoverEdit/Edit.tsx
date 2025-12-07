import { DeleteForever, Save } from "@mui/icons-material";
import { Button, Skeleton, Stack, Typography } from "@mui/material";
import OBR, { type TextStyle } from "@owlbear-rodeo/sdk";
import { produce } from "immer";
import { getName, usePopoverResizer, useRehydrate } from "owlbear-utils";
import type React from "react";
import { useEffect, useState } from "react";
import { ID_POPOVER_EDIT, METADATA_KEY_TOOLTIPS } from "../constants";
import type { TooltipData } from "../state/TooltipItem";
import {
    isTooltipItem,
    tooltipIsEmpty,
    type TooltipItem,
} from "../state/TooltipItem";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { RichTextEditor } from "./RichTextEditor";
import { StyleEditor } from "./StyleEditor";

interface EditProps {
    id: TooltipItem["id"];
}

function lowercaseAlign(
    align: TextStyle["textAlign"],
): NonNullable<React.CSSProperties["textAlign"]> {
    return align.toLowerCase() as Lowercase<typeof align>;
}

export const Edit: React.FC<EditProps> = ({ id }) => {
    useRehydrate(usePlayerStorage);
    const [itemName, setItemName] = useState("");
    const [data, setData] = useState<TooltipData | undefined>(undefined);
    const box = usePopoverResizer(ID_POPOVER_EDIT, 200, 1000, 400, 500);

    useEffect(() => {
        let cancelled = false;
        if (!data) {
            // Fetch data for the tooltip
            void OBR.scene.items.getItems([id]).then(([item]) => {
                if (cancelled) {
                    return;
                }
                if (item && isTooltipItem(item)) {
                    setItemName(getName(item));
                    setData(
                        item.metadata[METADATA_KEY_TOOLTIPS] ??
                            usePlayerStorage.getState().defaultTooltip,
                    );
                } else {
                    throw Error("Failed to load tooltip item");
                }
            });
        }
        return () => {
            cancelled = true;
        };
    }, [data, id]);

    return (
        <Stack ref={box} sx={{ p: 2 }}>
            {data ? (
                <>
                    <Typography variant="h6">
                        Edit tooltip for {itemName}
                    </Typography>
                    <RichTextEditor
                        initialValue={data.text.richText}
                        onChange={(value) => {
                            setData(
                                produce(data, (draft) => {
                                    draft.text.richText = value;
                                }),
                            );
                        }}
                        textAlign={lowercaseAlign(data.text.style.textAlign)}
                        color={data.text.style.fillColor}
                        backgroundColor={data.style.backgroundColor}
                        fontFamily={data.text.style.fontFamily}
                    />
                    <StyleEditor value={data} onChange={setData} />
                    <Stack
                        direction="row"
                        sx={{ mt: 2 }}
                        justifyContent="space-between"
                    >
                        <Button
                            startIcon={<DeleteForever />}
                            variant="outlined"
                            color="error"
                            onClick={async () => {
                                if (!confirm("Confirm deleting tooltip?")) {
                                    return;
                                }
                                await OBR.scene.items.updateItems(
                                    [id],
                                    ([item]) => {
                                        if (item) {
                                            delete item.metadata[
                                                METADATA_KEY_TOOLTIPS
                                            ];
                                        }
                                    },
                                );
                                await OBR.popover.close(ID_POPOVER_EDIT);
                            }}
                        >
                            Remove Tooltip
                        </Button>
                        <Button
                            startIcon={<Save />}
                            variant="contained"
                            onClick={async () => {
                                await OBR.scene.items.updateItems(
                                    [id],
                                    ([item]) => {
                                        if (item) {
                                            if (tooltipIsEmpty(data)) {
                                                delete item.metadata[
                                                    METADATA_KEY_TOOLTIPS
                                                ];
                                            } else {
                                                item.metadata[
                                                    METADATA_KEY_TOOLTIPS
                                                ] = data;
                                            }
                                        }
                                    },
                                );
                                await OBR.popover.close(ID_POPOVER_EDIT);
                            }}
                        >
                            Save
                        </Button>
                    </Stack>
                </>
            ) : (
                <>
                    <Skeleton sx={{ fontSize: "2rem" }} />
                    <Skeleton variant="rectangular" height={48} />
                    <Skeleton />
                    <Skeleton variant="rectangular" height={48} />
                </>
            )}
        </Stack>
    );
};
