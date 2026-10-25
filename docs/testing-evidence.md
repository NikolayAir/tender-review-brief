# Browser checks for source evidence

Run `npm run build` and `npm run preview`, then open the local URL printed by Vite. Restore the bundled sample before starting. Generate a new brief after each input change.

Run `npm test` for extraction, grouping, size-limit, and disclosure-markup regressions. Run `npm run test:browser` for automated Chromium checks of visible line breaks, keyboard operation, disclosure reset, and narrow layouts; see the [browser setup instructions](../README.md#local-development). The manual checks below also help verify these behaviors in other browsers.

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

Paragraph context is a text-boundary policy. These checks do not establish that all conditions elsewhere in the tender have been captured or that the keyword matcher understands exclusions.
