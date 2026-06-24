import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API Key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Analyzes resumes against a natural language query using Gemini
 * @param {Array} resumes - List of resume objects from the bank
 * @param {string} query - Natural language search query (e.g., "Find experts in React and Node")
 * @returns {Promise<Array>} - List of matching resume IDs
 */
export const searchResumesWithAI = async (resumes, query) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const context = resumes.map(r => ({
      id: r.id,
      name: r.candidateName || r.fileName,
      role: r.roleType,
      phone: r.phone || r.mobile,
      email: r.email,
      experience: r.experience,
      skills: Array.isArray(r.skills) ? r.skills.join(",") : (r.skills || "")
    }));

    const prompt = `
      You are an expert recruitment assistant. 
      Identify candidate IDs matching the query. 
      
      RULES:
      1. Check Name, Role, Skills, Phone, and Email.
      2. For Phone Numbers: Ignore spaces, dashes, and country codes (e.g., match 9549440495 even if stored as +91 95494-40495).
      3. Return ONLY a JSON array of matching IDs: ["id1", "id2"].
      4. If no matches, return [].

      Candidates:
      ${JSON.stringify(context)}

      Query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up potential markdown code fences
    if (text.includes("```")) {
      text = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    }
    
    try {
      const startIdx = text.indexOf("[");
      const endIdx = text.lastIndexOf("]");
      if (startIdx !== -1 && endIdx !== -1) {
        text = text.substring(startIdx, endIdx + 1);
      }
      return JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse JSON from AI search response:", text, parseErr);
      return [];
    }
  } catch (err) {
    console.error("Gemini AI Search Error:", err);
    return [];
  }
};

/**
 * Parses raw text from a resume and extracts structured data
 * @param {string} resumeText - The text content extracted from the resume file
 * @returns {Promise<Object>} - Structured candidate data
 */
export const parseResumeWithAI = async (resumeText) => {
  if (!API_KEY) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert recruitment assistant. 
      Extract the following information from the resume text provided below. 
      Return ONLY a JSON object with these keys: 
      name, email, phone, location, experience (string like '5 Years'), skills (string like 'React, Node'), currentSalary (string like '15 LPA'), expectedSalary (string), noticePeriod.

      If a field is not found, use an empty string. 
      Be very accurate.

      Resume Text:
      ${resumeText.substring(0, 10000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("AI parse parsing failed:", text);
      return null;
    }
  } catch (error) {
    console.error("Gemini AI Parse Error:", error);
    return null;
  }
};

/**
 * Ranks existing candidates based on a job title/description
 * @param {Array} candidates - List of candidates from the bank
 * @param {string} jobTitle - The title of the job opening
 * @returns {Promise<Array>} - Ranked and scored candidates
 */
export const rankCandidatesWithAI = async (candidates, jobTitle) => {
  if (!API_KEY || !candidates.length) return [];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Simplify candidates for the prompt to save tokens
    const candidateData = candidates.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      skills: Array.isArray(c.skills) ? c.skills.join(",") : (c.skills || ""),
      experience: c.experience || "N/A"
    }));

    const prompt = `
      You are an expert talent scout. 
      Analyze the following candidates and identify the top 3 best matches for this specific Job Opening.
      
      JOB DESCRIPTION / CONTEXT:
      "${jobTitle}"

      CANDIDATES FROM BANK:
      ${JSON.stringify(candidateData)}

      TASK:
      1. Evaluate each candidate based on their role, skills, and experience against the JD.
      2. Assign a match score from 0 to 100.
      3. Provide a concise (5-8 words) professional reason for the match.
      
      Return ONLY a JSON array of objects with these keys: 
      id (from the input), score (number), reason (string).
      Sort the array by score in descending order.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonStr = text.substring(text.indexOf("["), text.lastIndexOf("]") + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("AI ranking parsing failed:", text);
      return [];
    }
  } catch (error) {
    console.error("Gemini AI Ranking Error:", error);
    return [];
  }
};

/**
 * Extracts clean keyword search terms from a natural language query for keyword-based search engine
 * @param {string} query - Natural language query
 * @returns {Promise<string>} - Clean keywords (e.g., "Java" or "React Developer")
 */
export const extractSearchKeywords = async (query) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a search query optimizer.
      Convert the following natural language recruitment query into a clean, concise, space-separated list of 1-3 keyword terms optimized for a standard file search engine.
      Do not include filler words like "find", "expert", "years", "experience", "resume", "cv", "with", "candidates".
      Only return the clean keyword(s) as plain text, no quotes or markdown.

      Examples:
      Query: "Find Java experts with 5+ years experience" -> Output: Java
      Query: "Look for Python Django backend developer" -> Output: Python Django
      Query: "Any candidates who know React and Node.js?" -> Output: React Node.js
      Query: "Deepanker agricultural engineer" -> Output: Deepanker Agricultural

      Query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || query;
  } catch (err) {
    console.error("Failed to extract search keywords:", err);
    return query;
  }
};
