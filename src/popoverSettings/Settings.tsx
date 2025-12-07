import Help from "@mui/icons-material/HelpOutline";
import Save from "@mui/icons-material/Save";
import {
    Box,
    Button,
    Divider,
    FormControl,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { usePopoverResizer } from "owlbear-utils";
import React, { useEffect, useState } from "react";
import { version } from "../../package.json";
import { EXTENSION_NAME, ID_POPOVER_SETTINGS } from "../constants";
import { StyleEditor } from "../popoverEdit/StyleEditor";
import { setRoomMetadata, type RoomMetadata } from "../state/RoomMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

interface SettingsTitleProps {
    title: string;
    helpUrl: string;
}

const SettingsTitle = ({ title, helpUrl }: SettingsTitleProps) => (
    <Typography
        variant="h6"
        sx={{ mb: 2, display: "flex", alignItems: "center" }}
    >
        {title}
        <Link
            href={helpUrl}
            title="Extension guide"
            target="_blank"
            rel="noopener noreferrer"
            style={{
                marginLeft: "8px",
                display: "flex",
                alignItems: "center",
                color: "inherit",
            }}
        >
            <Help fontSize="small" />
        </Link>
    </Typography>
);

interface GmSettingsProps {
    localRoomMetadata: RoomMetadata;
    setLocalRoomMetadata: (localRoomMetadata: RoomMetadata) => void;
}

const GmSettings: React.FC<GmSettingsProps> = ({
    localRoomMetadata,
    setLocalRoomMetadata,
}) => {
    const dpi = usePlayerStorage((s) => s.grid.dpi);
    return (
        <>
            <Typography variant="caption">GM-only settings</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="anchor-select-label">
                    Info Icon Anchor
                </InputLabel>
                <Select
                    size="small"
                    labelId="anchor-select-label"
                    value={localRoomMetadata.anchor}
                    label="Info Icon Anchor"
                    onChange={(e) =>
                        setLocalRoomMetadata({
                            ...localRoomMetadata,
                            anchor: e.target.value,
                        })
                    }
                >
                    <MenuItem value="TL">Top Left</MenuItem>
                    <MenuItem value="TR">Top Right</MenuItem>
                    {/* <MenuItem value="BL">Bottom-Left</MenuItem>
                    <MenuItem value="BR">Bottom-Right</MenuItem> */}
                </Select>
            </FormControl>
            <Stack direction="row" sx={{ gap: 2, mt: 2 }}>
                <TextField
                    size="small"
                    label="Offset X"
                    type="number"
                    value={localRoomMetadata.offset.x}
                    slotProps={{
                        htmlInput: {
                            step: dpi / 10,
                        },
                    }}
                    onChange={(e) =>
                        setLocalRoomMetadata({
                            ...localRoomMetadata,
                            offset: {
                                ...localRoomMetadata.offset,
                                x: parseInt(e.target.value),
                            },
                        })
                    }
                />
                <TextField
                    size="small"
                    label="Offset Y"
                    type="number"
                    value={localRoomMetadata.offset.y}
                    slotProps={{
                        htmlInput: {
                            step: dpi / 10,
                        },
                    }}
                    onChange={(e) =>
                        setLocalRoomMetadata({
                            ...localRoomMetadata,
                            offset: {
                                ...localRoomMetadata.offset,
                                y: parseInt(e.target.value),
                            },
                        })
                    }
                />
            </Stack>
        </>
    );
};

export const Settings: React.FC = () => {
    const box = usePopoverResizer(ID_POPOVER_SETTINGS, 200, 600, 400, 500);
    const role = usePlayerStorage((s) => s.role);
    const defaultTooltip = usePlayerStorage((s) => s.defaultTooltip);
    const setDefaultTooltip = usePlayerStorage((s) => s.setDefaultTooltip);
    const [localDefaultTooltip, setLocalDefaultTooltip] =
        useState(defaultTooltip);

    const roomMetadata = usePlayerStorage((s) => s.roomMetadata);
    const [localRoomMetadata, setLocalRoomMetadata] = useState(roomMetadata);
    useEffect(() => {
        setLocalRoomMetadata(roomMetadata);
    }, [roomMetadata]);
    // useEffect(() => {
    //     const applyChange = setTimeout(async () => {
    //         if (localRoomMetadata !== roomMetadata) {
    //             await setRoomMetadata(localRoomMetadata);
    //         }
    //     }, 1000);
    //     return () => clearTimeout(applyChange);
    // }, [localRoomMetadata, roomMetadata]);

    return (
        <Box sx={{ p: 2, minWidth: 300 }} ref={box}>
            <SettingsTitle
                title={EXTENSION_NAME + " Settings"}
                helpUrl="https://github.com/desain/owlbear-tooltips"
            />
            {/* <FormControlLabel
                control={
                    <Switch
                        checked={toolEnabled}
                        onChange={(e) => setToolEnabled(e.target.checked)}
                    />
                }
                label="Enable Tool"
                sx={{ mb: 2 }}
            /> */}
            <Typography variant="caption">New Tooltip Defaults</Typography>
            <StyleEditor
                value={localDefaultTooltip}
                onChange={setLocalDefaultTooltip}
            />
            {role === "GM" && (
                <>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <GmSettings
                        localRoomMetadata={localRoomMetadata}
                        setLocalRoomMetadata={setLocalRoomMetadata}
                    />
                </>
            )}
            <Button
                startIcon={<Save />}
                fullWidth
                sx={{ mt: 2 }}
                variant="contained"
                onClick={async () => {
                    setDefaultTooltip(localDefaultTooltip);
                    if (role === "GM") {
                        await setRoomMetadata(localRoomMetadata);
                    }
                    await OBR.popover.close(ID_POPOVER_SETTINGS);
                }}
            >
                Save
            </Button>
            <Typography
                color="textSecondary"
                variant="subtitle1"
                sx={{ mt: 2 }}
            >
                {EXTENSION_NAME} version {version}
            </Typography>
        </Box>
    );
};
