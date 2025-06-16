# Contributing to Mindbody MCP Server

First off, thank you for considering contributing to the Mindbody MCP Server! It's people like you that make this tool better for everyone in the fitness and wellness community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Adding New Tools](#adding-new-tools)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/mindbody-mcp.git
   cd mindbody-mcp
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Create a `.env` file with your Mindbody sandbox credentials
5. Run tests to ensure everything works:
   ```bash
   bun run test:tool
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Bun/Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Any possible drawbacks
- Mockups or examples (if applicable)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple fixes to get you started
- `help wanted` - More involved issues ideal for contributors

## 💻 Development Process

### 1. Set Up Your Development Environment

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run in development mode
bun run dev
```

### 2. Make Your Changes

- Create a new branch for your feature:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Make your changes following our style guidelines
- Add or update tests as needed
- Update documentation

### 3. Test Your Changes

```bash
# Run the test tool
bun run test:tool

# Test with Claude Desktop
# Update your claude_desktop_config.json to point to your local version
```

## 📝 Style Guidelines

### TypeScript Style

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over callbacks
- Add types for all function parameters and returns
- Use meaningful variable names

```typescript
// Good
async function getTeacherSchedule(
  teacherName: string,
  startDate?: string
): Promise<TeacherSchedule> {
  // Implementation
}

// Bad
async function getSchedule(name, date) {
  // Implementation
}
```

### File Organization

- One tool per file in `src/tools/`
- Shared types in `src/types/`
- Utility functions in `src/utils/`
- Keep files focused and under 200 lines

### Error Handling

- Always handle errors gracefully
- Provide helpful error messages
- Log errors appropriately

```typescript
try {
  const result = await apiCall();
} catch (error) {
  throw new Error(`Failed to fetch schedule: ${error.message}`);
}
```

## 🔧 Adding New Tools

### 1. Plan Your Tool

- Define clear inputs and outputs
- Consider error cases
- Think about caching strategy

### 2. Create the Tool File

Create `src/tools/yourTool.ts`:

```typescript
import { YourToolResponse } from '../types/mindbody';

export async function yourToolFunction(
  param1: string,
  param2?: number
): Promise<YourToolResponse> {
  // Implementation
}
```

### 3. Add Types

Update `src/types/mindbody.ts`:

```typescript
export interface YourToolResponse {
  // Define response structure
}
```

### 4. Register the Tool

Update `src/index.ts`:

1. Import your tool
2. Add to `ListToolsRequestSchema` handler
3. Add case in `CallToolRequestSchema` handler

### 5. Document Your Tool

- Update `README.md` with tool description
- Update `Claude.md` with usage examples
- Add JSDoc comments to your functions

## 🧪 Testing

### Manual Testing

1. Create a test script in `src/test-your-tool.ts`
2. Test various scenarios:
   - Normal cases
   - Edge cases
   - Error cases

### Integration Testing

Test with Claude Desktop:

1. Build and run your local version
2. Update Claude Desktop config
3. Test natural language queries

## 📤 Pull Request Process

1. **Update Documentation** - Ensure README.md and Claude.md reflect your changes
2. **Add Tests** - Include tests that demonstrate your fix or feature works
3. **Follow Style** - Ensure your code follows the project style
4. **Write Clear Commit Messages** - Use the present tense ("Add feature" not "Added feature")
5. **Update Types** - Add or update TypeScript types as needed
6. **Request Review** - Tag maintainers when your PR is ready

### PR Title Format

- `feat: Add new tool for X`
- `fix: Resolve issue with Y`
- `docs: Update documentation for Z`
- `refactor: Improve performance of A`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] Tested with Claude Desktop
- [ ] Added/updated tests

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Updated documentation
- [ ] No console.logs left
```

## 🎉 Recognition

Contributors will be recognized in:
- The README.md contributors section
- Release notes
- Special thanks in documentation

Thank you for contributing to make AI-powered fitness management better for everyone! 💪
