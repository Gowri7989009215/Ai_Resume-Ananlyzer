// Resume parser - extracts structured data from raw PDF text

import {
    ExtractedData,
    EducationEntry,
    ProjectEntry,
} from "./types";
import {
    SKILLS_KEYWORDS,
    EDUCATION_KEYWORDS,
    PROJECT_VERBS,
    SECTION_HEADERS,
} from "./constants";
import { cleanText, extractLines, deduplicate } from "./utils";

/**
 * Extract email from text
 */
function extractEmail(text: string): string {
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : "";
}

/**
 * Extract phone number (supports Indian and international formats)
 */
function extractPhone(text: string): string {
    const phoneRegex =
        /(?:\+?91[-.\s]?)?(?:\(?\d{3,5}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}(?:[-.\s]?\d{2,4})?/g;
    const matches = text.match(phoneRegex);
    if (!matches) return "";
    // Filter out numbers that look like years or short numbers
    const valid = matches.filter((m) => {
        const digits = m.replace(/\D/g, "");
        return digits.length >= 10;
    });
    return valid.length > 0 ? valid[0].trim() : "";
}

/**
 * Extract LinkedIn URL
 */
function extractLinkedIn(text: string): string {
    const linkedinRegex =
        /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?/gi;
    const matches = text.match(linkedinRegex);
    return matches ? matches[0] : "";
}

/**
 * Extract GitHub URL
 */
function extractGitHub(text: string): string {
    const githubRegex =
        /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9\-_.]+\/?/gi;
    const matches = text.match(githubRegex);
    return matches ? matches[0] : "";
}

/**
 * Extract portfolio URL (excluding LinkedIn and GitHub)
 */
function extractPortfolio(text: string): string {
    const urlRegex =
        /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
    const matches = text.match(urlRegex);
    if (!matches) return "";
    const portfolio = matches.find(
        (url) =>
            !url.toLowerCase().includes("linkedin.com") &&
            !url.toLowerCase().includes("github.com")
    );
    return portfolio || "";
}

/**
 * Extract full name heuristic: first non-empty line that looks like a name
 */
function extractName(text: string): string {
    const lines = extractLines(text);
    for (const line of lines.slice(0, 10)) {
        // Skip lines with emails, URLs, phone numbers
        if (line.match(/[@://|+\d{4,}]/)) continue;
        // Skip lines that are clearly headers or too short
        if (line.length < 4 || line.length > 60) continue;
        // Skip lines that are all uppercase and longer than 3 words (likely headers)
        const words = line.split(/\s+/);
        if (
            words.length >= 1 &&
            words.length <= 5 &&
            line === line.toUpperCase() &&
            words.length <= 3
        ) {
            return line
                .split(" ")
                .map(
                    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                )
                .join(" ");
        }
        // If it looks like a name (2-4 words, mostly letters)
        if (
            words.length >= 2 &&
            words.length <= 4 &&
            words.every((w) => /^[A-Za-z.'-]+$/.test(w))
        ) {
            return line;
        }
    }
    return lines[0] || "";
}

/**
 * Identify section boundaries in text
 */
function identifySections(
    lines: string[]
): Record<string, number> {
    const sections: Record<string, number> = {};
    lines.forEach((line, idx) => {
        const upper = line.toUpperCase().trim();
        for (const header of SECTION_HEADERS) {
            if (
                upper === header ||
                upper.startsWith(header + " ") ||
                upper.startsWith(header + ":")
            ) {
                sections[header] = idx;
            }
        }
    });
    return sections;
}

/**
 * Extract lines between two section indices
 */
function getSectionLines(
    lines: string[],
    start: number,
    end: number
): string[] {
    return lines.slice(start + 1, end);
}

/**
 * Extract skills from text
 */
function extractSkills(text: string): string[] {
    const found: string[] = [];
    const lower = text.toLowerCase();
    for (const skill of SKILLS_KEYWORDS) {
        if (lower.includes(skill.toLowerCase())) {
            found.push(skill);
        }
    }
    return deduplicate(found);
}

/**
 * Extract education entries from text
 */
function extractEducation(text: string, lines: string[]): EducationEntry[] {
    const entries: EducationEntry[] = [];
    const sections = identifySections(lines);
    let educationLines: string[] = [];

    if (sections["EDUCATION"] !== undefined) {
        const nextSection = Math.min(
            ...Object.values(sections).filter((v) => v > sections["EDUCATION"]),
            lines.length
        );
        educationLines = getSectionLines(
            lines,
            sections["EDUCATION"],
            nextSection === Infinity ? lines.length : nextSection
        );
    } else {
        // Fallback: search entire text for education keywords
        educationLines = lines.filter((line) =>
            EDUCATION_KEYWORDS.some((kw) =>
                line.toLowerCase().includes(kw.toLowerCase())
            )
        );
    }

    // Group education lines into entries
    let currentEntry: Partial<EducationEntry> = {};
    for (const line of educationLines) {
        if (line.length < 3) continue;
        const lowerLine = line.toLowerCase();

        // Detect degree line
        const hasDegree = EDUCATION_KEYWORDS.filter((kw) =>
            ["B.Tech", "Bachelor", "Master", "M.Tech", "B.E", "B.Sc", "M.Sc", "MBA", "Ph.D"].some(
                (d) => kw.toLowerCase() === d.toLowerCase()
            )
        ).some((kw) => lowerLine.includes(kw.toLowerCase()));

        // Detect year
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        // Detect CGPA/GPA
        const cgpaMatch = line.match(/(?:CGPA|GPA|Grade)[:\s]*(\d+\.?\d*)/i);

        if (hasDegree) {
            if (currentEntry.degree) {
                entries.push({
                    degree: currentEntry.degree || "",
                    institution: currentEntry.institution || "",
                    dates: currentEntry.dates || "",
                    cgpa: currentEntry.cgpa || "",
                });
                currentEntry = {};
            }
            currentEntry.degree = line;
        } else if (
            lowerLine.includes("university") ||
            lowerLine.includes("college") ||
            lowerLine.includes("institute") ||
            lowerLine.includes("school")
        ) {
            currentEntry.institution = line;
        }

        if (yearMatch) currentEntry.dates = yearMatch[0];
        if (cgpaMatch) currentEntry.cgpa = cgpaMatch[1];
    }

    if (currentEntry.degree || currentEntry.institution) {
        entries.push({
            degree: currentEntry.degree || "",
            institution: currentEntry.institution || "",
            dates: currentEntry.dates || "",
            cgpa: currentEntry.cgpa || "",
        });
    }

    return entries;
}

/**
 * Extract projects from text
 */
function extractProjects(text: string, lines: string[]): ProjectEntry[] {
    const entries: ProjectEntry[] = [];
    const sections = identifySections(lines);
    let projectLines: string[] = [];

    if (sections["PROJECTS"] !== undefined) {
        const nextSection = Math.min(
            ...Object.values(sections).filter((v) => v > sections["PROJECTS"]),
            lines.length
        );
        projectLines = getSectionLines(
            lines,
            sections["PROJECTS"],
            nextSection === Infinity ? lines.length : nextSection
        );
    } else {
        // Fallback: find lines with project verbs
        projectLines = lines.filter((line) =>
            PROJECT_VERBS.some((verb) =>
                line.toLowerCase().startsWith(verb.toLowerCase())
            )
        );
    }

    // Group into projects: a title line followed by description lines
    let currentTitle = "";
    let currentDesc: string[] = [];

    for (const line of projectLines) {
        if (line.length < 3) continue;
        const isTitle =
            !PROJECT_VERBS.some((v) =>
                line.toLowerCase().startsWith(v.toLowerCase())
            ) &&
            line.length < 80 &&
            !line.startsWith("•") &&
            !line.startsWith("-") &&
            !line.startsWith("*");

        if (isTitle && currentDesc.length === 0 && !currentTitle) {
            currentTitle = line;
        } else if (
            PROJECT_VERBS.some((v) => line.toLowerCase().startsWith(v.toLowerCase()))
        ) {
            if (currentTitle || entries.length === 0) {
                if (currentTitle && currentDesc.length > 0) {
                    entries.push({ title: currentTitle, description: currentDesc.join(" ") });
                    currentTitle = "";
                    currentDesc = [];
                }
                currentDesc.push(line);
            }
        } else {
            if (currentTitle) {
                currentDesc.push(line);
            }
        }
    }

    if (currentTitle || currentDesc.length > 0) {
        entries.push({
            title: currentTitle || "Project",
            description: currentDesc.join(" "),
        });
    }

    // If no structured projects found, create rough entries from project verb lines
    if (entries.length === 0) {
        const verbLines = lines.filter((line) =>
            PROJECT_VERBS.some((v) => line.toLowerCase().startsWith(v.toLowerCase()))
        );
        for (let i = 0; i < verbLines.length; i++) {
            entries.push({ title: `Project ${i + 1}`, description: verbLines[i] });
        }
    }

    return entries.slice(0, 6); // Max 6 projects
}

/**
 * Main parser function
 */
export function parseResume(rawText: string): ExtractedData {
    const text = cleanText(rawText);
    const lines = extractLines(text);

    return {
        fullName: extractName(text),
        email: extractEmail(text),
        phone: extractPhone(text),
        linkedin: extractLinkedIn(text),
        github: extractGitHub(text),
        portfolio: extractPortfolio(text),
        skills: extractSkills(text),
        experience: [], // Added empty experience array to satisfy ExtractedData type
        education: extractEducation(text, lines),
        projects: extractProjects(text, lines),
        rawText: text,
    };
}
