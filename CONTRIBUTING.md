# Contributing

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

Format: `<type>(<scope>): <subject>`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

### Examples

```
feat(api): add TMDB search endpoint
fix(resolvers): handle null movie results
docs: update setup instructions
```

## Pre-commit Checks

Every commit automatically runs:

- **Prettier**: Code formatting check
- **ESLint**: Linting
- **Jest**: All tests

Fix issues before committing:

```bash
npm run format  # Auto-fix formatting
npm run lint    # Check linting
npm test        # Run tests
```
