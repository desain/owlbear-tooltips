import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll, sceneReadyPromise } from "owlbear-utils";
import { usePlayerStorage } from "./usePlayerStorage";

/**
 * @returns [Promise that resolves once store has initialized, function to stop syncing]
 */
export function startSyncing(): [
    initialized: Promise<void>,
    unsubscribe: VoidFunction,
] {
    // console.log("startSyncing");
    const {
        setSceneReady,
        handleThemeChange,
        setRole,
        handleGridChange,
        handleItemsChange,
        handlePermissionsChange,
        handleSelectionChange,
        handleRoomMetadataChange,
    } = usePlayerStorage.getState();

    const sceneReadyInitialized = OBR.scene.isReady().then(setSceneReady);
    const unsubscribeSceneReady = OBR.scene.onReadyChange((ready) => {
        setSceneReady(ready);
    });

    const roleInitialized = OBR.player.getRole().then(setRole);

    // const playerIdInitialized = OBR.player.getId().then(setPlayerId);
    const selectionInitialized = OBR.player
        .getSelection()
        .then(handleSelectionChange);
    const unsubscribePlayer = OBR.player.onChange((player) => {
        setRole(player.role);
        // setPlayerId(player.id);
        handleSelectionChange(player.selection);
    });

    const gridInitialized = Promise.all([
        OBR.scene.grid.getDpi(),
        OBR.scene.grid.getMeasurement(),
        OBR.scene.grid.getType(),
    ]).then(([dpi, measurement, type]) =>
        handleGridChange({ dpi, measurement, type }),
    );
    const unsubscribeGrid = OBR.scene.grid.onChange(handleGridChange);

    // const roomMetadataInitialized = OBR.room.getMetadata().then(handleRoomMetadataChange);
    // const unsubscribeRoomMetadata = OBR.room.onMetadataChange(handleRoomMetadataChange);
    const permissionsInitialized = OBR.room
        .getPermissions()
        .then(handlePermissionsChange);
    const unsubscribePermissions = OBR.room.onPermissionsChange(
        handlePermissionsChange,
    );

    const itemsInitialized = sceneReadyPromise()
        .then(() => OBR.scene.items.getItems())
        .then(handleItemsChange);
    const unsubscribeItems = OBR.scene.items.onChange(handleItemsChange);
    const themeInitialized = OBR.theme.getTheme().then(handleThemeChange);
    const unsubscribeTheme = OBR.theme.onChange(handleThemeChange);

    const roomMetadataInitialized = OBR.room
        .getMetadata()
        .then(handleRoomMetadataChange);
    const unsubscribeRoomMetadata = OBR.room.onMetadataChange(
        handleRoomMetadataChange,
    );

    return [
        Promise.all([
            sceneReadyInitialized,
            roleInitialized,
            // playerIdInitialized,
            selectionInitialized,
            gridInitialized,
            // roomMetadataInitialized,
            permissionsInitialized,
            itemsInitialized,
            themeInitialized,
            roomMetadataInitialized,
        ]).then(() => void 0),
        deferCallAll(
            unsubscribeSceneReady,
            unsubscribePlayer,
            unsubscribeGrid,
            unsubscribeItems,
            // unsubscribeRoomMetadata,
            unsubscribePermissions,
            unsubscribeTheme,
            unsubscribeRoomMetadata,
        ),
    ];
}
