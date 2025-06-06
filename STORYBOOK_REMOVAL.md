# Storybook Removal

This commit removes all Storybook configuration and related files.

## Removed:
- .storybook/ directory and all contents
- All @storybook/* dependencies from package.json
- storybook and build-storybook npm scripts

## Benefits:
- Eliminates Vite 6 compatibility conflicts
- Reduces build complexity
- Prevents future Dependabot issues
- Smaller dependency footprint

## Development Workflow:
Continue using `npm run dev` for component development with the full application context.
