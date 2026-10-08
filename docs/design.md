# Design

Kural Daily should feel like a page of a well-made book, not a dashboard. The couplet is the most
important thing on any screen, and the interface stays quiet around it. These are the rules the
app follows; keep to them when adding to it.

## Colour

Set in `theme/index.ts`. Never hard-code a colour in a component.

| Role | Token | Used for |
| --- | --- | --- |
| Page | `background` | Paper, Palm leaf or Night |
| Surface | `surface` | The few containers that earn one (see below) |
| Text | `onSurface`, `ink` | `ink` is for the couplet itself |
| Muted text | `onSurfaceVariant` | Secondary lines, labels |
| Rules | `rule`, `outlineVariant` | Dividers and hairlines |
| Accent | `primary` and its containers | Actions, selection, progress, "done" |
| Streak | `flame` | The flame icon only |
| Error | `error` | Destructive actions (Reset progress) |

- Night is ink-black with ivory text, not pure black and white. Accent tints (containers) stay
  low in Night and lean towards the paper in light pages, so a tinted block never outshines the
  couplet.
- One accent at a time, chosen by the reader: Indigo, Kumkum, Leaf or Saffron. Every
  page × accent pair passes WCAG AA (tested).
- No success green or warning yellow. "Done" and "right" use the accent, and "wrong" is neutral grey,
  so nothing clashes with the chosen accent.
- No gradients in the app. The only gradients are the share-image styles, which are
  pictures made to be posted elsewhere.

## Type

| Style | Face (Classic) | Use |
| --- | --- | --- |
| `kural(size)` | Noto Serif Tamil 600 | The couplet only |
| `tamilBody` | Noto Serif Tamil 400 | Tamil explanation |
| `translation` | Lora Italic | English couplet translation |
| `englishBody` | Lora | English explanation |
| `display(size)` | Lora 600 | Kural numbers, figures, big headings |
| Paper `title*` / `label*` / `body*` | Inter, Noto Sans Tamil | Interface text |

- Modern swaps the serifs for Noto Sans Tamil and Inter; Device uses the phone's font.
- Bundled faces are one file per weight: set `fontFamily` only, never with a bold
  `fontWeight` (iOS would fall back to the system font).
- The couplet is always the largest, heaviest reading text on a card (`readingSizes`).
- One large heading per screen at most.

## Space and shape

- Spacing comes from `space` (4, 8, 12, 16, 20, 24, 32). Screen gutters are 20 (`xl`) for
  text and 16 (`lg`) for containers.
- Radii come from `radius`. Containers use 16–22; small controls use pills. Plain rows and lists
  are not rounded at all.
- No shadows in the app. Separation comes from a hairline border or a tint. The one exception
  is the share-image preview, which is a picture of a card.

## Containers: when something gets a card

A card (rounded surface with a hairline border) is used only for:

- the Kural itself (`KuralCard`), the thing the screen is about;
- one emphasised block per screen: the review panel in Learn and the streak card in You;
- grouped settings rows in You.

Everything else is plain content on the page:

- **Lists** of Kurals or chapters are rows separated by rules (`KuralListItem`).
- **Figures** are a row of numbers with labels (`Stats`), not tiles with icons.
- **Steps and explanations** are numbered text.
- **Secondary actions** are text links or rows ("Keep reading this chapter",
  "Open a random Kural").
- **Details and settings** open in bottom sheets (`SheetModal`), not new screens.

If you're about to add a box with an icon, a title, a line of text and a button, use a row instead.

## Icons

Icons are for actions and for the tab bar, and they lead settings rows. They are never
decoration. Use MaterialCommunityIcons, outline style when inactive and filled when active or
selected.

## Components

| Need | Use |
| --- | --- |
| Main action | Paper `Button mode="contained"` |
| Secondary action | `Button mode="text"`, or a text link |
| Choice of 2–4 | `SegmentedButtons`, or the compact தமிழ் / EN switch inside a card |
| Filters, modes | Outlined `Chip`; only the selected one is filled |
| On/off | `Switch` in a row |
| Details, settings | `SheetModal` (bottom sheet) |
| Confirm something destructive | Paper `Dialog` |
| Short confirmation or undo | `Snackbar` |
| Nothing to show | `EmptyState`: why it's empty, and one action |

## Motion

Animate only state changes: a step in Memorize, a word revealed, a new quiz question, the
meaning opening or closing, the Read mark appearing. Keep it 200–350 ms. Nothing loops, except
the spoiler particles, which show that a word is hidden.

## Words

- Write plainly, as a person would say it: "Read today's Kural to keep it going", not
  "Unlock your daily wisdom".
- Errors say what happened and what to do: "Image sharing isn't available on this device. Try
  sharing as text."
- Empty states say why it's empty and what to do next.
- Tamil terms are kept where they are the right word (பொருள், அதிகாரம், இயல், பால்), with English
  alongside the first time.
- Facts about the Thirukkural must be accurate; when scholars disagree, say so.
