import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
    try {
        const templates = [
            {
                id: "ojas",
                name: "OJAS",
                description: "Modern clean",
                preview: {
                    name: "Ojas Kumar",
                    role: "Software Engineer",
                    skills: ["Java", "Python", "React"],
                    experience: "2 years"
                }
            },
            {
                id: "gambeera",
                name: "GAMBEERA",
                description: "Professional bold",
                preview: {
                    name: "Gambeera Sai",
                    role: "Senior Backend Developer",
                    skills: ["Node.js", "AWS", "MongoDB"],
                    experience: "5 years"
                }
            },
            {
                id: "nova",
                name: "NOVA",
                description: "Minimal elegant",
                preview: {
                    name: "Nova White",
                    role: "Product Designer",
                    skills: ["Figma", "UI/UX", "User Research"],
                    experience: "3 years"
                }
            },
            {
                id: "elite",
                name: "ELITE",
                description: "Corporate style",
                preview: {
                    name: "Elite Professional",
                    role: "Business Analyst",
                    skills: ["Data Analysis", "SQL", "Tableau"],
                    experience: "4 years"
                }
            },
            {
                id: "classic",
                name: "CLASSIC",
                description: "Simple ATS-friendly",
                preview: {
                    name: "John Doe",
                    role: "Full Stack Engineer",
                    skills: ["Javascript", "React", "Node"],
                    experience: "Fresher"
                }
            }
        ];

        return NextResponse.json({ templates }, { status: 200 });

    } catch (error: unknown) {
        console.error("[/api/templates] Error:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}
