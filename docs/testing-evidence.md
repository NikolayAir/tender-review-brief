# Browser checks for the review workspace

Run `npm run build` and `npm run preview`, then open the local URL printed by Vite. Choose **Restore sample** before starting. For the quotation checks below, generate a new brief after each input change and open **Source passages**.

Run `npm test` for extraction, grouping, size-limit, and disclosure-markup regressions. Run `npm run test:browser` for automated Chromium checks of the workspace, result tabs, mobile navigation, result status, source formatting, and narrow layouts; see the [browser setup instructions](development.md#browser-checks). The manual checks below also help verify these behaviors in other browsers.

The result tabs use Left and Right Arrow to switch sections; Home and End select the first and last tab. Tab moves from the selected tab into its panel, then to any controls within it.

For fixtures containing tabs, Unicode separators, or long padding, the commands below use the [Chrome DevTools Console `copy()` utility](https://developer.chrome.com/docs/devtools/console/utilities#copyobject). Run each command in that console, then paste into the excerpt field. JavaScript escapes such as `\n`, `\t`, and `\u2028` produce real characters. To check another browser, paste the copied fixture there.

1. Paste the following requirement. The supporting passage must show both lines, including `bar.` on the second line.

   ```text
   Water pressure must be 1.5
   bar.
   ```

2. Paste this paragraph. The quote must include `Do not` and both following lines.

   ```text
   Do not
   use water pipes in this area:
   pressure must remain below 1.5 bar.
   ```

3. Copy and paste this indented paragraph:

   ```js
   copy('  Water pressure must be 1.5\n\tbar.\n  Do not exceed this value.  ')
   ```

   The passage must have three lines. The internal tab before `bar.` and the internal spaces before `Do not` must remain visible. Leading spaces before `Water` and trailing spaces after the final period are intentionally trimmed.

4. Copy and paste real Unicode line and paragraph separators:

   ```js
   copy('Water pressure must be 1.5\u2028bar.\u2029Do not exceed this value.')
   ```

   The supporting passage must show three lines, with `bar.` and `Do not` on separate lines. The source text in the generated brief retains its Unicode separators. The input field uses native textarea rendering and may show those separators on one line; check the supporting passage after generation.

5. Paste `Water interfaces require structural and fire safety coordination.` The passage must appear once, with Structural works, Fire safety, and Water and drainage systems listed together. Add unrelated administrative text after a blank line and verify that it is excluded from the matched quote.

6. Copy and paste this long paragraph with two matched scopes:

   ```js
   copy('Water and fire safety requirements:\n' + 'x'.repeat(1200))
   ```

   Its shared passage must initially be collapsed. Focus the Full source passage summary with Tab and press Enter or Space. Verify that the complete passage becomes readable and that the focus indicator is visible. Collapse and reopen it to check keyboard operation.

7. With that passage expanded, replace it with this second paragraph and generate again:

   ```js
   copy('Water and fire safety requirements:\n' + 'y'.repeat(1200))
   ```

   Both inputs have the same length, source offsets, and matched scopes. The replacement must start collapsed; expanding it must show the `y` padding. Generating the same unchanged paragraph again must preserve the user's open or closed state.

8. Repeat the long-passage check at a viewport width of 320 pixels. Its unbroken padding must not create horizontal page overflow. Repeat with deep internal tab indentation:

   ```js
   copy('Water requirements:\n' + '\t'.repeat(40) + '1.5 bar.\n' + 'x'.repeat(1200))
   ```

9. Expand a long passage, switch to **Overview** or **Checks**, then return to **Source passages**. The passage must remain expanded. Repeat with it collapsed; switching tabs must preserve that state too.

10. Generate a brief from `Water drawings are required.`, then replace the input with `Fire-safety drawings are required.` without generating again. **Excerpt changed** must appear while the source passage still shows the water requirement. Reload and reopen **Source passages**: when browser storage is available, both texts and the notice must remain. Generate again: **Current excerpt** must appear, and **Source passages** must show the fire-safety requirement. Reload again to check that the association is retained. **Restore sample** must restore both the sample text and its brief.

11. At 390 pixels wide, generate a brief and check that focus moves to its heading and the result scrolls into view. Repeat at 375 × 667 pixels: the result's status badge must stay within the screen after generation. **Edit excerpt** must return focus to the input. At a wide desktop viewport, the editor and brief must appear side by side; the bundled sample's overview should fit within a 1440 × 900 viewport.

Paragraph context is a text-boundary policy. These checks do not establish that all conditions elsewhere in the tender have been captured or that the keyword matcher understands exclusions.
