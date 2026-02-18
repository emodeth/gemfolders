# GemFolders: Gemini Organizer & Chat Manager

> Organize your Gemini chats with folders, bookmarks, and search capabilities.

Gemfolders is a powerful browser extension designed to enhance your Google Gemini experience. It allows you to create custom folders, bookmark important conversations for quick access, and easily search through your chat history. Say goodbye to clutter and hello to a streamlined workflow.

## Features

- **📁 Custom Folders:** Create, rename, and manage folders to categorize your chats (e.g., "Work," "Personal," "Creative").
- **🔖 Bookmarks:** Pin your most important conversations for instant access.
- **🔍 Search:** Quickly find past conversations by keyword.
- **⚡ Seamless Integration:** Injects a native-looking interface directly into the Gemini sidebar.
- **🔒 Privacy-Focused:** Your data stays local (or syncs securely via your own Supabase instance).
- **🎨 Theme Aware:** Automatically adapts to Gemini's light and dark modes.

## Installation

### For Users

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/gem-folders.git
    cd gem-folders
    ```

2.  **Install dependencies:**
    This project uses `pnpm`. If you don't have it, install it via `npm i -g pnpm`.

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Build the extension:**

    ```bash
    pnpm build
    # or
    npm run build
    ```

4.  **Load into Chrome:**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Toggle **Developer mode** in the top right corner.
    - Click **Load unpacked**.
    - Select the `build/chrome-mv3-prod` directory from your project folder.

## Development

To start developing on GemFolders:

1.  **Clone & Install** (as above).

2.  **Environment Setup:**
    Duplicate `.env.example` to `.env` and fill in your Supabase credentials.

    ```bash
    cp .env.example .env
    ```

3.  **Run Development Server:**

    ```bash
    pnpm dev
    # or
    npm run dev
    ```

    This will start a hot-reloading development server.

4.  **Load Development Build:**
    - In `chrome://extensions/`, load the `build/chrome-mv3-dev` directory.
    - Any changes you make to the source code will automatically trigger a rebuild.

## Tech Stack

- **Framework:** [Plasmo](https://docs.plasmo.com/) - The browser extension framework.
- **UI Library:** [React](https://reactjs.org/) & [Tailwind CSS](https://tailwindcss.com/).
- **Backend:** [Supabase](https://supabase.com/) (for auth & sync, optional if local-only).
- **Icons:** [Lucide React](https://lucide.dev/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## Author

**Emirhan Keskin**

---

_Note: This project is not affiliated with Google or Gemini._
