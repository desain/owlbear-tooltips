import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { usePopoverResizer } from "owlbear-utils";
import { useEffect, useState } from "react";
import { version } from "../../package.json";
import { EXTENSION_NAME, ID_POPOVER_SETTINGS } from "../constants";
import { setRoomMetadata } from "../state/RoomMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function Settings() {
    const box = usePopoverResizer(ID_POPOVER_SETTINGS, 200, 600, 400, 500);

    const dpi = usePlayerStorage((s) => s.grid.dpi);
    const toolEnabled = usePlayerStorage((s) => s.toolEnabled);
    const setToolEnabled = usePlayerStorage((s) => s.setToolEnabled);

    const roomMetadata = usePlayerStorage((s) => s.roomMetadata);
    // debouncing
    const [localRoomMetadata, setLocalRoomMetadata] = useState(roomMetadata);
    useEffect(() => {
        setLocalRoomMetadata(roomMetadata);
    }, [roomMetadata]);
    useEffect(() => {
        const applyChange = setTimeout(async () => {
            if (localRoomMetadata !== roomMetadata) {
                await setRoomMetadata(localRoomMetadata);
            }
        }, 1000);
        return () => clearTimeout(applyChange);
    }, [localRoomMetadata, roomMetadata]);

    return (
        <Box sx={{ p: 2, minWidth: 300 }} ref={box}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {EXTENSION_NAME} Settings
            </Typography>
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
                    <MenuItem value={"TL"}>Top Left</MenuItem>
                    <MenuItem value={"TR"}>Top Right</MenuItem>
                    {/* <MenuItem value={"BL"}>Bottom-Left</MenuItem>
                    <MenuItem value={"BR"}>Bottom-Right</MenuItem> */}
                </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
            </Box>
            <Typography
                color="textSecondary"
                variant="subtitle1"
                sx={{ mt: 2 }}
            >
                {EXTENSION_NAME} version {version}
            </Typography>
        </Box>
    );
}
