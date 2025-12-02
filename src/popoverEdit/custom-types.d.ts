import type { Element, FormattedText } from "@owlbear-rodeo/sdk";
import type { BaseEditor } from "slate";
import type { HistoryEditor } from "slate-history";
import type { ReactEditor } from "slate-react";

// https://docs.slatejs.org/concepts/12-typescript

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: Element;
        Text: FormattedText;
    }
}
