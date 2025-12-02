import OBR, {
    type Item,
    type Metadata,
    type Permission,
    type Player,
    type Theme,
} from "@owlbear-rodeo/sdk";
import { enableMapSet } from "immer";
import {
    DEFAULT_GRID,
    DEFAULT_THEME,
    toItemMap,
    type ExtractNonFunctions,
    type GridParams,
    type GridParsed,
    type ItemMap,
    type Role,
} from "owlbear-utils";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
    LOCAL_STORAGE_STORE_NAME,
    METADATA_KEY_ROOM,
    METADATA_KEY_TOOLTIPS,
} from "../constants";
import { isRoomMetadata, type RoomMetadata } from "./RoomMetadata";
import { isTooltipItem, type TooltipItem } from "./TooltipItem";

enableMapSet();

interface LocalStorage {
    readonly toolEnabled: boolean;
    readonly hoverDelay: number;
    readonly setToolEnabled: (this: void, toolEnabled: boolean) => void;
    readonly setHoverDelay: (this: void, hoverDelay: number) => void;
}
function partializeLocalStorage({
    toolEnabled,
    hoverDelay,
}: LocalStorage): ExtractNonFunctions<LocalStorage> {
    return {
        toolEnabled,
        hoverDelay,
    };
}

interface OwlbearStore {
    readonly sceneReady: boolean;
    readonly theme: Theme;
    readonly role: Role;
    readonly selection: Player["selection"];
    readonly permissions: Permission[];
    readonly grid: GridParsed;
    readonly tooltipItems: ItemMap<TooltipItem>;
    // readonly playerId: string;
    readonly roomMetadata: RoomMetadata;
    readonly setSceneReady: (this: void, sceneReady: boolean) => void;
    readonly setRole: (this: void, role: Role) => void;
    readonly handleSelectionChange: (
        this: void,
        selection: Player["selection"],
    ) => void;
    readonly handlePermissionsChange: (
        this: void,
        permissions: Permission[],
    ) => void;
    readonly handleItemsChange: (this: void, items: Item[]) => void;
    readonly handleThemeChange: (this: void, theme: Theme) => void;
    readonly handleGridChange: (this: void, grid: GridParams) => Promise<void>;
    readonly handleRoomMetadataChange: (this: void, metadata: Metadata) => void;
}

export const usePlayerStorage = create<LocalStorage & OwlbearStore>()(
    subscribeWithSelector(
        persist(
            immer((set) => ({
                // local storage
                toolEnabled: true,
                hoverDelay: 0,
                setToolEnabled: (toolEnabled) => set({ toolEnabled }),
                setHoverDelay: (hoverDelay) => set({ hoverDelay }),
                // owlbear store
                sceneReady: false,
                theme: DEFAULT_THEME,
                role: "PLAYER",
                selection: [],
                permissions: [],
                grid: DEFAULT_GRID,
                tooltipItems: new Map(),
                selectedTooltipItems: new Map(),
                roomMetadata: {
                    anchor: "TR",
                    offset: { x: 0, y: 0 },
                },
                setSceneReady: (sceneReady: boolean) => set({ sceneReady }),
                setRole: (role: Role) => set({ role }),
                handleSelectionChange: (selection) => {
                    set({
                        selection,
                    });
                },
                // setPlayerId: (playerId: string) => set({ playerId }),
                handlePermissionsChange: (permissions) => set({ permissions }),

                handleItemsChange: (items: Item[]) => {
                    const tooltipItems = toItemMap(
                        items
                            .filter(isTooltipItem)
                            .filter(
                                (item) => item.metadata[METADATA_KEY_TOOLTIPS],
                            ),
                    );
                    set({
                        tooltipItems,
                    });
                },

                handleThemeChange: (theme) => {
                    set({ theme });
                },
                handleGridChange: async (grid: GridParams) => {
                    const parsedScale = (await OBR.scene.grid.getScale())
                        .parsed;
                    set({
                        grid: {
                            dpi: grid.dpi,
                            measurement: grid.measurement,
                            type: grid.type,
                            parsedScale,
                        },
                    });
                },
                handleRoomMetadataChange: (metadata) => {
                    const roomMetadata = metadata[METADATA_KEY_ROOM];
                    if (isRoomMetadata(roomMetadata)) {
                        set({ roomMetadata });
                    }
                },
            })),

            {
                name: LOCAL_STORAGE_STORE_NAME,
                partialize: partializeLocalStorage,
            },
        ),
    ),
);
