# @kanso-protocol/mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for [Kanso Protocol](https://gregnblack.github.io/kanso-protocol/) — exposes the catalog of components, patterns, and design tokens to AI assistants so they can author Kanso UI without leaving the editor.

## What you get

Eleven tools, all running locally over stdio.

**Catalog** — typed metadata extracted from the source code at build time:

| Tool | What it returns |
| --- | --- |
| `catalog_overview` | Version, totals, links — call once per session. |
| `list_components` | Compact list of every `@kanso-protocol/*` component with selector, package, ARIA role. |
| `get_component` | Full record — inputs (name/type/default), outputs, ARIA role, keyboard patterns, Storybook URL, **plus the Figma node ref**. |
| `list_patterns` | Same shape, for higher-level pattern packages. |
| `get_pattern` | Full record for one pattern. |
| `list_tokens` | Every CSS variable from `tokens.css`, optionally filtered by category or substring. |
| `get_token` | One token by name (with or without the `--kp-` prefix). |

**Figma bridge** — points at the canonical public Kanso Design System file, so any Figma-MCP-aware client (Claude Code with the Figma MCP installed, Cursor, etc.) can pull the visual reference for the same component the assistant is writing code for:

| Tool | What it returns |
| --- | --- |
| `figma_context` | File key + URL of the Kanso Figma library, IDs of the Components / Patterns / Foundations / Examples pages, and the linked Tabler Icon Pack file. |
| `figma_for_component` | `{ fileKey, nodeId, url }` for the component's master frame — feed straight into Figma MCP's `get_design_context` or `get_screenshot`. |
| `figma_for_pattern` | Same shape for higher-level patterns. |
| `figma_for_icon` | Tabler icon library context + a search hint the assistant uses with Figma MCP's `search_design_system`. |

The data comes from a manifest baked at build time — no network calls, deterministic, fast.

### Customizing the Figma bridge

By default the bridge points at the **public canonical Kanso Design System file**. That's the right target for most users — even if you fork the system, the canonical Figma file is still your visual source of truth.

Override when you need to:

```bash
# point at a forked / private Figma file
KANSO_FIGMA_FILE_KEY=<your-file-key> npx @kanso-protocol/mcp

# (optional) override the URL too
KANSO_FIGMA_FILE_URL=https://figma.com/design/<key>/<name> npx @kanso-protocol/mcp
```

The component/pattern/foundation node IDs in the shipped mapping point at the canonical file's nodes; they will not match arbitrary forked layouts. If you've heavily restructured your Figma file, set `KANSO_FIGMA_FILE_KEY` to it and the bridge will return your file key with the original node IDs (use them as a hint, not a guarantee), or stop using `figma_for_component` entirely and fall back to Figma MCP's `search_design_system` with the right file key.

## Install

The server runs via `npx`, so there's nothing to install globally. Pick the snippet for your editor:

### Claude Code

One command from the project root:

```bash
claude mcp add kanso -- npx @kanso-protocol/mcp
```

…or drop this into your project's `.mcp.json` (create the file if missing):

```jsonc
{
  "mcpServers": {
    "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] }
  }
}
```

Restart Claude Code, then run `/mcp` to confirm `kanso` appears as ✔ connected with 7 tools.

### Cursor

Open *Settings → Features → MCP* → **Add new MCP server**:

- Name: `kanso`
- Type: `command`
- Command: `npx @kanso-protocol/mcp`

…or edit `~/.cursor/mcp.json` (project-scoped: `.cursor/mcp.json` in repo root):

```jsonc
{
  "mcpServers": {
    "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] }
  }
}
```

### VS Code (Continue, Cline, GitHub Copilot agent mode)

Add to the extension's MCP config — for Continue this is `~/.continue/config.json`, for Cline it's the *Cline MCP Servers* settings panel. Same shape:

```jsonc
{
  "mcpServers": {
    "kanso": { "command": "npx", "args": ["@kanso-protocol/mcp"] }
  }
}
```

### Any other MCP-aware client (Zed, Windsurf, Goose, custom)

Any client that speaks the [MCP stdio transport](https://modelcontextprotocol.io/docs/concepts/transports) works:

```
command: npx
args:    ["@kanso-protocol/mcp"]
```

## Usage

Once connected, ask the assistant things like:

- *"What size ramp does `kp-input` support, and which validators does form-field translate by default?"*
- *"Show me every danger-color token."*
- *"Which Kanso component should I use for a settings sidebar with collapsible sections?"*
- *"Generate an inline edit form using kp-form-field, kp-input, and kp-button."*

The assistant calls `list_components` / `get_component` / `list_tokens` under the hood and answers from the live catalog instead of guessing.

## What's not in 0.1.x

- **No Figma bridge yet.** The next minor will add `figma_component_for(name)` and `figma_token_for(name)` so an agent can hop straight from a Kanso component to its Figma master node and pull a screenshot via the Figma MCP.
- **No example-generation tool.** Pure metadata for now — let the agent compose snippets from the inputs/outputs it learns. We'll revisit if it turns out hand-crafting matters.

## License

MIT — © GregNBlack. Part of the [Kanso Protocol](https://github.com/GregNBlack/kanso-protocol) monorepo.
