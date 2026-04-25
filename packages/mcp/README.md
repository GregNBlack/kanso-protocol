# @kanso-protocol/mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for [Kanso Protocol](https://gregnblack.github.io/kanso-protocol/) — exposes the catalog of components, patterns, and design tokens to AI assistants so they can author Kanso UI without leaving the editor.

## What you get

Seven tools, all running locally over stdio:

| Tool | What it returns |
| --- | --- |
| `catalog_overview` | Version, totals, links — call once per session. |
| `list_components` | Compact list of every `@kanso-protocol/*` component with selector, package, ARIA role. |
| `get_component` | Full record — inputs (name/type/default), outputs, ARIA role, keyboard patterns, Storybook URL. |
| `list_patterns` | Same shape, for higher-level pattern packages. |
| `get_pattern` | Full record for one pattern. |
| `list_tokens` | Every CSS variable from `tokens.css`, optionally filtered by category or substring. |
| `get_token` | One token by name (with or without the `--kp-` prefix). |

The data comes from a manifest baked at build time — no network calls, deterministic, fast.

## Install

### Claude Code

Add to your project's `.mcp.json` (or run `claude mcp add kanso npx @kanso-protocol/mcp`):

```json
{
  "mcpServers": {
    "kanso": {
      "command": "npx",
      "args": ["@kanso-protocol/mcp"]
    }
  }
}
```

### Cursor

Open *Cursor Settings → Features → MCP* → **Add new MCP server**:

- Name: `kanso`
- Type: `command`
- Command: `npx @kanso-protocol/mcp`

### VS Code (with Continue / any MCP-aware extension)

In the extension's MCP config:

```json
{
  "kanso": {
    "command": "npx",
    "args": ["@kanso-protocol/mcp"]
  }
}
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
