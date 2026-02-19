# Contributing to Gemfolders

First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to Gemfolders. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Gemfolders. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps to reproduce the problem** in as many details as possible.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the reproduction steps.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for GemFolders, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Explain why this enhancement would be useful** to most GemFolders users.

### Pull Requests

The process described here has several goals:

- Maintain GemFolders' quality
- Fix problems that are important to users
- Engage the community in working toward the best possible GemFolders
- Enable a sustainable system for GemFolders' maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

## Development Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/emodeth/gemfolders
    cd gemfolders
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Set up environment variables**
    Copy `.env.example` to `.env` and fill in the required values.

    ```bash
    cp .env.example .env
    ```

4.  **Start the development server**

    ```bash
    pnpm dev
    # or
    npm run dev
    ```

5.  **Load the extension**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable "Developer mode".
    - Click "Load unpacked".
    - Select the `build/chrome-mv3-dev` folder.

## Styleguides

### Git Commit Messages

- Use current tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
