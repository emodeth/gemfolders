<p align="center">
  <img src="assets/icon.png" alt="Gemfolders — blue folder with Gemini diamond" width="160" height="160" />
</p>

<h1 align="center">Gemfolders</h1>

<p align="center">
  <strong>Organize your Gemini conversations and ideas in one place.</strong>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/gemini-folders-bookmarks/dnlonnjaceadodcffgillnlkgfoaclfi">
    <img src="https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Web Store" />
  </a>
  &nbsp;
  <a href="https://www.gemfolders.com">
    <img src="https://img.shields.io/badge/Website-gemfolders.com-FF6F61?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website" />
  </a>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/gemini-folders-bookmarks/dnlonnjaceadodcffgillnlkgfoaclfi">
    <img src="https://img.shields.io/chrome-web-store/rating/dnlonnjaceadodcffgillnlkgfoaclfi?style=flat-square&label=Rating" alt="Chrome Web Store Rating" />
  </a>
  <a href="https://chromewebstore.google.com/detail/gemini-folders-bookmarks/dnlonnjaceadodcffgillnlkgfoaclfi">
    <img src="https://img.shields.io/chrome-web-store/users/dnlonnjaceadodcffgillnlkgfoaclfi?style=flat-square&label=Users" alt="Chrome Web Store Users" />
  </a>
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

Stop losing important threads. Gemfolders is a browser extension that brings structure to your Google Gemini workflow with native folders, instant search, and bookmarks — all directly inside Gemini's sidebar.

## 🛠️ What's New in v2.0.0

- **Gemini UI Fix** — Resolved all extension breakage caused by recent Gemini frontend updates. The extension is now more stable, faster, and perfectly aligned with the new layout.
- **Seamless Integration** — Fully optimized to match Gemini's native dark and light theme settings flawlessly.

## ✨ Features

- **📁 Custom Folders** — Create, rename, and color-code folders to categorize chats by project, topic, or client.
- **🔖 Bookmarks** — Pin important conversations for instant one-click access.
- **🔍 Search** — Instantly find past chats by title or keyword. No more endless scrolling.
- **🖱️ Drag & Drop** — Move chats between folders effortlessly.
- **⚡ Native Sidebar Integration** — Blends seamlessly into Gemini's interface without disrupting your flow.
- **🌗 Theme Aware** — Automatically adapts to Gemini's light and dark modes.
- **🔒 Privacy-Focused** — Your data stays local on your device. We never collect or share your chat history.
- **🔄 Cloud Sync** — Sync your folder structure across devices with end-to-end encrypted storage.

## 🚀 Getting Started

Install Gemfolders from the [Chrome Web Store](https://chromewebstore.google.com/detail/gemini-folders-bookmarks/dnlonnjaceadodcffgillnlkgfoaclfi) — it's free to get started.

## 🛠️ Development

To set up a local development environment:

1. **Clone & Install**

   ```bash
   git clone https://github.com/emodeth/gemfolders.git
   cd gemfolders
   pnpm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials in `.env`.

3. **Run Development Server**

   ```bash
   pnpm dev
   ```

4. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build/chrome-mv3-dev` directory
   - Changes will hot-reload automatically

## 🧱 Tech Stack

| Layer     | Technology                                                               |
| --------- | ------------------------------------------------------------------------ |
| Framework | [Plasmo](https://docs.plasmo.com/)                                       |
| UI        | [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/) |
| Backend   | [Supabase](https://supabase.com/) (auth & sync)                          |
| Icons     | [Lucide React](https://lucide.dev/)                                      |
| Tree View | [React Arborist](https://github.com/brimdata/react-arborist)             |

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 👤 Author

**Emirhan Keskin**

## 🔗 Links

- 🌐 **Website:** [gemfolders.com](https://www.gemfolders.com)
- 🏪 **Chrome Web Store:** [Install Gemfolders](https://chromewebstore.google.com/detail/gemini-folders-bookmarks/dnlonnjaceadodcffgillnlkgfoaclfi)
- 📺 **Demo Video:** [Watch on YouTube](https://youtu.be/zsiw4Z9-ajI?si=hXfGFZyc7mnl7jCU)
- 📧 **Contact:** emirhankeskindev@gmail.com
- 🔐 **Privacy Policy:** [gemfolders.com/legal/privacy](https://www.gemfolders.com/legal/privacy)

---

<p align="center">
  <sub><em>Not affiliated with Google or Gemini.</em></sub>
</p>
