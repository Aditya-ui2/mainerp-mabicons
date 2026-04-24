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
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare data for Gemini (keep it light to save tokens)
    const context = resumes.map(r => ({
      id: r.id,
      name: r.candidateName || r.fileName,
      role: r.roleType,
      skills: r.skills || [] // Assuming skills are part of the object
    }));

    const prompt = `
      You are an expert recruitment assistant. 
      Given the following list of candidates from a resume bank and a search query, 
      identify the best matching candidates.
      
      CRITICAL: Return ONLY a JSON array of matching IDs. No text, no explanation.
      Format: ["id1", "id2", ...]

      Candidate List:
      ${JSON.stringify(context)}

      User Query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from response
    try {
      // Find the first [ and last ] to extract JSON if Gemini adds text
      const jsonStr = text.substring(text.indexOf("["), text.lastIndexOf("]") + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("AI response parsing failed:", text);
      return [];
    }
  } catch (error) {
    console.error("Gemini AI Search Error:", error);
    throw error;
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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
