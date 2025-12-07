import { ExtensionWrapper } from "owlbear-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { URL_PARAM_ID as URL_PARAM_ITEM_ID } from "../constants";
import { startSyncing } from "../state/startSyncing";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { Edit } from "./Edit";

document.addEventListener("DOMContentLoaded", () => {
    const root = ReactDOM.createRoot(document.getElementById("reactApp")!);
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get(URL_PARAM_ITEM_ID);
    if (!itemId) {
        throw Error("Missing item ID in Edit popover");
    }

    root.render(
        <React.StrictMode>
            <ExtensionWrapper
                startSyncing={startSyncing}
                useStoreFn={usePlayerStorage}
            >
                <Edit id={itemId} />
            </ExtensionWrapper>
        </React.StrictMode>,
    );
});
