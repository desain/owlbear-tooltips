import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll, startRehydrating } from "owlbear-utils";
import { version } from "../package.json";
import { startWatchingExpandIcons } from "./background/startWatchingExpandIcons";
import { installBroadcastListener } from "./broadcast/broadcast";
import { EXTENSION_NAME } from "./constants";
import { startSyncing } from "./state/startSyncing";
import { usePlayerStorage } from "./state/usePlayerStorage";
import { startWatchingToolEnabled } from "./tool/tool";

export function install() {
    let uninstall: VoidFunction = () => {
        // nothing to uninstall
    };

    async function installExtension(): Promise<VoidFunction> {
        console.info(`${EXTENSION_NAME} version ${version}`);

        // const rbush = initRbush();
        const stopWatchingExpandIcons = startWatchingExpandIcons();
        const [storeInitialized, stopSyncing] = startSyncing();
        await storeInitialized;
        const stopRehydrating = startRehydrating(usePlayerStorage);
        const stopWatchingTool = await startWatchingToolEnabled();
        const uninstallBroadcastListener = installBroadcastListener();

        return deferCallAll(
            () => console.log(`Uninstalling ${EXTENSION_NAME}`),
            stopWatchingExpandIcons,
            stopSyncing,
            stopRehydrating,
            stopWatchingTool,
            uninstallBroadcastListener,
        );
    }

    OBR.onReady(async () => {
        // console.log("onReady");

        if (await OBR.scene.isReady()) {
            // console.log("isReady");
            uninstall = await installExtension();
        }

        OBR.scene.onReadyChange(async (ready) => {
            // console.log("onReadyChange", ready);
            if (ready) {
                uninstall = await installExtension();
            } else {
                uninstall();
                uninstall = () => {
                    // nothing to uninstall anymore
                };
            }
        });
    });
}
