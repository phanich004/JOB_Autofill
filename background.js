// Background service worker for Resume AutoFill extension

console.log('Resume AutoFill background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Resume AutoFill extension installed');
    
    // Create context menu items
    createContextMenus();
    
    // Open welcome page
    chrome.tabs.create({
      url: 'popup.html'
    });
  } else if (details.reason === 'update') {
    console.log('Resume AutoFill extension updated');
    createContextMenus();
  }
});

// Create context menu items
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Main auto-fill menu item
    chrome.contextMenus.create({
      id: 'autoFillField',
      title: 'Auto-fill this field',
      contexts: ['editable']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'separator1',
      type: 'separator',
      contexts: ['editable']
    });

    // Fill entire form
    chrome.contextMenus.create({
      id: 'autoFillForm',
      title: 'Auto-fill entire form',
      contexts: ['page', 'editable']
    });

    // Manage resume
    chrome.contextMenus.create({
      id: 'manageResume',
      title: 'Manage Resume',
      contexts: ['page', 'editable']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'autoFillField') {
    // Auto-fill single field
    await autoFillSingleField(tab.id);
  } else if (info.menuItemId === 'autoFillForm') {
    // Auto-fill entire form
    await autoFillEntireForm(tab.id);
  } else if (info.menuItemId === 'manageResume') {
    // Open popup
    chrome.action.openPopup();
  }
});

// Auto-fill single field
async function autoFillSingleField(tabId) {
  const result = await chrome.storage.sync.get(['resumeData', 'genericDetails']);
  
  if (!result.resumeData || !result.resumeData.fullName) {
    showNotification('Please add your resume first!', tabId);
    return;
  }

  chrome.tabs.sendMessage(tabId, {
    action: 'autoFillSingle',
    data: {
      resume: result.resumeData,
      generic: result.genericDetails || {}
    }
  });
}

// Auto-fill entire form
async function autoFillEntireForm(tabId) {
  const result = await chrome.storage.sync.get(['resumeData', 'genericDetails']);
  
  if (!result.resumeData || !result.resumeData.fullName) {
    showNotification('Please add your resume first!', tabId);
    return;
  }

  chrome.tabs.sendMessage(tabId, {
    action: 'autoFill',
    data: {
      resume: result.resumeData,
      generic: result.genericDetails || {}
    }
  }, (response) => {
    if (response && response.success) {
      showNotification(`Auto-filled ${response.fieldsFound} field(s)!`, tabId);
    }
  });
}

// Show notification on the page
function showNotification(message, tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: 'showNotification',
    message: message
  });
}

// Handle keyboard shortcuts (optional feature - currently disabled)
// To enable: Add "commands" section to manifest.json
if (chrome.commands) {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'auto-fill-form') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await autoFillEntireForm(tab.id);
      }
    }
  });
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getResumeData') {
    chrome.storage.sync.get(['resumeData', 'genericDetails'], (result) => {
      sendResponse({
        resume: result.resumeData || {},
        generic: result.genericDetails || {}
      });
    });
    return true; // Keep channel open for async response
  }
});

