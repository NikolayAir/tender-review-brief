# Browser checks for excerpt editing and review briefs

Run `npm run build` and `npm run preview`, then open the local URL printed by Vite. Choose **Restore sample** before starting and confirm if the dialog opens. For the quotation checks below, generate a new brief after each input change and open **Source passages**.

Run `npm test` for extraction, grouping, size-limit, and disclosure-markup regressions. Run `npm run test:browser` to check the layout of the excerpt editor and brief, keyboard navigation, whether the brief matches the excerpt, source formatting, and the help dialog in Chromium. See the [browser setup instructions](development.md#browser-checks). The manual checks below also help verify these behaviors in other browsers.

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

10. Generate a brief from `Water drawings are required.`, then replace the input with `Fire-safety drawings are required.` without generating again. **Excerpt changed** must appear while the source passage still shows the water requirement. Reload and reopen **Source passages**. When browser storage is available, both texts and the notice must remain. Generate again and check that **Current excerpt** appears and **Source passages** shows the fire-safety requirement. Reload again to check that the association is retained.

    Choose **Restore sample**. The confirmation must start with focus on **Cancel**. Cancel or press Escape and check that the excerpt, brief, and selected tab remain and focus returns to **Restore sample**. Open the confirmation again and choose **Restore sample** inside it to restore both the sample text and its brief.

11. At 390 pixels wide, check that the editor uses the root font size (18 px with **Medium** and default browser settings). Generate a brief and check that focus moves to its heading and the result scrolls into view. Repeat at 375 × 667 pixels and check that the result's status badge stays within the screen. **Edit excerpt** must return focus to the input. At a wide desktop viewport, the editor and brief must appear side by side, and the bundled sample's overview should fit within a 1440 × 900 viewport.

12. At a wide desktop viewport, generate a brief from this long passage:

    ```js
    copy('Water requirements:\n' + 'Drawings and installation details must be checked.\n'.repeat(100))
    ```

    Open **Source passages**, expand the quotation, and scroll until the result header is above the screen. The editor stays visible while it fits within the viewport. Choose **Generate review brief** again: focus must move to the result heading, its header and status must return to view, and the unchanged quotation must stay expanded.

13. With the same long result open, use a 1000 × 800 viewport and enlarge the textarea with its resize handle. Paste an oversized input:

    ```js
    copy('x'.repeat(50001))
    ```

    Choose **Generate review brief** to show the input error. When the editor becomes taller than the available viewport, it must scroll with the page. Scroll to **Restore sample**. The whole button must be visible and usable, and confirming must restore both the sample text and brief.

14. Focus the excerpt editor and click **How to use**. A four-step guide must open with focus on its title. Tab and Shift+Tab must cycle through the close button, the instructions when scrollable, and the documentation link. Escape, the close button, and clicking the backdrop must each close the guide and return focus to **How to use**. The current excerpt, result, and selected result tab must stay unchanged. Repeat at 320 × 568 pixels and check that the guide fits the viewport. When the instructions scroll, Tab from the close button into them and use Page Down. The close button must remain visible as the instructions scroll.

15. At 640 × 360 pixels, open the guide, scroll to the documentation link, close it, and reopen it. The first step must appear below the header again. Select text inside the guide and release the pointer outside it: the guide must remain open. Repeat with a press on the backdrop and release inside the guide. A normal click on the backdrop must still dismiss it.

16. Double the current text size in the DevTools Console, then check widths of 320 and 390 pixels.

    ```js
    {
      const root = document.documentElement
      const initialFontSize = Number.parseFloat(getComputedStyle(root).fontSize)
      root.style.fontSize = `${initialFontSize * 2}px`
    }
    ```

    The application title and subtitle must remain readable without overlapping the theme selector or **How to use**. The page must fit without horizontal scrolling. Result tabs may wrap onto another row, but individual words must stay whole and Arrow, Home, and End navigation must still work. The **01** label must stay on one line.

    At 320 × 320 pixels, open **How to use** and Tab to **Full documentation on GitHub**. The whole link must be visible below the title and close button. Close the guide and run `document.documentElement.style.removeProperty('font-size')` to restore normal text sizing. Select **Large**, double the text size again, and repeat the link check at 320 × 320 and 320 × 401 pixels. Remove the font-size override when finished.

    If your system lets you show scrollbars at all times, repeat the doubled **Large** check at 320 × 320 pixels with that setting. The link should stay fully visible when the vertical scrollbar takes up part of the dialog's width.

17. Enable forced colors using a system contrast theme or browser emulation. Focus **Overview**, press Right Arrow to select **Checks**, then press Tab to focus its panel. Only **Checks** should have the selected underline. Press Shift+Tab to return to the tab and check that its focus outline and selected underline are both visible.

18. Use the following meeting and reporting requirement to generate a brief.

    ```text
    The contractor shall hold a weekly site progress meeting and circulate the
    minutes to the project team within two working days. The minutes shall record
    each agreed action, the person responsible, and the due date.
    ```

    Open **Source passages**. The tab should show **No matching source passages** with a prompt to review the complete documents. Reload and reopen the tab to check that the empty state is restored.

    Replace the excerpt with `Fire-safety drawings must be checked.` and check that **Excerpt changed** appears while the empty-state message still refers to the text used for the previous brief. Generate again and check that **Source passages** quotes the fire-safety requirement.

19. With the bundled overview at 1440 × 1000 pixels, look for **Source code** on the right near the bottom of the page. At 320 pixels wide, it must appear below the disclaimer on the left. The link opens the repository in a new tab. In **How to use**, the link with the document icon opens [Review a tender excerpt](../README.md#review-a-tender-excerpt) in a new tab.

20. Set the theme to **System** and change the operating system or browser's preferred appearance between light and dark. The editor, brief, and dialogs should follow it without a reload. Choose **Day** with a dark preference or **Night** with a light preference. Reload to check that the manual choice is restored. Select **System** again to resume automatic changes. Check that switching themes preserves the current excerpt, brief, and selected result tab.

21. Choose **Night** and try **Small**, **Medium**, and **Large** in the text size selector. Check the editor, a source passage, and **How to use** at each size. At 320 and 393 pixels wide with **Large**, the header controls should share a row, with the question-mark icon opening help. At 440 pixels, **How to use** should keep its text label. At 320 pixels the page must fit without horizontal scrolling, and the help link must remain reachable by scrolling or with Tab. Reload to check that both Night and Large are restored.

Paragraph context is a text-boundary policy. These checks do not establish that all conditions elsewhere in the tender have been captured or that the keyword matcher understands exclusions.
