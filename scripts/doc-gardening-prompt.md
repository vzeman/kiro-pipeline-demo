# Documentation Gardening Task

Scan this repository for stale, outdated, or inaccurate documentation and fix it. Be conservative — only fix issues you are confident about. Leave a `<!-- TODO: ... -->` comment for anything ambiguous.

## Documentation Files to Scan

- `README.md` — project overview, functions list, usage examples

## Scanning Checklist

### 1. Broken File References

- Search `README.md` for backtick-quoted paths, markdown links, and inline references to source files.
- Verify each referenced file still exists at that path by reading the filesystem.
- If a file was moved, update the reference to the new location.
- If a file was deleted with no replacement, remove the reference and note the deletion.

### 2. Command Accuracy

Read `package.json` and compare its `scripts` section against documented commands in `README.md`:

| Expected Script | Source |
|---|---|
| `build` | `README.md` |
| `test` | `README.md` |
| `lint` | `README.md` |

If any script name, command, or `npm run` invocation in the docs no longer matches `package.json`, update it. Flag commands documented in markdown that have no corresponding `package.json` script.

### 3. Function Signature Accuracy

The README lists three functions:
- `capitalize(str)` — Capitalize the first letter
- `slugify(str)` — Convert to URL-friendly slug
- `truncate(str, maxLength)` — Truncate with ellipsis

Verify these functions exist in the codebase with the documented signatures. Check:
- Function names match exactly
- Parameter names and counts match
- Descriptions are accurate

If the API has changed, update the documentation. If a function was removed, note it.

### 4. Broken Internal Links

Check all markdown links in both `[text](url)` and `[text][ref]` styles:

- For relative links, verify the target file exists.
- For heading anchors (e.g., `#functions`), verify the heading exists in the target file.
- For external links, leave them as-is — do not attempt to verify or fix.

### 5. Stale Code Examples

Find code examples in documentation that reference imports, functions, or usage patterns:

- Verify referenced symbols still exist in the codebase with the documented signatures.
- Update examples if the API has changed; leave a `<!-- TODO: ... -->` if the replacement is unclear.

## Rules

- Only modify documentation files (`*.md`, `*.mdx`, `*.rst`).
- **NEVER** modify source code (`.ts`, `.js`), configuration files (`.json`, `.yml`, `.yaml`), or CI workflows.
- When removing a stale reference, check if there is a replacement to link to.
- Preserve each document's structure, tone, heading hierarchy, and formatting.
- If unsure about a change, leave a `<!-- TODO: verify — [description] -->` comment rather than guessing.
- Add `<!-- Last gardened: 2026-02-22 -->` to sections you have verified or updated.
- Do not rewrite paragraphs for style — only fix factual inaccuracies and broken references.
- Do not add new sections or documentation — only maintain what already exists.

## Output

After making changes, provide a plain-text summary listing:

1. **Files modified** and what was changed in each.
2. **Issues found and fixed** (one line per issue).
3. **Issues requiring human decision** (left as `<!-- TODO -->` comments).
4. **Sections verified as up-to-date** (no changes needed).
