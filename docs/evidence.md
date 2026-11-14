# How source passages are selected

When rules match, the brief includes quotations from the pasted excerpt to help a reviewer check the suggested technical scopes. Locate each passage in the complete tender documents before interpreting a requirement.

## Match selection

For each rule, the analyzer selects the first matching term or phrase in source order. When several terms start at the same position, it selects the longest matching phrase. The rules use word boundaries and permit whitespace, including line breaks, between words in a phrase.

The rule order determines the order of scopes, checks, questions, and source passages in the brief. Later mentions of the same scope may contain additional requirements that the reviewer still needs to check.

## Paragraph context

The quotation includes the complete source paragraph containing the match. Blank or whitespace-only lines separate paragraphs; ordinary line breaks stay within a paragraph. If a matched phrase spans paragraphs, all intersected paragraphs are included.

For example:

```text
Administrative notice.

Water pressure must be 1.5
bar. Do not exceed this value.

End of notice.
```

The Water and drainage systems passage contains both lines from `Water` through `value.`. The administrative paragraphs are excluded.

This policy keeps wrapped values, units, lists, negations, and exclusions together with their surrounding paragraph context. It does not establish that every condition affecting the requirement appears in those paragraphs.

## Shared passages and formatting

Overlapping passages are combined and stored once. Each passage lists its matched technical scopes in rule order.

Quotations preserve source punctuation and internal whitespace, including decimal values such as `1.5 bar`, abbreviations, section references, URLs, spaces, tabs, and line breaks. Only leading and trailing whitespace is trimmed.

Supporting passages display ordinary line breaks, tabs, and Unicode line and paragraph separators (U+2028/U+2029). Unicode separators are displayed as line breaks without changing the source text stored in the generated brief. The input field uses native textarea rendering and may display those separators differently.

## Long passages and input limits

Passages longer than 1,000 UTF-16 code units are collapsed by default. Choose **Full source passage** with the pointer or focus it with Tab and press Enter or Space to read the complete quotation. No text is truncated.

A changed long passage starts collapsed, including when a replacement has the same length and source offsets. Generating a brief from unchanged text preserves its open or closed state.

The input limit is 50,000 UTF-16 code units. The interface labels these counts as characters: an ASCII letter counts as one code unit and `😀` counts as two.

## Saved results

The current excerpt and last generated brief are saved separately when `sessionStorage` is available. Editing the excerpt does not update the result; choose **Generate review brief** again after making changes. A reload can restore an edited excerpt alongside an older brief.

Briefs restored from an earlier application version retain their previous wording and quotations until a new brief is generated.

See [browser checks](testing-evidence.md) for fixtures covering paragraph context, whitespace, keyboard interaction, and narrow layouts, or [development](development.md) to run the automated regressions.
