# Browser checks for source evidence

Run `npm run build` and `npm run preview`, then open the local URL printed by Vite. Restore the bundled sample before starting. Generate a new brief after each input change.

These checks cover layout and native disclosure interactions that server-rendered component tests do not exercise. Run `npm test` for the extraction, grouping, size-limit, and disclosure-markup regressions.

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

3. Paste a multiline paragraph with indentation or tab characters. Verify that line breaks and indentation remain visible in the supporting passage. Copy its text to compare it with the input if needed.

4. Paste `Water interfaces require structural and fire safety coordination.` The passage must appear once, with Structural works, Fire safety, and Water and drainage systems listed together. Add unrelated administrative text after a blank line and verify that it is excluded from the matched quote.

5. Generate a brief from one paragraph longer than 1,000 characters and within the 50,000-character input limit. Include terms from several scopes. Its shared passage must initially be collapsed. Focus the Full source passage summary with Tab and press Enter or Space. Verify that the complete passage becomes readable and that the focus indicator is visible. Collapse and reopen it to check keyboard operation.

6. With the passage expanded, generate a different paragraph of the same length. The new passage must start collapsed. Expanding it must show the new text.

7. Repeat the long-passage check at a viewport width of 320 pixels with a long unbroken word or identifier. Expanding the passage must not create horizontal page overflow.

Paragraph context is a text-boundary policy. These checks do not establish that all conditions elsewhere in the tender have been captured or that the keyword matcher understands exclusions.
