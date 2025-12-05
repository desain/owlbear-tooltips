# Tooltips

<img width="767" height="445" alt="Hero" src="https://github.com/user-attachments/assets/f1a79cb8-a253-4600-963b-42a5df720234" />

Tooltips is an extension for the Owlbear Rodeo VTT, which allows you to create tooltips for tokens.

## Features

-   📝 Quickly create and preview tooltips for tokens
-   💬 Tooltips support all the same rich text features as native Owlbear Rodeo notes
-   👉 View tooltips using the tooltip tool or by clicking an info icon while the token is selected

## How to use

Install from the [Owlbear rogue store](https://owlbear.rogue.pub/extension/https://owlbear-tooltips.nicholassdesai.workers.dev/manifest.json).

This extension adds a new tool mode to the Text (T) tool.

While using this mode, click on a token to edit its tooltip. You can configure the tooltip appearance and visibility in the tooltip edit window.

![Tooltip edit window](https://github.com/user-attachments/assets/7e07bfd8-45f6-4933-ba6f-7afee6bec17b)

Once an item has a tooltip, you can hover over the item using the tooltip mode to preview the tooltip contents.

![Previewing a tooltip](https://github.com/user-attachments/assets/7d7fb8a5-5451-4477-a833-27b2a43bcbd1)

When an item has a tooltip, shift-click on it to temporarily display the tooltip to all everyone.

When you select a token that has a tooltip, an info icon will appear in the corner of the token. Click this icon to display the tooltip, and click it again to hide the tooltip.

![Using the info icon](https://github.com/user-attachments/assets/86900319-bf39-4d40-8965-c62e7296a5bd)

If you're the GM, you can customize where the tooltip icon appears using the Tooltip Settings menu, so the icon doesn't overlap UI elements created by other extensions.

![GM Settings](https://github.com/user-attachments/assets/699df4b3-5292-49e2-957a-48ea9cdf7ec1)

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.com/invite/u5RYMkV98s) @Nick or open an issue on [GitHub](https://github.com/desain/owlbear-tooltips/issues).

## Development

After checkout, run `pnpm install`.

## How it Works

This project is a Typescript app with Vite as a bundler, using Material UI React components and a Zustand store.

Icons from https://game-icons.net.

## Building

This project uses [pnpm](https://pnpm.io/) as a package manager.

To install all the dependencies run:

`pnpm install`

To run in a development mode run:

`pnpm dev`

To make a production build run:

`pnpm build`

## To do

-   Per-token icon offsets
    -   Configure per-token icon offsets by dragging icon in tooltip mode
-   "Owner or GM" visibility
-   Edit icon for expanded tooltip?
-   Setting to delay before showing?
-   Set text outline color and width
-   Icon size config?

## License

GNU GPLv3
