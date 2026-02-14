# Contributing to Project Genesis

Thank you for your interest in contributing to Project Genesis! We welcome contributions from the community.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repository
2. Create a new branch from `main` (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### Pull Request Guidelines

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript styleguide
- Include thoughtfully-worded, well-structured tests
- Document new code based on the Documentation Styleguide

## Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/project-genesis.git
cd project-genesis

# Install dependencies
npm install

# Build packages
npm run build -w packages/mcp-server
npm run build -w packages/shared

# Run tests
npm test
```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

- Use TypeScript for all new code
- Follow the existing code style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add types for all function parameters and return values

### Documentation Styleguide

- Use Markdown for documentation
- Reference functions, classes, and modules in backticks
- Include code examples when documenting APIs

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage

## Community

- Join our discussions on GitHub
- Follow us on Twitter: [@projectgenesis](https://twitter.com/projectgenesis)

## Questions?

Feel free to open an issue with your question or contact the maintainers.

Thank you for contributing! 🎉
