// PDF Resume Parser Utility
// Uses PDF.js to extract text from PDF files and parse resume information

class ResumeParser {
    constructor() {
        this.pdfjsLib = null;
    }

    async initialize() {
        // Dynamically import PDF.js
        if (!this.pdfjsLib) {
            this.pdfjsLib = await import(chrome.runtime.getURL('lib/pdf.min.mjs'));
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.min.mjs');
        }
    }

    async parseResumePDF(file) {
        await this.initialize();

        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);

            // Load PDF document
            const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            // Extract text from all pages
            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            // Parse the extracted text
            const resumeData = this.parseResumeText(fullText);

            return {
                success: true,
                data: resumeData,
                rawText: fullText
            };
        } catch (error) {
            console.error('Error parsing PDF:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }

    parseResumeText(text) {
        const data = {};

        // Extract Email
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) data.email = emailMatch[0];

        // Extract Phone Number
        const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) data.phone = phoneMatch[0];

        // Extract Name (try multiple strategies)
        const lines = text.split('\n').filter(line => line.trim());

        // Strategy 1: Check first few lines for a name pattern
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();

            // Skip lines that are clearly not names
            if (line.length > 50 || line.includes('@') || line.includes('http') || /\d{3}/.test(line)) {
                continue;
            }

            // Look for 2-4 capitalized words (typical name format)
            const namePattern = /^([A-Z][a-z]+(?:['-][A-Z][a-z]+)?)\s+([A-Z][a-z]+(?:['-][A-Z][a-z]+)?)\s*([A-Z][a-z]+(?:['-][A-Z][a-z]+)?)?$/;
            const match = line.match(namePattern);

            if (match) {
                data.firstName = match[1];
                if (match[3]) {
                    // Three parts: First Middle Last
                    data.middleName = match[2];
                    data.lastName = match[3];
                } else {
                    // Two parts: First Last
                    data.lastName = match[2];
                }
                break;
            }

            // Fallback: Just check if it's 2-3 capitalized words
            const simpleName = /^([A-Z][a-zA-Z]+)\s+([A-Z][a-zA-Z]+)(?:\s+([A-Z][a-zA-Z]+))?$/;
            const simpleMatch = line.match(simpleName);
            if (simpleMatch && !data.firstName) {
                data.firstName = simpleMatch[1];
                if (simpleMatch[3]) {
                    data.middleName = simpleMatch[2];
                    data.lastName = simpleMatch[3];
                } else {
                    data.lastName = simpleMatch[2];
                }
                break;
            }
        }

        // Extract LinkedIn
        const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
        if (linkedinMatch) data.linkedin = 'https://' + linkedinMatch[0];

        // Extract GitHub
        const githubMatch = text.match(/github\.com\/[\w-]+/i);
        if (githubMatch) data.github = 'https://' + githubMatch[0];

        // Extract Website/Portfolio
        const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:com|net|org|io|dev)(?:\/[\w-]*)?/i);
        if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
            data.portfolio = websiteMatch[0].startsWith('http') ? websiteMatch[0] : 'https://' + websiteMatch[0];
        }

        // Extract Education
        const degreePatterns = [
            /(?:Bachelor|Master|PhD|Ph\.D\.|B\.S\.|M\.S\.|B\.A\.|M\.A\.).*?(?:in|of)\s+([A-Z][a-z\s]+)/i,
            /(Computer Science|Engineering|Business|Mathematics|Physics|Chemistry|Biology)/i
        ];

        for (const pattern of degreePatterns) {
            const match = text.match(pattern);
            if (match) {
                if (match[0].includes('Bachelor')) data.degree = 'Bachelor of Science';
                else if (match[0].includes('Master')) data.degree = 'Master of Science';
                else if (match[0].includes('PhD') || match[0].includes('Ph.D')) data.degree = 'PhD';

                if (match[1]) data.major = match[1].trim();
                break;
            }
        }

        // Extract University
        const universityKeywords = ['University', 'College', 'Institute', 'School'];
        for (const line of lines) {
            if (universityKeywords.some(keyword => line.includes(keyword))) {
                const universityMatch = line.match(/([A-Z][a-z\s]+(?:University|College|Institute|School)[A-Z a-z]*)/);
                if (universityMatch) {
                    data.university = universityMatch[1].trim();
                    break;
                }
            }
        }

        // Extract Graduation Year
        const yearMatch = text.match(/(?:Graduated?|Graduation|Class of)\s*:?\s*(\d{4})/i);
        if (yearMatch) {
            data.graduationYear = yearMatch[1];
        } else {
            // Look for recent years (2010-2030)
            const recentYearMatch = text.match(/\b(20[1-3]\d)\b/);
            if (recentYearMatch) data.graduationYear = recentYearMatch[1];
        }

        // Extract Skills
        const skillsSection = this.extractSection(text, ['Skills', 'Technical Skills', 'Expertise', 'Technologies']);
        if (skillsSection) {
            // Common skills to look for
            const commonSkills = [
                'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue',
                'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure',
                'Docker', 'Kubernetes', 'Git', 'Linux', 'Machine Learning', 'AI', 'TensorFlow'
            ];

            const foundSkills = commonSkills.filter(skill =>
                skillsSection.toLowerCase().includes(skill.toLowerCase())
            );

            if (foundSkills.length > 0) {
                data.skills = foundSkills.join(', ');
            }
        }

        // Extract Current Company and Title
        const experienceSection = this.extractSection(text, ['Experience', 'Work Experience', 'Employment']);
        if (experienceSection) {
            const lines = experienceSection.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                // First line often contains company name
                data.currentCompany = lines[0].trim();
                // Second line often contains job title
                if (lines.length > 1) {
                    data.currentTitle = lines[1].trim();
                }
            }
        }

        // Extract Years of Experience (estimate from dates)
        const dateMatches = text.match(/\b(20\d{2})\b/g);
        if (dateMatches && dateMatches.length >= 2) {
            const years = dateMatches.map(y => parseInt(y));
            const minYear = Math.min(...years);
            const currentYear = new Date().getFullYear();
            data.yearsOfExperience = currentYear - minYear;
        }

        // Extract Address
        const addressMatch = text.match(/\d+\s+[A-Z][a-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/i);
        if (addressMatch) data.address = addressMatch[0];

        // Extract City, State, ZIP
        const cityStateMatch = text.match(/([A-Z][a-z\s]+),\s*([A-Z]{2})\s*(\d{5})/);
        if (cityStateMatch) {
            data.city = cityStateMatch[1].trim();
            data.state = cityStateMatch[2];
            data.zipCode = cityStateMatch[3];
        }

        return data;
    }

    extractSection(text, sectionHeaders) {
        for (const header of sectionHeaders) {
            const regex = new RegExp(`${header}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z][a-z]+[:\\s]|$)`, 'i');
            const match = text.match(regex);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
}

// Export for use in popup.js
window.ResumeParser = ResumeParser;
