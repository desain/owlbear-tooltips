# Tooltips

Tooltips is an extension for the Owlbear Rodeo VTT, which allows you to create tooltips for tokens.

## Features

-   📝 Quickly create and preview tooltips for tokens
-   💬 Tooltips support all the same rich text features as native Owlbear Rodeo notes
-   👉 View tooltips using the tooltip tool or by clicking an info icon while the token is selected

## How to use

This extension adds a new tool mode to the Text (T) tool.

While using this mode, click on a token to edit its tooltip. You can configure the tooltip appearance and visibility in the tooltip edit window.

![TODO edit window]

Once an item has a tooltip, you can hover over the item using the tooltip mode to preview the tooltip contents.

![hover preview]

When an item has a tooltip, shift-click on it to temporarily display the tooltip to all everyone.

When you select a token that has a tooltip, an info icon will appear in the corner of the token. Click this icon to display the tooltip, and click it again to hide the tooltip.

![info icon]

If you're the GM, you can customize where the tooltip icon appears using the Tooltip Settings menu, so the icon doesn't overlap UI elements created by other extensions.

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

-   Setting to delay before showing?

## License

GNU GPLv3
