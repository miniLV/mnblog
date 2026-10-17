---
name: sketchboard-diagram
description: Generate hand-drawn grid-paper style architecture diagrams, workflow loops, flywheels, and README visuals as self-contained HTML pages and PNG exports. Use when the user wants a sketchy whiteboard-style diagram, system map, process flow, loop diagram, or bilingual Chinese/English visual.
metadata:
  short-description: Hand-drawn architecture diagrams as HTML and PNG
---

# Sketchboard Diagram

Create polished hand-drawn diagram pages that look like a sketched whiteboard or notebook page, then export them to PNG.

## When To Use

Use this skill for:

- architecture diagrams
- workflow maps
- flywheel / loop diagrams
- README visuals
- presentation visuals
- bilingual Chinese / English versions of the same diagram

## Workflow

1. Pick a starting point:
   - `examples/templates/architecture.html` for multi-lane system maps.
   - `examples/templates/flywheel.html` for circular loops and self-reinforcing systems.
   - `examples/retrieval-flow-zh.html` or `examples/retrieval-flow-en.html` as a reference for dense fan-out, merge, fallback, and failure-state flows.
2. Copy the selected template or reference example to the requested output path.
3. Build the final geometry, then edit the HTML directly:
   - Set one explicit final `.page` width and height before placing cards. A layout size change replaces that declaration; the export viewport matches it.
   - Treat the page, board, SVG `viewBox`, cards, labels, and connectors as one layout contract. When a card or canvas moves, re-anchor every connected edge and label in the same edit.
   - Keep the final coordinates in the primary declarations. If a layout needs revision, revise those declarations and the incident SVG paths together rather than layering a later CSS override that only moves cards.
   - Replace title, subtitle, node labels, note cards, arrows, and paths.
   - Keep the grid-paper background, hand-drawn cards, and six-color palette unless the user asks for another style. Scale connector weight to diagram density.
   - If the user asks for Chinese and English, create two HTML files rather than mixing languages on one page.
4. Validate computed geometry before exporting:

   ```bash
   node scripts/validate-html-geometry.mjs output.html
   ```

   This loads the page in the browser, measures the rendered rectangles after fonts and wrapping settle, and fails when a positioned element leaves `.page` or its positioned parent. Intentional overflow must be explicit with `data-allow-overflow`; never use it to hide a card-layout mistake. Fix the HTML/CSS source when this check fails; do not patch the PNG or only change the document embed width.
5. Export PNG:

   ```bash
   node scripts/render-html-to-png.mjs output.html output.png --width <page-width> --height <page-height>
   ```

   The renderer reads the final literal `.page` dimensions when flags are omitted, rejects a supplied width or height that disagrees with them, and repeats the geometry validation by default. Do not use `--skip-geometry-validation` for a published diagram.
6. Pass the geometry gate before publishing:
   - Inspect the full PNG at original pixel size with the whole canvas visible. Every card, label, shadow, connector shaft, arrowhead, and return path stays inside the canvas.
   - Trace every intended edge from its source card to its target card. Each edge has a visible shaft outside the source, a full terminal run, and an arrowhead that ends in the reserved target corridor.
   - Confirm every card move has matching incident-edge and edge-label coordinates in the final source. Inspect the rendered file after the final edit, not an earlier preview.
   - For a published diagram, inspect the actual document embedding as well as the PNG. The embedding keeps the complete image visible at its displayed width.

A diagram is ready only when every intended node, edge, label, and canvas boundary passes this gate. Return to the geometry edit and render a new PNG until the gate passes.

## Comprehension Gate

Geometry is necessary but not sufficient. Before publishing, a reader who did not create the diagram must be able to answer these questions in one pass: where do I start, what is the normal success path, what exact condition enters recovery, which model or owner acts next, and where does the process stop?

- Put the reading order in the title, subtitle, or lane labels. Separate normal completion from failure/recovery instead of crossing both through one crowded loop.
- Give every transition one visible arrow and put its condition next to the branch origin (`验证通过`, `仅失败进入`, `仍失败`). Do not make the reader infer a branch from color, position, or prose inside a distant card.
- Name cards as actions or decisions (`Root 验证`, `adopt 或 restore`, `一次 Terra`, `Root 接管`), not only as roles or abstract nouns. If the same role appears twice, distinguish the phase in the title (`Root 验证` versus `Root 最终验证`).
- End every branch in an explicit terminal state such as `采纳并交付`, `Root 接管`, or `停止创建 Worker`. A recovery diagram must show its retry/fallback limit as a visible stop condition.
- Run a ten-second summary test after rendering: if the main path, fallback trigger, and terminal state cannot be summarized in one sentence without pointing at several unrelated regions, simplify or split the source diagram.

## Layout Mode and Collision Budget

Choose the layout mode before writing coordinates:

- `GRID_LAYOUT`: use hand-written HTML/CSS positions only for a sparse diagram with one main lane, 3-6 major blocks, and limited branching.
- `AUTO_LAYOUT`: use Mermaid, PlantUML, or another layout engine as the topology source when the diagram has more than 6 visible nodes, multiple branches or rows, cross-lane edges, or text-heavy cards. Do not hand-tune a dense topology with unrelated absolute coordinates.
- `SPLIT_LAYOUT`: if the user needs the sketchboard style but the topology is still dense, split it into two or more focused diagrams instead of shrinking text or connector corridors.

Every visible card, panel, note, and reference block must reserve its own row or column band. A summary or external-reference card must not share the same vertical band as another absolutely positioned card. Prefer normal flow or an explicit reserved band over `bottom`/`right` anchoring; the measured height after text wraps determines the band size. A later CSS override must not silently move cards without moving the SVG `viewBox`, incident edges, and labels in the same edit.

For cards inside a parent panel, reserve the usable width mathematically before choosing coordinates: `left-padding + card-count * card-width + gap-count * gap + right-padding <= parent-inner-width`. Apply the same check vertically after text wraps. A card touching a parent border is a failure because its border, rotation, or shadow can still render outside the parent.

If the geometry gate fails after one focused revision, switch a dense topology to `AUTO_LAYOUT` or `SPLIT_LAYOUT` rather than continuing with manual CSS nudges. This is a completion rule, not a stylistic preference.

## Style Rules

- Use `1500x900` for sparse diagrams. Start dense branch diagrams or text-heavy bilingual diagrams at `1600x1000`, then grow further if rendered text still reduces connector corridors. Set the `.page` dimensions first; the PNG uses those dimensions instead of an unrelated default viewport.
- Keep text short. Diagram text should explain, not become a document.
- Prefer 3-6 major blocks for architecture diagrams.
- Prefer 5-7 steps for flywheel diagrams.
- For dense diagrams, use `markerUnits="userSpaceOnUse"` with an 8-10px marker box. Use 2.4-3px connectors and a 2-2.5px shared bus; do not let arrowhead size multiply with stroke width. Reserve heavier arrows for sparse hero flows.
- Prefer a small filled triangle or open chevron in dense layouts. Never use a large filled triangle when the connector corridor cannot contain it.
- For fan-out or fan-in with three or more branches, use one thin shared bus. Put arrowheads only on terminal directed legs: bus-to-targets for fan-out and merged-bus-to-next-node for fan-in. Keep about 28-36px between each bus and its target cards.
- End each arrow tip 6-10px outside the target card instead of touching or entering its border.
- Start each arrow shaft 6-10px outside its source card. With SVG beneath cards, this keeps both endpoints visible instead of hiding them under a card fill.
- For L-shaped, Z-shaped, or perimeter connectors, keep at least 24px of straight terminal run from the final bend to the arrow tip. Move the bend when necessary; never place an arrowhead directly on a corner.
- Keep the primary flow solid. Draw fallback, failure, and return paths as dashed edge-routed connectors, and place their labels on opaque paper-colored backgrounds so lines never cut through text.
- Route return, failure, and feedback arrows outside the primary forward flow,
  preferably on the right or top edge of the lane. Show the complete path from
  the source node back to the target node, and end the arrow just outside the
  target card if SVG arrows are rendered beneath HTML cards.
- Reserve visible breathing room for return-arrow corridors. If a right-side
  result callback uses the right edge, start other feedback loops from the top
  or middle of their source card so separate loops do not visually merge.
- Leave enough horizontal space between adjacent forward-flow cards for arrows
  to read as links, not as decorations squeezed between boxes.
- Leave enough vertical space between stacked cards for the full arrow shaft,
  arrowhead, and optional label. A forward-flow arrowhead should never touch or
  overlap the next card; keep at least 28-36px of visible connector corridor
  between card edges.
- Measure rendered card height after text is inserted. Do not route from CSS `min-height` assumptions; translated text can grow a card and hide connectors drawn underneath it.
- Keep the SVG `viewBox` equal to the final board coordinate space. After changing page width, board size, or a card position, redraw the connected path endpoints from the final card bounds before exporting.
- Separate branch lanes on both axes. Move the main lane and branch/fallback
  lane apart horizontally, and stagger branch targets vertically so cross-lane
  arrows do not graze cards or labels.
- For structural, architecture, and relationship-heavy diagrams, assign
  explicit anchor points per edge (top / right / bottom / left). Do not let
  multiple unrelated relationships leave from the same visual point unless they
  are intentionally a bundled bus.
- Prefer straight, vertical, horizontal, or simple L-shaped connectors for
  structural relationships. Use curves only when they clarify a return or
  cross-lane relationship; never stack two similar curves under the same node.
- Keep relationship labels offset from both the connector and the card edge.
  Cardinality and edge labels should sit in their own small visual space, not
  directly on top of a line.
- If the layout cannot preserve readable connector corridors, shorten labels, reduce node count, or split the diagram before shrinking the gaps further.
- Use a watermark only when the user asks for one.
- For bilingual output, keep topology, ordering, colors, and visual hierarchy consistent, but do not force identical coordinates. Render each language separately and expand the canvas, cards, lanes, or gaps when translation wraps onto extra lines. Move downstream nodes before shrinking type or connector corridors.
- Use this fixed-size marker pattern for dense SVG flows:

  ```html
  <marker id="arrow" markerWidth="10" markerHeight="10"
    refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L10,5 L0,10 Z" fill="#1f2328"></path>
  </marker>
  ```
- If adding a watermark, keep it subtle and out of the content area:

  ```html
  <div class="watermark">@handle</div>
  ```

  ```css
  .watermark {
    position: absolute;
    right: 56px;
    bottom: 12px;
    color: rgba(31, 35, 40, 0.28);
    font: 900 19px "Avenir Next", sans-serif;
    letter-spacing: 0.05em;
    transform: rotate(-2deg);
    pointer-events: none;
  }
  ```

## Assets

- Templates:
  - `examples/templates/architecture.html`
  - `examples/templates/flywheel.html`
- Examples:
  - `examples/architecture-zh.html`
  - `examples/architecture-en.html`
  - `examples/flywheel-zh.html`
  - `examples/flywheel-en.html`
  - `examples/retrieval-flow-zh.html`
  - `examples/retrieval-flow-en.html`
- Renderer:
  - `scripts/render-html-to-png.mjs`
- Geometry validator:
  - `scripts/validate-html-geometry.mjs`

## Common Prompts

```text
Use sketchboard-diagram to draw a hand-drawn architecture map for this system. Output HTML and PNG.
```

```text
用 sketchboard-diagram 画一张中文飞轮图，表达 daily loop、weekly review、knowledge layer、runtime loader 怎么形成自进化。
```

```text
Create Chinese and English versions of the same sketchboard-style README diagram.
```
