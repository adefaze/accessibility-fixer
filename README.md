# Accessibility Audit & Fixer

A powerful Framer plugin designed to help you create more inclusive designs by automatically auditing your canvas for accessibility issues and providing intelligent, automated fixes.

![Fixer Logo](./fixer%20logo.svg)

## 🚀 Features

### 1. Automated Accessibility Scanning
Scan your selected layers or the entire active page for common accessibility violations instantly. The plugin currently checks for:
- **Missing Alt Text:** Identifies images that lack descriptive alternative text.
- **Color Contrast:** Checks text and background color combinations against WCAG AA standards (minimum 4.5:1 ratio).
- **Touch Target Size:** Ensures interactive elements meet minimum size requirements for touch accessibility.

### 2. AI-Powered Alt Text Generation
Leverages **Anthropic's Claude 3 Sonnet** model to automatically generate concise, descriptive, and context-aware alt text for your images.
- Analyses visual content (when accessible via URL) and layer context.
- Generates WCAG-compliant descriptions.
- **Note:** Requires an Anthropic API Key configured in the plugin settings (stored in plugin data).

### 3. Intelligent Contrast Fixing
Automatically resolves contrast violations by calculating the nearest compliant background color.
- Smartly adjusts colors to meet the 4.5:1 contrast ratio while preserving the original design intent as much as possible.

### 4. Touch Target Correction
Automatically resizes interactive elements to ensure they meet minimum touch target dimensions, improving usability on mobile devices.

### 5. Batch Fixing
Streamline your workflow by applying fixes to multiple issues simultaneously.

## 🛠 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/adefaze/accessibility-fixer.git
   cd accessibility-plugin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start the Vite server, typically at `http://localhost:5173`.

4. **Load in Framer**
   - Open your Framer project.
   - Go to **Plugins** -> **Manage Plugins**.
   - Click "New Plugin" or "Open Development Plugin" (depending on Framer's current interface).
   - Point it to your localhost URL (e.g., `http://localhost:5173`).

## 📖 Usage

1. **Select a Frame:** Select the frame or layers you want to audit on your Framer canvas.
2. **Run Scan:** Click the "Scan" button in the plugin interface.
3. **Review Issues:** Browse through the list of detected accessibility issues.
4. **Fix Issues:**
   - Click **Fix** on individual items to resolve them one by one.
   - Use **Batch Fix** to resolve multiple items at once.
   - For Alt Text, ensure you have your API key set up to use the AI generation feature.

## 💻 Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Framer API:** `framer-plugin`
- **AI:** Anthropic Claude 3 Sonnet (for image analysis)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

[MIT](LICENSE)
