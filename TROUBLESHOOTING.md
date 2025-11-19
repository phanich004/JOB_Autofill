# Troubleshooting Guide

## Common Issues and Solutions

### ✅ FIXED: Service Worker Registration Failed (Status Code 15)

**Error Message:**
```
Service worker registration failed. Status code: 15
Uncaught TypeError: Cannot read properties of undefined (reading 'onCommand')
```

**Cause:** 
The `background.js` was trying to use the `chrome.commands` API without proper permission or manifest configuration.

**Solution:**
Added a check to ensure `chrome.commands` exists before using it. The keyboard shortcuts feature is now optional and safely disabled if not configured.

**Status:** ✅ Fixed in the current version

---

## Installation Issues

### Extension Not Loading

**Symptoms:**
- Extension doesn't appear in `chrome://extensions/`
- "Load unpacked" button is grayed out

**Solutions:**
1. Make sure "Developer mode" toggle is ON (top-right corner)
2. Verify you're selecting the `/Users/phani/job` folder (not a subfolder)
3. Check that all required files exist:
   - manifest.json
   - popup.html, popup.css, popup.js
   - content.js
   - background.js
   - icons/icon16.png, icon48.png, icon128.png

### Icons Not Showing

**Symptoms:**
- Extension loads but no icon appears
- Placeholder icon showing

**Solutions:**
1. Verify icon files exist in `icons/` directory
2. Run the icon generator:
   ```bash
   cd icons
   python3 generate_icons.py
   ```
3. Or use the HTML generator: Open `icons/create_icons.html` in browser
4. Reload the extension after adding icons

---

## Runtime Issues

### Auto-Fill Not Working

**Symptoms:**
- Click "Auto Fill Page" but nothing happens
- Fields remain empty

**Solutions:**
1. **Refresh the page** after installing/updating the extension
2. Verify you've saved your resume data:
   - Click extension icon
   - Check if it shows "Resume: [Your Name]"
   - If not, click "Add New Resume" and save your data
3. Check browser console for errors (F12 → Console tab)
4. Some sites use custom form implementations - may require manual entry

### Context Menu Not Appearing

**Symptoms:**
- Right-click doesn't show auto-fill options

**Solutions:**
1. Verify the extension is loaded and enabled
2. Reload the extension:
   - Go to `chrome://extensions/`
   - Click reload icon on Resume AutoFill
3. Refresh the webpage
4. Make sure you're right-clicking on the page content (not browser UI)

### Data Not Saving

**Symptoms:**
- Enter data and click Save, but it's gone when reopening
- "No resume added" message persists

**Solutions:**
1. Make sure you're clicking the "Save Resume" or "Save Details" button
2. Check Chrome storage permissions:
   - Go to `chrome://extensions/`
   - Find Resume AutoFill
   - Click "Details"
   - Verify "storage" permission is granted
3. Check available storage space
4. Try clearing extension storage and re-entering data

### Popup Not Opening

**Symptoms:**
- Click extension icon, nothing happens
- Popup opens then immediately closes

**Solutions:**
1. Check for JavaScript errors:
   - Right-click extension icon
   - Select "Inspect popup"
   - Look for errors in Console
2. Verify popup.html exists and is valid
3. Reload the extension

---

## Compatibility Issues

### Forms Not Being Detected

**Symptoms:**
- Auto-fill finds 0 fields on a form that clearly has inputs

**Solutions:**
1. The site may use Shadow DOM or iframes
2. The site may load fields dynamically - wait for page to fully load
3. Try refreshing the page and waiting a few seconds before auto-filling
4. Some sites block extension modifications - manual entry required

### Wrong Data in Wrong Fields

**Symptoms:**
- Auto-fill puts data in incorrect fields
- Email in name field, etc.

**Solutions:**
1. This is due to ambiguous field naming by the website
2. Simply correct the fields manually
3. The extension uses pattern matching - some sites have non-standard field names
4. Report the specific site for potential pattern improvements

### Extension Not Working on Specific Sites

**Some sites that may have limitations:**
- Sites using extensive JavaScript frameworks
- Sites with heavy CAPTCHA/security
- Sites that disable auto-fill intentionally
- Corporate/internal sites with strict policies

**Workaround:** Manual entry or copy-paste from your saved resume

---

## Browser-Specific Issues

### Chrome/Chromium Browsers

**Supported:**
- ✅ Google Chrome 88+
- ✅ Microsoft Edge (Chromium)
- ✅ Brave Browser
- ✅ Opera

**Not Supported:**
- ❌ Firefox (different extension API)
- ❌ Safari (different extension system)
- ❌ Internet Explorer (deprecated)

### Sync Issues

**Symptoms:**
- Data not syncing across devices
- Different resume on different computers

**Solutions:**
1. Make sure you're signed into Chrome with the same Google account
2. Check Chrome sync is enabled:
   - Settings → You and Google → Sync
   - Ensure "Extensions" is checked
3. Wait a few minutes for sync to propagate
4. Manually trigger sync: `chrome://sync-internals/`

---

## Performance Issues

### Extension Slowing Down Browser

**Symptoms:**
- Browser feels slow after installing
- High CPU usage

**Solutions:**
1. This shouldn't happen with this extension (minimal resource usage)
2. Check if it's another extension causing issues
3. Try disabling and re-enabling this extension
4. Check Chrome Task Manager: Shift+Esc

### Auto-Fill Takes Too Long

**Symptoms:**
- Clicking "Auto Fill" takes several seconds

**Solutions:**
1. Normal fill time is < 1 second
2. Check if page is still loading
3. Try on a simpler page to verify extension works
4. Large forms (100+ fields) may take 2-3 seconds

---

## Security & Privacy

### Data Privacy Concerns

**Q: Where is my data stored?**
A: All data is stored locally in Chrome's sync storage. Nothing is sent to external servers.

**Q: Can others see my resume data?**
A: Only you can access your data (unless you share your Google account or computer).

**Q: What data does the extension collect?**
A: The extension doesn't collect any analytics or usage data. It only stores what you enter.

**Q: Is it safe to enter sensitive information?**
A: Yes, but as with any browser storage, use a strong Chrome/Google account password.

### Permissions Explanation

**Why does the extension need these permissions?**

- `storage` - To save your resume data locally
- `activeTab` - To auto-fill the current page when you click the button
- `scripting` - To inject auto-fill functionality into web pages
- `contextMenus` - To add right-click menu options
- `<all_urls>` - To work on any job application site

---

## Uninstalling

### How to Completely Remove

1. **Remove Extension:**
   - Go to `chrome://extensions/`
   - Find "Resume AutoFill"
   - Click "Remove"
   - Confirm removal

2. **Clear Data (optional):**
   - Data is automatically deleted when extension is removed
   - To manually verify:
     - F12 → Application → Storage → Clear site data

### Reinstalling

If you need to reinstall:
1. Remove the extension (steps above)
2. Restart Chrome
3. Follow installation steps again
4. You'll need to re-enter your resume data

---

## Getting Help

### Before Reporting Issues

1. Check this troubleshooting guide
2. Read the README.md
3. Try disabling other extensions
4. Test in Chrome Incognito mode
5. Verify you're using the latest Chrome version

### Debugging Steps

1. **Check Browser Console:**
   - F12 → Console
   - Look for red errors

2. **Check Extension Console:**
   - `chrome://extensions/`
   - Click "Inspect views: service worker" under Resume AutoFill
   - Look for errors

3. **Check Popup Console:**
   - Right-click extension icon
   - Select "Inspect popup"
   - Check Console tab

### Common Error Messages

**"Cannot read properties of undefined"**
- Extension not fully loaded - refresh page
- Missing permission - check manifest.json

**"Storage quota exceeded"**
- Chrome storage limit reached (rare)
- Clear other extension data or simplify resume

**"Extension context invalidated"**
- Extension was updated or reloaded
- Refresh the page

---

## Known Limitations

1. **Shadow DOM**: Forms inside Shadow DOM may not be detected
2. **iFrames**: Cross-origin iframes cannot be accessed
3. **Dynamic Forms**: Forms that load after page load may need manual trigger
4. **Custom Inputs**: Non-standard form controls may not be recognized
5. **Protected Sites**: Banking/financial sites may block modifications

## Tips for Best Results

1. ✅ Fill complete resume information
2. ✅ Use standard date/phone formats
3. ✅ Keep skills list comma-separated
4. ✅ Review auto-filled data before submitting
5. ✅ Update resume regularly
6. ✅ Refresh pages after installing extension
7. ✅ Wait for pages to fully load before auto-filling

---

**Still having issues? Check the README.md for more detailed information.**

