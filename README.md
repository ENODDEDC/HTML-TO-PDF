# 📄 HTML to PDF Converter with Live Preview

A modern, intuitive web application that converts HTML to PDF with **pixel-perfect WYSIWYG preview**. See exactly how your PDF will look before downloading — same pages, same margins, same scaling.

![HTML to PDF Converter](https://img.shields.io/badge/React-19.2.6-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-06b6d4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 **WYSIWYG Preview**
- **What you see is what you get** — preview pages match PDF output exactly
- Real-time pagination with accurate page breaks
- Page numbers and visual page boundaries
- Responsive zoom controls (fit to width, fit to page, custom zoom)

### 📐 **Flexible Configuration**
- **Page Sizes**: A3, A4, A5, B5, Letter, Legal
- **Orientation**: Portrait or Landscape
- **Margins**: None, Narrow, Normal, Wide, or custom (in millimeters)
- **Content Scaling**: 50% to 200% with live preview
- **Fit to Paper**: Automatically scale content to fit the page

### 💻 **Modern Code Editor**
- Syntax-aware HTML editing
- Line numbers and scroll sync
- Tab key support for indentation
- Paste from clipboard button
- Character and line count display

### 🎨 **Clean, Dark UI**
- Sleek dark theme optimized for long sessions
- Mobile-responsive design with adaptive layout
- Smooth animations and transitions
- Toast notifications for user feedback

### ⚡ **Fast & Efficient**
- Renders each page individually for accuracy
- Progress indicator during PDF generation
- Client-side processing (no server required)
- Single-file build option for easy deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Modern web browser with ES6+ support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/html-to-pdf-with-preview.git

# Navigate to project directory
cd html-to-pdf-with-preview

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment:

### Workflows

1. **CI - Build and Test** (`ci.yml`)
   - Runs on every push and pull request
   - Tests build on Node.js 18.x and 20.x
   - Performs TypeScript type checking
   - Uploads build artifacts
   - Status check before merging

2. **Deploy to GitHub Pages** (`deploy.yml`)
   - Automatically deploys to GitHub Pages on push to `main`
   - Can be manually triggered via workflow dispatch
   - Production-ready build with optimizations

3. **Preview Deployment** (`preview.yml`)
   - Builds preview for pull requests
   - Uploads artifacts for testing
   - Comments build status on PR

### Setting Up GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` branch to trigger deployment
4. Your app will be available at: `https://yourusername.github.io/html-to-pdf-with-preview/`

### Branch Protection Rules (Recommended)

- Require status checks to pass before merging
- Require pull request reviews
- Enable "Require branches to be up to date before merging"

## 📖 Usage

### 1. **Paste or Write HTML**
   - Start with the sample HTML or paste your own
   - Use the built-in code editor with line numbers
   - Click "Continue to Preview" when ready

### 2. **Configure Page Settings**
   - Choose paper size (A4, Letter, etc.)
   - Set orientation (Portrait/Landscape)
   - Adjust margins (None, Narrow, Normal, Wide, or custom)
   - Scale content using the slider (50% - 200%)
   - Or enable "Fit to Paper" to auto-scale

### 3. **Preview & Adjust**
   - See real-time preview with accurate page breaks
   - Use zoom controls to inspect details
   - Adjust settings until preview looks perfect

### 4. **Download PDF**
   - Click "Download PDF" button
   - PDF will match preview exactly
   - Success notification confirms download

## 🏗️ Project Structure

```
html-to-pdf-with-preview/
├── src/
│   ├── components/
│   │   ├── CodeEditor.tsx      # HTML code editor component
│   │   ├── ConfigPanel.tsx     # Configuration sidebar
│   │   └── Preview.tsx         # Live preview with pagination
│   ├── constants/
│   │   └── sampleHtml.ts       # Default sample HTML
│   ├── utils/
│   │   └── cn.ts               # Tailwind class merger utility
│   ├── App.tsx                 # Main application component
│   ├── types.ts                # TypeScript interfaces & types
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles & Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **PDF Generation**: jsPDF 4.2
- **HTML Rendering**: html2canvas-pro 2.0
- **Utilities**: clsx, tailwind-merge

## 🎯 How It Works

### Page Preview Algorithm

1. **Measurement Phase**
   - HTML content is rendered in a hidden iframe at the configured layout width
   - Browser calculates actual content height with all styles applied

2. **Pagination Calculation**
   - Content height is divided by available page height (after margins)
   - Number of pages is determined based on content scaling factor

3. **Page Rendering**
   - Each page is an iframe showing a slice of content
   - CSS transforms (`translate` + `scale`) position content precisely
   - Content area clips overflow to match page boundaries

4. **PDF Generation**
   - Each preview page is rendered individually using html2canvas
   - Canvas images are added to jsPDF at exact page positions
   - Output PDF pages match preview pages 1:1

### Content Scaling

- **Scale Mode**: User-defined percentage (50% - 200%)
  - Smaller values fit more content per page
  - Larger values magnify content across more pages

- **Fit to Paper Mode**: Auto-scales content width to fill page
  - Maintains aspect ratio
  - Useful for responsive content

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- Styled with Tailwind CSS
- PDF generation powered by jsPDF and html2canvas-pro

## 🐛 Known Issues & Limitations

- Very large documents (100+ pages) may take longer to generate
- Complex CSS features (3D transforms, backdrop-filter) may not render perfectly
- External resources must support CORS for proper rendering

## 📧 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/html-to-pdf-with-preview/issues).

---

**Made with ❤️ using React, TypeScript, and Tailwind CSS**
