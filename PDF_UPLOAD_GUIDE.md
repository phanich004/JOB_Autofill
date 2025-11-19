# PDF Resume Upload Feature

## Overview

The Resume AutoFill extension now supports **PDF resume upload** with automatic parsing! Simply upload your resume PDF and the extension will intelligently extract all your information.

## How It Works

### 1. PDF Processing
- Uses **PDF.js** (Mozilla's library) for client-side PDF parsing
- All processing happens locally in your browser
- No data is sent to external servers
- Fully compliant with Chrome extension policies

### 2. Intelligent Field Extraction

The parser automatically extracts:

#### Personal Information
- ✅ **Name** (separated into first, middle, last)
- ✅ **Email** (pattern matching)
- ✅ **Phone** (multiple formats supported)
- ✅ **Address** (street, city, state, ZIP)

#### Professional Information
- ✅ **LinkedIn** profile URL
- ✅ **GitHub** profile URL
- ✅ **Portfolio** website
- ✅ **Current Company** (from experience section)
- ✅ **Current Job Title**
- ✅ **Years of Experience** (calculated from dates)

#### Education
- ✅ **University/College** name
- ✅ **Degree** (Bachelor's, Master's, PhD)
- ✅ **Major/Field of Study**
- ✅ **Graduation Year**

#### Skills & Summary
- ✅ **Skills** (detects common technologies)
- ✅ **Professional Summary** (from about/summary sections)

## How to Use

### Step 1: Upload Your Resume
1. Click the extension icon
2. Click **"📤 Upload Resume PDF"**
3. Select your resume PDF file
4. Wait for parsing (usually 1-3 seconds)

### Step 2: Review Extracted Data
- The extension will show: "✅ Resume parsed successfully! Found X fields"
- Your resume status will update automatically
- All extracted data is saved to storage

### Step 3: Edit if Needed
- Click **"✏️ Edit Resume"** to review/modify extracted data
- The form will be pre-filled with all parsed information
- Make any corrections or additions
- Click **"Save Resume"**

### Step 4: Auto-Fill Applications
- Navigate to any job application form
- Click **"🚀 Auto Fill Page"**
- Watch your information populate automatically!

## Supported Resume Formats

### ✅ Works Best With:
- Standard chronological resumes
- Resumes with clear section headers (Experience, Education, Skills)
- Text-based PDFs (not scanned images)
- Common formats from:
  - Microsoft Word → PDF
  - Google Docs → PDF
  - LaTeX → PDF
  - Resume builders (Indeed, LinkedIn, etc.)

### ⚠️ May Need Manual Review:
- Creative/graphic-heavy resumes
- Multi-column layouts
- Scanned PDFs (images)
- Non-standard section names

## Parsing Accuracy

**Expected Accuracy**:
- Email, Phone: **95-100%** (pattern-based)
- Name: **85-95%** (usually first line)
- LinkedIn/GitHub: **90-100%** (URL pattern matching)
- Education: **70-85%** (depends on format)
- Skills: **60-80%** (detects common technologies)
- Experience: **65-80%** (depends on formatting)

**Tip**: Always review the extracted data before using it for applications!

## Technical Details

### Libraries Used
- **PDF.js v4.0.379** - Mozilla's PDF rendering library
- Bundled locally (no CDN dependencies)
- CSP-compliant implementation

### File Size Limits
- PDF files: No hard limit
- Extracted data stored in `chrome.storage.sync` (100KB limit)
- Only text data is stored, not the PDF itself

### Privacy & Security
- ✅ All processing happens locally
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Your resume data stays on your device
- ✅ Fully compliant with Chrome Web Store policies

## Troubleshooting

### "Failed to parse PDF"
- **Cause**: PDF might be corrupted or password-protected
- **Solution**: Try re-exporting your resume as PDF

### "Found 0 fields"
- **Cause**: PDF might be a scanned image
- **Solution**: Use manual entry or convert to text-based PDF

### "Error processing PDF"
- **Cause**: Browser compatibility issue
- **Solution**: Update Chrome to latest version

### Extracted data is incorrect
- **Cause**: Non-standard resume format
- **Solution**: Click "Edit Resume" and manually correct fields

## Fallback Option

If PDF parsing doesn't work perfectly:
1. Click **"✏️ Enter Manually"**
2. Fill in your information by hand
3. Save and use normally

The manual entry option is always available!

## Future Improvements

Potential enhancements:
- 🔮 AI-powered parsing (using GPT/Claude APIs)
- 🔮 Support for DOCX files
- 🔮 Multi-language support
- 🔮 Custom field mapping
- 🔮 Batch processing multiple resumes

## Files Modified

1. **lib/pdf.min.mjs** - PDF.js library (NEW)
2. **lib/pdf.worker.min.mjs** - PDF.js worker (NEW)
3. **pdf-parser.js** - Resume parsing logic (NEW)
4. **popup.html** - Added upload button and file input
5. **popup.js** - Added PDF upload handler
6. **manifest.json** - Added web_accessible_resources

## Backward Compatibility

✅ Fully backward compatible
✅ Manual entry still works
✅ Existing saved resumes unaffected
✅ No breaking changes

---

**Enjoy the time-saving magic of PDF resume upload!** 🚀✨
