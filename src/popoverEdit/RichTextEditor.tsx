import {
    Box,
    Icon,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { type ElementFormat, type MarkFormat } from "@owlbear-rodeo/sdk";
import isHotkey from "is-hotkey";
import type { KeyboardEvent } from "react";
import React, { useCallback, useMemo } from "react";
import {
    Editor,
    Element as SlateElement,
    Transforms,
    createEditor,
} from "slate";
import { withHistory } from "slate-history";
import type { RenderElementProps, RenderLeafProps } from "slate-react";
import { Editable, Slate, useSlate, withReact } from "slate-react";

const HOTKEYS: Record<string, MarkFormat> = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"] as const;
type ListType = (typeof LIST_TYPES)[number];

type RichTextEditorProps = Pick<
    Parameters<typeof Slate>[0],
    "initialValue" | "onChange"
> &
    Pick<
        React.CSSProperties,
        "backgroundColor" | "color" | "fontFamily" | "textAlign"
    >;

/**
 * Adapted from:
 * https://github.com/ianstormtaylor/slate/blob/main/site/examples/ts/richtext.tsx
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    initialValue,
    onChange,
    textAlign,
    color,
    backgroundColor,
    fontFamily,
}) => {
    const renderElement = useCallback(
        (props: RenderElementProps) => <RenderedElement {...props} />,
        [],
    );
    const renderLeaf = useCallback(
        (props: RenderLeafProps) => <Leaf {...props} />,
        [],
    );
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
        <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
            <Stack alignItems="center">
                <ToggleButtonGroup sx={{ mb: 1 }}>
                    <MarkButton format="bold" icon="format_bold" />
                    <MarkButton format="italic" icon="format_italic" />
                    <MarkButton format="underline" icon="format_underlined" />
                    <BlockButton format="heading-one" icon="looks_one" />
                    <BlockButton format="heading-two" icon="looks_two" />
                    <BlockButton
                        format="numbered-list"
                        icon="format_list_numbered"
                    />
                    <BlockButton
                        format="bulleted-list"
                        icon="format_list_bulleted"
                    />
                </ToggleButtonGroup>
            </Stack>

            <Box
                sx={{
                    px: 1,
                    borderRadius: "10px",
                    backgroundColor,
                }}
            >
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter a tooltip…"
                    spellCheck
                    autoFocus
                    style={{
                        paddingInline: "5px",
                        color,
                        fontFamily,
                        textAlign,
                    }}
                    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                        Object.entries(HOTKEYS).forEach(([hotkey, mark]) => {
                            if (isHotkey(hotkey, event)) {
                                event.preventDefault();
                                toggleMark(editor, mark);
                            }
                        });
                    }}
                />
            </Box>
        </Slate>
    );
};

const toggleBlock = (editor: Editor, format: ElementFormat) => {
    const isActive = isBlockActive(editor, format);
    const isList = isListType(format);

    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            isListType(n.type),
        split: true,
    });
    const newProperties: Partial<SlateElement> = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const toggleMark = (editor: Editor, format: MarkFormat) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const isBlockActive = (editor: Editor, format: ElementFormat) => {
    const { selection } = editor;
    if (!selection) {
        return false;
    }

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) => {
                if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
                    return n.type === format;
                }
                return false;
            },
        }),
    );

    return !!match;
};

const isMarkActive = (editor: Editor, format: MarkFormat) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

const RenderedElement = ({
    attributes,
    children,
    element,
}: RenderElementProps) => {
    switch (element.type) {
        case "bulleted-list":
            return <ul {...attributes}>{children}</ul>;
        case "heading-one":
            return <h1 {...attributes}>{children}</h1>;
        case "heading-two":
            return <h2 {...attributes}>{children}</h2>;
        case "list-item":
            return <li {...attributes}>{children}</li>;
        case "numbered-list":
            return <ol {...attributes}>{children}</ol>;
        case "paragraph":
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

interface BlockButtonProps {
    format: ElementFormat;
    icon: string;
}

const BlockButton = ({ format, icon }: BlockButtonProps) => {
    const editor = useSlate();
    return (
        <ToggleButton
            size="small"
            value={format}
            selected={isBlockActive(editor, format)}
            onMouseDown={(event) => event.preventDefault()}
            onChange={() => toggleBlock(editor, format)}
        >
            <Icon>{icon}</Icon>
        </ToggleButton>
    );
};

interface MarkButtonProps {
    format: MarkFormat;
    icon: string;
}

const MarkButton = ({ format, icon }: MarkButtonProps) => {
    const editor = useSlate();
    return (
        <ToggleButton
            size="small"
            value={format}
            selected={isMarkActive(editor, format)}
            onMouseDown={(event) => event.preventDefault()}
            onChange={() => toggleMark(editor, format)}
        >
            <Icon>{icon}</Icon>
        </ToggleButton>
    );
};

const isListType = (format: ElementFormat): format is ListType =>
    LIST_TYPES.includes(format as ListType);
