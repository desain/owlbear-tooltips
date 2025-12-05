import {
    DeleteForever,
    DisabledVisible,
    FormatAlignCenter,
    FormatAlignLeft,
    FormatAlignRight,
    Save,
    SettingsOverscan,
    Visibility,
    WidthNormalOutlined,
    WidthWideOutlined,
} from "@mui/icons-material";
import {
    Button,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import OBR, { type Descendant, type TextStyle } from "@owlbear-rodeo/sdk";
import { produce } from "immer";
import {
    assumeHexColor,
    ColorInput,
    Control,
    getName,
    usePopoverResizer,
    useRehydrate,
} from "owlbear-utils";
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

const DEFAULT_TOOLTIP: TooltipData = {
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
                        text: "",
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
            fillColor: "black",
            fillOpacity: 1,
            strokeColor: "black",
            strokeOpacity: 1,
            strokeWidth: 0,
            lineHeight: 1.5,
        },
    },
    style: {
        backgroundColor: "#ccced8ff",
        backgroundOpacity: 1,
        cornerRadius: 8,
        pointerDirection: "DOWN",
        pointerWidth: 8,
        pointerHeight: 12,
    },
};

const OWLBEAR_FONTS = [
    ["Rounded", "Roboto"],
    ["Fantasy", "Gotica"],
    ["Marker", "Permanent Marker"],
    ["Script", "Lemon Tuesday"],
    ["Cursive", "Dancing Script"],
    ["Mono", "Courier Prime"],
    ["Serif", "EB Garamond"],
] as const;

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
    const role = usePlayerStorage((s) => s.role);

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
                        item.metadata[METADATA_KEY_TOOLTIPS] ?? DEFAULT_TOOLTIP,
                    );
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
                                    draft.text.richText = value as Descendant[];
                                }),
                            );
                        }}
                        textAlign={lowercaseAlign(data.text.style.textAlign)}
                        color={data.text.style.fillColor}
                        backgroundColor={data.style.backgroundColor}
                        fontFamily={data.text.style.fontFamily}
                    />
                    <Stack
                        direction="row"
                        sx={{ mt: 2 }}
                        justifyContent="space-between"
                    >
                        <Control label="Font">
                            <Select
                                size="small"
                                sx={{
                                    minWidth: 120,
                                }}
                                value={data.text.style.fontFamily}
                                onChange={(e) =>
                                    setData(
                                        produce(data, (draft) => {
                                            draft.text.style.fontFamily =
                                                e.target.value;
                                        }),
                                    )
                                }
                            >
                                {...[...OWLBEAR_FONTS.entries()].map(
                                    ([, [displayName, fontFamily]]) => (
                                        <MenuItem
                                            key={fontFamily}
                                            value={fontFamily}
                                        >
                                            <Typography fontFamily={fontFamily}>
                                                {displayName}
                                            </Typography>
                                        </MenuItem>
                                    ),
                                )}
                            </Select>
                        </Control>
                        <ColorInput
                            title="Base"
                            value={assumeHexColor(data.style.backgroundColor)}
                            onChange={(color) =>
                                setData(
                                    produce(data, (draft) => {
                                        draft.style.backgroundColor = color;
                                    }),
                                )
                            }
                        />
                        <ColorInput
                            title="Text"
                            value={assumeHexColor(data.text.style.fillColor)}
                            onChange={(color) =>
                                setData(
                                    produce(data, (draft) => {
                                        draft.text.style.fillColor = color;
                                    }),
                                )
                            }
                        />
                        <Control label="Align Text">
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={data.text.style.textAlign}
                                onChange={(
                                    _e,
                                    textAlign: TextStyle["textAlign"] | null,
                                ) =>
                                    setData(
                                        produce(data, (draft) => {
                                            draft.text.style.textAlign =
                                                textAlign ?? "CENTER";
                                        }),
                                    )
                                }
                            >
                                <ToggleButton title="Left" value="LEFT">
                                    <FormatAlignLeft />
                                </ToggleButton>
                                <ToggleButton title="Center" value="CENTER">
                                    <FormatAlignCenter />
                                </ToggleButton>
                                <ToggleButton title="Right" value="RIGHT">
                                    <FormatAlignRight />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Control>
                    </Stack>
                    <Stack
                        direction="row"
                        sx={{ mt: 2 }}
                        justifyContent="space-between"
                    >
                        <Control label="Visibility">
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={data.visibleTo ?? "ALL"}
                                onChange={(_e, visibleTo) =>
                                    setData(
                                        produce(data, (draft) => {
                                            if (visibleTo === "GM") {
                                                draft.visibleTo = "GM";
                                            } else {
                                                delete draft.visibleTo;
                                            }
                                        }),
                                    )
                                }
                            >
                                <ToggleButton
                                    value="ALL"
                                    title="Visible to Everyone"
                                >
                                    <Visibility sx={{ mr: 1 }} />
                                    All
                                </ToggleButton>
                                <ToggleButton
                                    value="GM"
                                    title="Visible to GM Only"
                                    disabled={role !== "GM"}
                                >
                                    <DisabledVisible sx={{ mr: 1 }} />
                                    GM
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Control>
                        <Control label="Width">
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={data.text.width}
                                onChange={(
                                    _e,
                                    width: TooltipData["text"]["width"] | null,
                                ) =>
                                    setData(
                                        produce(data, (draft) => {
                                            if (width) {
                                                draft.text.width = width;
                                            }
                                        }),
                                    )
                                }
                            >
                                <ToggleButton title="Fit to text" value="AUTO">
                                    {/* <WidthFullOutlined /> */}
                                    <SettingsOverscan />
                                </ToggleButton>
                                <ToggleButton title="Wide" value={1000}>
                                    <WidthWideOutlined />
                                </ToggleButton>
                                <ToggleButton title="Narrow" value={300}>
                                    <WidthNormalOutlined />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Control>
                    </Stack>
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
