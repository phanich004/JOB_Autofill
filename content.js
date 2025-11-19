// Content script for auto-filling forms
console.log('Resume AutoFill content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autoFill') {
    const result = autoFillForm(request.data);
    sendResponse({ success: true, fieldsFound: result });
  }
  return true;
});

// Auto-fill form with resume data
function autoFillForm(data) {
  const resume = data.resume;
  const generic = data.generic;
  let fieldsFound = 0;

  // Get all input, select, and textarea elements
  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    // Skip hidden, submit, button, and already filled fields
    if (input.type === 'hidden' ||
      input.type === 'submit' ||
      input.type === 'button' ||
      input.type === 'image' ||
      (input.value && input.value.trim() !== '')) {
      return;
    }

    const fieldIdentifier = getFieldIdentifier(input);
    const value = matchFieldToData(fieldIdentifier, resume, generic, input);

    if (value) {
      fillField(input, value);
      fieldsFound++;
    }
  });

  return fieldsFound;
}

// Get field identifier from various attributes
function getFieldIdentifier(element) {
  const attributes = [
    element.id,
    element.name,
    element.placeholder,
    element.getAttribute('aria-label'),
    element.getAttribute('data-label'),
    element.className
  ].filter(Boolean).join(' ').toLowerCase();

  // Also check label text
  const label = findLabelForInput(element);
  if (label) {
    return attributes + ' ' + label.toLowerCase();
  }

  return attributes;
}

// Find label text for an input
function findLabelForInput(input) {
  // Try to find label by 'for' attribute
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }

  // Try to find parent label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent;

  // Try to find nearby label
  const previousElement = input.previousElementSibling;
  if (previousElement && previousElement.tagName === 'LABEL') {
    return previousElement.textContent;
  }

  return '';
}

// Match field to data based on common patterns
function matchFieldToData(fieldId, resume, generic, element) {
  // Full Name (for sites that still use it)
  if (matchesPattern(fieldId, ['name', 'full name', 'fullname', 'full_name', 'applicant name', 'your name', 'legal name'])) {
    return resume.fullName || [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ');
  }

  // First name
  if (matchesPattern(fieldId, ['first name', 'firstname', 'first_name', 'fname', 'given name'])) {
    return resume.firstName || (resume.fullName ? resume.fullName.split(' ')[0] : '');
  }

  // Middle name
  if (matchesPattern(fieldId, ['middle name', 'middlename', 'middle_name', 'mname', 'middle initial'])) {
    return resume.middleName || '';
  }

  // Last name
  if (matchesPattern(fieldId, ['last name', 'lastname', 'last_name', 'lname', 'surname', 'family name'])) {
    if (resume.lastName) return resume.lastName;
    const names = resume.fullName ? resume.fullName.split(' ') : [];
    return names.length > 1 ? names.slice(1).join(' ') : '';
  }

  // Email
  if (matchesPattern(fieldId, ['email', 'e-mail', 'mail']) || element.type === 'email') {
    return resume.email;
  }

  // Phone
  if (matchesPattern(fieldId, ['phone', 'telephone', 'mobile', 'cell', 'contact number']) || element.type === 'tel') {
    return resume.phone;
  }

  // Address
  if (matchesPattern(fieldId, ['address', 'street', 'address line 1', 'address1', 'street address'])) {
    return resume.address;
  }

  // City
  if (matchesPattern(fieldId, ['city', 'town', 'municipality'])) {
    return resume.city;
  }

  // State
  if (matchesPattern(fieldId, ['state', 'province', 'region'])) {
    return resume.state;
  }

  // ZIP Code
  if (matchesPattern(fieldId, ['zip', 'postal', 'postcode', 'zip code', 'postal code'])) {
    return resume.zipCode;
  }

  // Country
  if (matchesPattern(fieldId, ['country', 'nation'])) {
    return resume.country;
  }

  // LinkedIn
  if (matchesPattern(fieldId, ['linkedin', 'linked in', 'linkedin profile', 'linkedin url'])) {
    return resume.linkedin;
  }

  // GitHub
  if (matchesPattern(fieldId, ['github', 'git hub', 'github profile', 'github url'])) {
    return resume.github;
  }

  // Portfolio/Website
  if (matchesPattern(fieldId, ['portfolio', 'website', 'personal website', 'web site', 'url', 'homepage'])) {
    return resume.portfolio;
  }

  // Current Company
  if (matchesPattern(fieldId, ['company', 'employer', 'current company', 'organization', 'current employer'])) {
    return resume.currentCompany;
  }

  // Job Title
  if (matchesPattern(fieldId, ['title', 'job title', 'position', 'role', 'current position', 'current title', 'current role'])) {
    return resume.currentTitle;
  }

  // Years of Experience
  if (matchesPattern(fieldId, ['experience', 'years of experience', 'years experience', 'work experience', 'years'])) {
    return resume.yearsOfExperience;
  }

  // University/College
  if (matchesPattern(fieldId, ['university', 'college', 'school', 'institution', 'education'])) {
    return resume.university;
  }

  // Degree
  if (matchesPattern(fieldId, ['degree', 'qualification', 'diploma'])) {
    return resume.degree;
  }

  // Major/Field of Study
  if (matchesPattern(fieldId, ['major', 'field of study', 'field', 'specialization', 'concentration', 'subject'])) {
    return resume.major;
  }

  // Graduation Year
  if (matchesPattern(fieldId, ['graduation', 'grad year', 'year of graduation', 'completion year'])) {
    return resume.graduationYear;
  }

  // Skills
  if (matchesPattern(fieldId, ['skill', 'skills', 'expertise', 'competencies', 'technical skills'])) {
    return resume.skills;
  }

  // Summary/Cover Letter
  if (matchesPattern(fieldId, ['summary', 'about', 'bio', 'biography', 'cover letter', 'introduction', 'about you', 'about yourself', 'tell us about yourself', 'describe yourself'])) {
    return resume.summary;
  }

  // Generic Details - Gender
  if (matchesPattern(fieldId, ['gender', 'sex', 'gender identity'])) {
    // Map common gender values
    if (generic.gender) {
      const genderMap = {
        'male': ['male', 'm'],
        'female': ['female', 'f'],
        'non-binary': ['non-binary', 'nonbinary', 'non binary'],
        'other': ['other'],
        '': ['decline', 'prefer not']
      };
      return generic.gender;
    }
  }

  // Race/Ethnicity
  if (matchesPattern(fieldId, ['race', 'ethnicity', 'ethnic', 'racial', 'race/ethnicity', 'hispanic or latino'])) {
    // Map race values to common variations
    if (generic.race) {
      const raceMap = {
        'asian': ['asian', 'asian (not hispanic or latino)'],
        'black': ['black', 'african american', 'black or african american', 'black or african american (not hispanic or latino)'],
        'hispanic': ['hispanic', 'latino', 'hispanic or latino'],
        'native': ['native american', 'alaska native', 'american indian or alaska native', 'american indian or alaska native (not hispanic or latino)'],
        'pacific': ['pacific islander', 'native hawaiian', 'native hawaiian or other pacific islander', 'native hawaiian or other pacific islander (not hispanic or latino)'],
        'white': ['white', 'white (not hispanic or latino)', 'caucasian'],
        'two-or-more': ['two or more', 'two or more races', 'two or more races (not hispanic or latino)'],
        'other': ['other'],
        '': ['decline', 'prefer not']
      };
      return generic.race;
    }
  }

  // Veteran Status
  if (matchesPattern(fieldId, ['veteran', 'military', 'armed forces', 'protected veteran', 'veteran status'])) {
    // Map veteran values
    if (generic.veteran) {
      const veteranMap = {
        'yes': ['yes', 'i am a veteran', 'veteran'],
        'protected': ['protected', 'protected veteran', 'i identify as one or more of the classifications of protected veteran'],
        'no': ['no', 'i am not a veteran', 'i am not a protected veteran', 'not a veteran'],
        '': ['decline', 'prefer not', 'i decline to self-identify']
      };
      return generic.veteran;
    }
  }

  // Disability
  if (matchesPattern(fieldId, ['disability', 'disabled', 'disability status'])) {
    return generic.disability;
  }

  // Work Authorization
  if (matchesPattern(fieldId, ['work authorization', 'authorization', 'work status', 'employment authorization', 'visa status', 'citizen'])) {
    return generic.workAuthorization;
  }

  // Security Clearance
  if (matchesPattern(fieldId, ['security clearance', 'clearance', 'security'])) {
    return generic.securityClearance;
  }

  // Desired Salary
  if (matchesPattern(fieldId, ['salary', 'compensation', 'expected salary', 'desired salary', 'pay'])) {
    return generic.desiredSalary;
  }

  // Available Start Date
  if (matchesPattern(fieldId, ['start date', 'available', 'availability', 'when can you start', 'join date'])) {
    return generic.availableStartDate;
  }

  // Willing to Relocate
  if (matchesPattern(fieldId, ['relocate', 'relocation', 'willing to relocate', 'move'])) {
    return generic.willingToRelocate;
  }

  // Work Preference (Remote/Hybrid/In-office)
  if (matchesPattern(fieldId, ['work preference', 'work location preference', 'remote', 'work arrangement', 'work type', 'work mode'])) {
    return generic.workPreference;
  }

  // Preferred Location
  if (matchesPattern(fieldId, ['preferred location', 'preferred work location', 'location preference', 'desired location'])) {
    return generic.preferredLocation;
  }

  // Current Salary
  if (matchesPattern(fieldId, ['current salary', 'current compensation', 'present salary', 'current pay'])) {
    return generic.currentSalary;
  }

  return null;
}

// Check if field identifier matches any pattern
function matchesPattern(fieldId, patterns) {
  return patterns.some(pattern => {
    // Exact word match with word boundaries
    const regex = new RegExp('\\b' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return regex.test(fieldId);
  });
}

// Fill field with value
function fillField(element, value) {
  if (!value) return;

  const tagName = element.tagName.toLowerCase();

  try {
    if (tagName === 'select') {
      // For select elements, try to find matching option
      const options = Array.from(element.options);
      const matchingOption = options.find(option =>
        option.value.toLowerCase() === value.toLowerCase() ||
        option.text.toLowerCase() === value.toLowerCase() ||
        option.text.toLowerCase().includes(value.toLowerCase()) ||
        value.toLowerCase().includes(option.text.toLowerCase())
      );

      if (matchingOption) {
        element.value = matchingOption.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (element.type === 'checkbox') {
      // For checkboxes, check if value suggests true/yes
      const shouldCheck = ['yes', 'true', '1', 'checked'].includes(value.toString().toLowerCase());
      element.checked = shouldCheck;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.type === 'radio') {
      // For radio buttons, check if value matches
      const elementValue = element.value.toLowerCase();
      const elementLabel = findLabelForInput(element).toLowerCase();
      const searchValue = value.toLowerCase();

      // Try multiple matching strategies
      const matches =
        elementValue === searchValue ||
        elementLabel === searchValue ||
        elementLabel.includes(searchValue) ||
        searchValue.includes(elementValue) ||
        // Special handling for common variations
        (searchValue === 'yes' && (elementLabel.includes('i am') || elementLabel.includes('yes'))) ||
        (searchValue === 'no' && (elementLabel.includes('not') || elementLabel.includes('no'))) ||
        (searchValue === 'protected' && elementLabel.includes('protected')) ||
        (searchValue === 'male' && elementLabel.includes('male') && !elementLabel.includes('female')) ||
        (searchValue === 'female' && elementLabel.includes('female')) ||
        // Race matching
        (searchValue === 'asian' && elementLabel.includes('asian')) ||
        (searchValue === 'black' && (elementLabel.includes('black') || elementLabel.includes('african american'))) ||
        (searchValue === 'hispanic' && (elementLabel.includes('hispanic') || elementLabel.includes('latino'))) ||
        (searchValue === 'white' && elementLabel.includes('white')) ||
        (searchValue === 'native' && (elementLabel.includes('native') || elementLabel.includes('american indian') || elementLabel.includes('alaska'))) ||
        (searchValue === 'pacific' && (elementLabel.includes('pacific') || elementLabel.includes('hawaiian'))) ||
        (searchValue === 'two-or-more' && elementLabel.includes('two or more'));

      if (matches) {
        element.checked = true;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      // For text inputs and textareas
      element.value = value;

      // Trigger various events that frameworks might listen to
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    // Highlight filled field briefly
    highlightField(element);
  } catch (error) {
    console.error('Error filling field:', error);
  }
}

// Highlight filled field
function highlightField(element) {
  const originalBackground = element.style.backgroundColor;
  const originalTransition = element.style.transition;

  element.style.transition = 'background-color 0.3s ease';
  element.style.backgroundColor = '#d4edda';

  setTimeout(() => {
    element.style.backgroundColor = originalBackground;
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 300);
  }, 1000);
}

// Add context menu support
document.addEventListener('contextmenu', (e) => {
  const target = e.target;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
    // Store the focused element for context menu action
    chrome.storage.local.set({ lastFocusedElement: target.id || target.name });
  }
});

