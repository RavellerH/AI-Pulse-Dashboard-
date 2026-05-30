# Contributing to AI Pulse Dashboard

Thank you for your interest in contributing! This is primarily a personal solo project, but bug reports, feature suggestions, and improvements are welcome.

---

## Ways to Contribute

- **Bug reports** — Open an issue describing what went wrong and how to reproduce it
- **Feature requests** — Open an issue with your idea and why it would be useful
- **Code contributions** — Fork the repo, make your changes, and open a pull request
- **Documentation** — Fix typos, improve clarity, or add missing information

---

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AI-Pulse-Dashboard-.git
   cd AI-Pulse-Dashboard-
   ```
3. Create a new branch for your change:
   ```bash
   git checkout -b fix/your-fix-description
   ```
4. Make your changes
5. Test locally:
   ```bash
   npm install
   npm run dev
   ```
6. Commit with a clear message:
   ```bash
   git commit -m "fix: describe what you fixed"
   ```
7. Push and open a pull request against the main branch

---

## Commit Message Style

Use simple prefixes:

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code cleanup, no feature/bug change |
| `chore:` | Build, deps, config |

---

## Code Style

- **TypeScript** — Maintain strict typing, avoid `any`
- **React** — Functional components and hooks only
- **Tailwind CSS** — Use utility classes; avoid custom CSS unless necessary
- **Python** — Follow PEP 8, use type hints where practical

---

## Reporting Bugs

When opening a bug report, please include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser / OS / Node version (if relevant)
- Any console errors or screenshots

---

## Pull Request Guidelines

- Keep PRs focused — one change per PR
- Update the README if your change affects usage or setup
- Make sure `npm run build` passes before submitting
- Be patient — this is a solo project and reviews may take time

---

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) as the project.
