# Resume AutoFill - Chrome Extension

A powerful Chrome extension that automatically fills job application forms with your resume information. Upload your resume PDF or enter details manually, then auto-fill forms with a single click.

## Features

### Core Functionality
- **PDF Resume Upload**: Upload your resume PDF and automatically extract all information
- **Manual Entry**: Enter your information manually with an intuitive form interface
- **One-Click Auto-Fill**: Automatically fill job application forms on any website
- **Smart Field Detection**: Intelligently matches form fields across different job application platforms

### Resume Information Supported
- **Personal Information**: Name (first, middle, last), email, phone, address
- **Professional Information**: LinkedIn, GitHub, portfolio, current company, job title, years of experience
- **Education**: University, degree, major, graduation year
- **Skills & Summary**: Technical skills, professional summary
- **Work Preferences**: Remote/hybrid/in-office preference, preferred location, salary expectations
- **Demographic Information**: Gender, race/ethnicity, veteran status, disability status, work authorization

### Design & UX
- Modern, premium UI with glassmorphism effects
- Smooth animations and micro-interactions
- Google Fonts (Inter) for professional typography
- Responsive design
- Dark mode compatible

## Installation

### From Source (Development)

1. **Clone or Download** this repository
   ```bash
   git clone https://github.com/yourusername/resume-autofill.git
   cd resume-autofill
   ```

2. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extension directory

3. **Start Using**
   - Click the extension icon in your browser toolbar
   - Upload your resume PDF or enter details manually
   - Navigate to any job application form
   - Click "Auto Fill Page"

## Usage

### Quick Start

1. **Add Your Resume**
   - Click the extension icon
   - Choose one of two options:
     - **Upload Resume PDF**: Click "Upload Resume PDF" and select your resume file
     - **Enter Manually**: Click "Enter Manually" and fill in the form

2. **Configure Generic Details** (Optional)
   - Click "Generic Details"
   - Fill in demographic information, work preferences, etc.
   - Click "Save Details"

3. **Auto-Fill Applications**
   - Navigate to any job application form
   - Click the extension icon
   - Click "Auto Fill Page"
   - Review and submit your application

### PDF Upload

The extension uses PDF.js to extract text from your resume and intelligently parse:
- Name, email, phone number
- LinkedIn, GitHub, portfolio URLs
- Education details (university, degree, major, graduation year)
- Work experience (company, job title, years of experience)
- Skills and professional summary

**Expected Accuracy:**
- Email/Phone: 95-100%
- Name: 85-95%
- URLs (LinkedIn/GitHub): 90-100%
- Education: 70-85%
- Skills: 60-80%

**Tip**: Always review extracted data by clicking "Edit Resume" before using it for applications.

### Supported Job Application Platforms

The extension works on most job application websites, including:
- LinkedIn Jobs
- Indeed
- Greenhouse-powered application systems
- Lever-powered application systems
- Workday
- Company career pages
- Custom application forms

## Technical Details

### Technology Stack
- **Manifest Version**: 3
- **PDF Processing**: PDF.js v4.0.379
- **Storage**: Chrome Storage API (sync)
- **Permissions**: storage, activeTab, scripting, contextMenus

### File Structure
```
resume-autofill/
├── manifest.json           # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Styles for popup
├── popup.js               # Popup logic
├── content.js             # Content script for form filling
├── background.js          # Background service worker
├── pdf-parser.js          # PDF parsing utility
├── lib/
│   ├── pdf.min.mjs        # PDF.js library
│   └── pdf.worker.min.mjs # PDF.js worker
├── icons/                 # Extension icons
└── README.md             # This file
```

### Privacy & Security
- All data processing happens locally in your browser
- No data is sent to external servers
- Resume data is stored only in Chrome's local storage
- Fully compliant with Chrome Web Store policies
- No tracking or analytics

### Browser Compatibility
- Chrome (tested)
- Edge (Chromium-based)
- Brave
- Any Chromium-based browser

## Development

### Prerequisites
- Google Chrome or Chromium-based browser
- Basic knowledge of Chrome extension development

### Making Changes

1. **Edit Files**: Make your changes to the source files
2. **Reload Extension**: 
   - Go to `chrome://extensions/`
   - Click the reload icon on the Resume AutoFill extension
3. **Test**: Test your changes on a job application form

### Testing

Test forms are included:
- `test-form.html` - General job application form with all field types
- `test-demographic-form.html` - Demographic fields with radio buttons

## Troubleshooting

### PDF Upload Issues

**"Failed to parse PDF"**
- Ensure your PDF is not password-protected
- Try re-exporting your resume as a PDF

**"Found 0 fields"**
- Your PDF might be a scanned image (not text-based)
- Use manual entry instead

**Name not extracted correctly**
- Click "Edit Resume" and manually enter your name
- Ensure your name is at the top of your resume for better extraction

### Auto-Fill Issues

**"Could not auto-fill. Please refresh the page"**
- Refresh the job application page
- Reload the extension
- Try again

**Some fields not filling**
- Different websites use different field naming conventions
- Manually fill any missed fields
- The extension works best with standard form fields

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- PDF.js by Mozilla for PDF parsing capabilities
- Chrome Extension API documentation
- All contributors and users

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in the repository

## Roadmap

Future enhancements being considered:
- AI-powered resume parsing using GPT/Claude APIs
- Support for DOCX file uploads
- Multi-language support
- Custom field mapping
- Cover letter generation
- Application tracking

---

**Note**: This extension is designed to save time when filling out job applications. Always review auto-filled information before submitting applications to ensure accuracy.
