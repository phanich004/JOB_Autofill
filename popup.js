// DOM Elements
const mainView = document.getElementById('mainView');
const resumeFormView = document.getElementById('resumeFormView');
const genericDetailsView = document.getElementById('genericDetailsView');

const uploadPdfBtn = document.getElementById('uploadPdfBtn');
const pdfFileInput = document.getElementById('pdfFileInput');
const addResumeBtn = document.getElementById('addResumeBtn');
const editResumeBtn = document.getElementById('editResumeBtn');
const genericDetailsBtn = document.getElementById('genericDetailsBtn');
const autoFillBtn = document.getElementById('autoFillBtn');

const backFromResume = document.getElementById('backFromResume');
const backFromGeneric = document.getElementById('backFromGeneric');

const resumeForm = document.getElementById('resumeForm');
const genericForm = document.getElementById('genericForm');

const cancelResume = document.getElementById('cancelResume');
const cancelGeneric = document.getElementById('cancelGeneric');

const resumeStatusText = document.getElementById('resumeStatusText');

// Initialize popup
document.addEventListener('DOMContentLoaded', initializePopup);

async function initializePopup() {
  await updateResumeStatus();
  setupEventListeners();
}

// Update resume status display
async function updateResumeStatus() {
  const result = await chrome.storage.sync.get(['resumeData']);

  // Check if we have any resume data at all
  if (result.resumeData && Object.keys(result.resumeData).length > 1) { // More than just 'updatedAt'
    // Try to get a name to display
    let displayName = 'Resume Data';

    if (result.resumeData.firstName || result.resumeData.fullName) {
      displayName = result.resumeData.firstName
        ? `${result.resumeData.firstName} ${result.resumeData.lastName || ''}`.trim()
        : result.resumeData.fullName;
    } else if (result.resumeData.email) {
      displayName = result.resumeData.email;
    }

    resumeStatusText.textContent = `Resume: ${displayName}`;
    editResumeBtn.style.display = 'flex';
    autoFillBtn.style.display = 'flex';
    addResumeBtn.innerHTML = 'Add New Resume';
  } else {
    resumeStatusText.textContent = 'No resume added';
    editResumeBtn.style.display = 'none';
    autoFillBtn.style.display = 'none';
    addResumeBtn.innerHTML = 'Enter Manually';
  }
}

// Setup event listeners
function setupEventListeners() {
  // PDF Upload
  uploadPdfBtn.addEventListener('click', () => pdfFileInput.click());
  pdfFileInput.addEventListener('change', handlePdfUpload);

  // Navigation
  addResumeBtn.addEventListener('click', () => showView('resume'));
  editResumeBtn.addEventListener('click', () => showView('resume', true));
  genericDetailsBtn.addEventListener('click', () => showView('generic'));
  autoFillBtn.addEventListener('click', triggerAutoFill);

  backFromResume.addEventListener('click', () => showView('main'));
  backFromGeneric.addEventListener('click', () => showView('main'));

  cancelResume.addEventListener('click', () => showView('main'));
  cancelGeneric.addEventListener('click', () => showView('main'));

  // Forms
  resumeForm.addEventListener('submit', handleResumeSave);
  genericForm.addEventListener('submit', handleGenericSave);
}

// View navigation
async function showView(view, isEdit = false) {
  mainView.style.display = 'none';
  resumeFormView.style.display = 'none';
  genericDetailsView.style.display = 'none';

  switch (view) {
    case 'main':
      mainView.style.display = 'block';
      await updateResumeStatus();
      break;
    case 'resume':
      resumeFormView.style.display = 'block';
      if (isEdit) {
        await loadResumeData();
      } else {
        resumeForm.reset();
      }
      break;
    case 'generic':
      genericDetailsView.style.display = 'block';
      await loadGenericData();
      break;
  }
}

// Load existing resume data
async function loadResumeData() {
  const result = await chrome.storage.sync.get(['resumeData']);
  const data = result.resumeData || {};

  // Handle legacy fullName field
  if (data.fullName && !data.firstName) {
    const nameParts = data.fullName.split(' ');
    data.firstName = nameParts[0] || '';
    data.lastName = nameParts.slice(1).join(' ') || '';
  }

  // Populate form fields
  document.getElementById('firstName').value = data.firstName || '';
  document.getElementById('middleName').value = data.middleName || '';
  document.getElementById('lastName').value = data.lastName || '';
  document.getElementById('email').value = data.email || '';
  document.getElementById('phone').value = data.phone || '';
  document.getElementById('address').value = data.address || '';
  document.getElementById('city').value = data.city || '';
  document.getElementById('state').value = data.state || '';
  document.getElementById('zipCode').value = data.zipCode || '';
  document.getElementById('country').value = data.country || '';
  document.getElementById('linkedin').value = data.linkedin || '';
  document.getElementById('github').value = data.github || '';
  document.getElementById('portfolio').value = data.portfolio || '';
  document.getElementById('currentCompany').value = data.currentCompany || '';
  document.getElementById('currentTitle').value = data.currentTitle || '';
  document.getElementById('yearsOfExperience').value = data.yearsOfExperience || '';
  document.getElementById('university').value = data.university || '';
  document.getElementById('degree').value = data.degree || '';
  document.getElementById('major').value = data.major || '';
  document.getElementById('graduationYear').value = data.graduationYear || '';
  document.getElementById('skills').value = data.skills || '';
  document.getElementById('summary').value = data.summary || '';
}

// Handle PDF upload
async function handlePdfUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    showNotification('Please upload a PDF file', 'error');
    return;
  }

  // Show loading state
  uploadPdfBtn.disabled = true;
  uploadPdfBtn.innerHTML = 'Parsing PDF...';

  try {
    // Parse the PDF
    const parser = new window.ResumeParser();
    const result = await parser.parseResumePDF(file);

    if (result.success) {
      // Save the parsed data
      const resumeData = {
        ...result.data,
        fullName: [result.data.firstName, result.data.middleName, result.data.lastName].filter(Boolean).join(' '),
        updatedAt: new Date().toISOString()
      };

      await chrome.storage.sync.set({ resumeData });

      // Show success and update UI
      showNotification(`Resume parsed successfully! Found ${Object.keys(result.data).length} fields`);
      await updateResumeStatus();

      // Reset file input
      pdfFileInput.value = '';
    } else {
      showNotification('Failed to parse PDF: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('PDF upload error:', error);
    showNotification('Error processing PDF. Please try manual entry.', 'error');
  } finally {
    // Reset button state
    uploadPdfBtn.disabled = false;
    uploadPdfBtn.innerHTML = 'Upload Resume PDF';
  }
}

// Load existing generic data
async function loadGenericData() {
  const result = await chrome.storage.sync.get(['genericDetails']);
  const data = result.genericDetails || {};

  document.getElementById('gender').value = data.gender || '';
  document.getElementById('race').value = data.race || '';
  document.getElementById('veteran').value = data.veteran || '';
  document.getElementById('disability').value = data.disability || '';
  document.getElementById('workAuthorization').value = data.workAuthorization || '';
  document.getElementById('securityClearance').value = data.securityClearance || '';
  document.getElementById('currentSalary').value = data.currentSalary || '';
  document.getElementById('desiredSalary').value = data.desiredSalary || '';
  document.getElementById('availableStartDate').value = data.availableStartDate || '';
  document.getElementById('workPreference').value = data.workPreference || '';
  document.getElementById('preferredLocation').value = data.preferredLocation || '';
  document.getElementById('willingToRelocate').value = data.willingToRelocate || '';
}

// Save resume data
async function handleResumeSave(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const middleName = document.getElementById('middleName').value;
  const lastName = document.getElementById('lastName').value;

  const resumeData = {
    firstName,
    middleName,
    lastName,
    fullName: [firstName, middleName, lastName].filter(Boolean).join(' '), // For backward compatibility
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zipCode: document.getElementById('zipCode').value,
    country: document.getElementById('country').value,
    linkedin: document.getElementById('linkedin').value,
    github: document.getElementById('github').value,
    portfolio: document.getElementById('portfolio').value,
    currentCompany: document.getElementById('currentCompany').value,
    currentTitle: document.getElementById('currentTitle').value,
    yearsOfExperience: document.getElementById('yearsOfExperience').value,
    university: document.getElementById('university').value,
    degree: document.getElementById('degree').value,
    major: document.getElementById('major').value,
    graduationYear: document.getElementById('graduationYear').value,
    skills: document.getElementById('skills').value,
    summary: document.getElementById('summary').value,
    updatedAt: new Date().toISOString()
  };

  await chrome.storage.sync.set({ resumeData });
  showNotification('Resume saved successfully!');
  showView('main');
}

// Save generic details
async function handleGenericSave(e) {
  e.preventDefault();

  const genericDetails = {
    gender: document.getElementById('gender').value,
    race: document.getElementById('race').value,
    veteran: document.getElementById('veteran').value,
    disability: document.getElementById('disability').value,
    workAuthorization: document.getElementById('workAuthorization').value,
    securityClearance: document.getElementById('securityClearance').value,
    currentSalary: document.getElementById('currentSalary').value,
    desiredSalary: document.getElementById('desiredSalary').value,
    availableStartDate: document.getElementById('availableStartDate').value,
    workPreference: document.getElementById('workPreference').value,
    preferredLocation: document.getElementById('preferredLocation').value,
    willingToRelocate: document.getElementById('willingToRelocate').value,
    updatedAt: new Date().toISOString()
  };

  await chrome.storage.sync.set({ genericDetails });
  showNotification('Details saved successfully!');
  showView('main');
}

// Trigger auto-fill on current page
async function triggerAutoFill() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.storage.sync.get(['resumeData', 'genericDetails']);

  // Check if we have any resume data at all
  if (!result.resumeData || Object.keys(result.resumeData).length <= 1) {
    showNotification('Please add your resume first!', 'error');
    return;
  }

  // Send message to content script
  chrome.tabs.sendMessage(tab.id, {
    action: 'autoFill',
    data: {
      resume: result.resumeData,
      generic: result.genericDetails || {}
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      showNotification('Could not auto-fill. Please refresh the page and try again.', 'error');
    } else if (response && response.success) {
      showNotification(`Auto-filled ${response.fieldsFound} field(s)!`);
      setTimeout(() => window.close(), 1500);
    }
  });
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

