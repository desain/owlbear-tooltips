import {
    DisabledVisible,
    FormatAlignCenter,
    FormatAlignLeft,
    FormatAlignRight,
    SettingsOverscan,
    Visibility,
    WidthNormalOutlined,
    WidthWideOutlined,
} from "@mui/icons-material";
import {
    MenuItem,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import type { Player, TextStyle } from "@owlbear-rodeo/sdk";
import { produce } from "immer";
import { ColorInput, Control, assumeHexColor } from "owlbear-utils";
import type React from "react";
import type { TooltipData } from "../state/TooltipItem";
import { usePlayerStorage } from "../state/usePlayerStorage";
import GmIcon from "./GmIcon";

const OWLBEAR_FONTS = [
    ["Rounded", "Roboto"],
    ["Fantasy", "Gotica"],
    ["Marker", "Permanent Marker"],
    ["Script", "Lemon Tuesday"],
    ["Cursive", "Dancing Script"],
    ["Mono", "Courier Prime"],
    ["Serif", "EB Garamond"],
] as const;

interface StyleEditorProps {
    value: TooltipData;
    onChange: (value: TooltipData) => void;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
    value,
    onChange,
}) => {
    const playerId = usePlayerStorage((s) => s.playerId);
    const role = usePlayerStorage((s) => s.role);

    return (
        <>
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
                        value={value.text.style.fontFamily}
                        onChange={(e) =>
                            onChange(
                                produce(value, (draft) => {
                                    draft.text.style.fontFamily =
                                        e.target.value;
                                }),
                            )
                        }
                    >
                        {...[...OWLBEAR_FONTS.entries()].map(
                            ([, [displayName, fontFamily]]) => (
                                <MenuItem key={fontFamily} value={fontFamily}>
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
                    value={assumeHexColor(value.style.backgroundColor)}
                    onChange={(color) =>
                        onChange(
                            produce(value, (draft) => {
                                draft.style.backgroundColor = color;
                            }),
                        )
                    }
                />
                <ColorInput
                    title="Text"
                    value={assumeHexColor(value.text.style.fillColor)}
                    onChange={(color) =>
                        onChange(
                            produce(value, (draft) => {
                                draft.text.style.fillColor = color;
                            }),
                        )
                    }
                />
                <Control label="Align Text">
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={value.text.style.textAlign}
                        onChange={(
                            _e,
                            textAlign: TextStyle["textAlign"] | null,
                        ) =>
                            onChange(
                                produce(value, (draft) => {
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
                <Control label="Visible To">
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={value.visibleTo ?? "undefined"}
                        onChange={(_e, visibleTo: Player["id"]) =>
                            onChange(
                                produce(value, (draft) => {
                                    if (visibleTo === "undefined") {
                                        delete draft.visibleTo;
                                    } else {
                                        draft.visibleTo = visibleTo;
                                    }
                                }),
                            )
                        }
                    >
                        <ToggleButton
                            value="undefined"
                            title="Visible to everyone"
                        >
                            <Visibility sx={{ mr: 1 }} />
                            All
                        </ToggleButton>
                        <ToggleButton
                            value={playerId}
                            title="Visible to me and and the GM"
                        >
                            <DisabledVisible sx={{ mr: 1 }} />
                            Me
                        </ToggleButton>
                        <ToggleButton
                            value="GM"
                            title="Visible to GM only"
                            disabled={role !== "GM"}
                        >
                            <GmIcon sx={{ mr: 1 }} />
                            GM
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Control>
                <Control label="Width">
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={value.text.width}
                        onChange={(
                            _e,
                            width: TooltipData["text"]["width"] | null,
                        ) =>
                            onChange(
                                produce(value, (draft) => {
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
        </>
    );
};
