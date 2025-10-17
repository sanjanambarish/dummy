import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "" 
});

export interface Medicine {
  name: string;
  genericName?: string;
  dosage: string;
  strength: string;
  frequency: string;
  timing: string;
  duration?: string;
  instructions: string;
  beforeAfterFood?: string;
  purpose?: string;
}

export interface PrescriptionData {
  doctorName?: string;
  clinicName?: string;
  patientName?: string;
  date?: string;
  diagnosis?: string;
  medicines: Medicine[];
  labTests?: string[];
  followUpDate?: string;
  specialInstructions?: string[];
}

export interface PrescriptionAnalysis {
  extractedText: string;
  simplifiedExplanation: string;
  structuredData: PrescriptionData;
}

export async function analyzePrescriptionImage(imageBase64: string): Promise<PrescriptionAnalysis> {
  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    const detailedExtractionPrompt = `You are an expert medical document analyzer. Carefully analyze this prescription or medical report image.

Extract ALL information you can see, including:
- Doctor's name, clinic/hospital name
- Patient name and date
- Diagnosis or reason for visit
- ALL medications with complete details
- Lab tests or investigations recommended
- Follow-up appointment date
- Any special instructions or warnings
- Handwritten notes or additional comments

Be thorough and precise. Read carefully, including any handwritten text.`;

    const extractionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
        detailedExtractionPrompt,
      ],
    });

    const extractedText = extractionResponse.text || "Could not extract text from image";

    const structuredExtractionPrompt = `Analyze this medical prescription/report and extract structured information.

Text from prescription:
${extractedText}

Extract and return a JSON object with this exact structure:
{
  "doctorName": "Doctor's full name or null",
  "clinicName": "Clinic/Hospital name or null", 
  "patientName": "Patient name or null",
  "date": "Prescription date or null",
  "diagnosis": "Diagnosis/condition or null",
  "medicines": [
    {
      "name": "Brand/Trade name of medicine",
      "genericName": "Generic/Chemical name if visible",
      "dosage": "e.g., 1 tablet, 2 capsules, 5ml",
      "strength": "e.g., 500mg, 10mg/5ml",
      "frequency": "e.g., twice daily, three times a day, once at night",
      "timing": "e.g., morning-evening, 8AM-2PM-8PM, bedtime",
      "duration": "e.g., 7 days, 1 month, as needed",
      "instructions": "Any specific instructions",
      "beforeAfterFood": "before food/after food/with food/empty stomach or null",
      "purpose": "What the medicine is for (if you can infer from context)"
    }
  ],
  "labTests": ["List of lab tests recommended"] or null,
  "followUpDate": "Follow-up date or null",
  "specialInstructions": ["Any special instructions or warnings"] or null
}

Be precise. If a field is not visible in the prescription, use null. For medicines, extract every detail you can see.`;

    const structuredResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            doctorName: { type: ["string", "null"] },
            clinicName: { type: ["string", "null"] },
            patientName: { type: ["string", "null"] },
            date: { type: ["string", "null"] },
            diagnosis: { type: ["string", "null"] },
            medicines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  genericName: { type: ["string", "null"] },
                  dosage: { type: "string" },
                  strength: { type: "string" },
                  frequency: { type: "string" },
                  timing: { type: "string" },
                  duration: { type: ["string", "null"] },
                  instructions: { type: "string" },
                  beforeAfterFood: { type: ["string", "null"] },
                  purpose: { type: ["string", "null"] },
                },
                required: ["name", "dosage", "strength", "frequency", "timing", "instructions"],
              },
            },
            labTests: { type: ["array", "null"], items: { type: "string" } },
            followUpDate: { type: ["string", "null"] },
            specialInstructions: { type: ["array", "null"], items: { type: "string" } },
          },
          required: ["medicines"],
        },
      },
      contents: structuredExtractionPrompt,
    });

    let structuredData: PrescriptionData = { medicines: [] };
    try {
      const jsonText = structuredResponse.text;
      if (jsonText) {
        structuredData = JSON.parse(jsonText);
      }
    } catch (e) {
      console.error("Failed to parse structured data:", e);
    }

    const simplificationPrompt = `You are a caring medical assistant helping a patient understand their prescription.

Prescription details:
${extractedText}

Create a warm, friendly, and easy-to-understand explanation that:

1. Starts with a brief header:
   ${structuredData.doctorName ? `- Doctor: Dr. ${structuredData.doctorName}` : ''}
   ${structuredData.clinicName ? `- Clinic: ${structuredData.clinicName}` : ''}
   ${structuredData.diagnosis ? `- Condition: ${structuredData.diagnosis} (explained in simple terms)` : ''}
   ${structuredData.date ? `- Date: ${structuredData.date}` : ''}

2. For each medicine, provide:
   💊 [Medicine Name] ${structuredData.medicines.length > 0 && structuredData.medicines[0].purpose ? '(What it does in simple language)' : ''}
   
   📋 How to take:
   • Amount: [dosage and strength in simple terms]
   • When: [frequency and timing made clear, e.g., "2 times a day: once in morning, once at night"]
   • Food: [before/after/with food instructions]
   • Duration: [how long to take it]
   
   ⚠️ Important: [any warnings, side effects to watch for, or special instructions]
   
   💡 Tips: [helpful tips like "Set phone reminders", "Keep with breakfast items", etc.]

3. Lab Tests (if any):
   🔬 Tests recommended: [List tests]
   📌 Why: [Brief explanation of why these tests are needed]

4. Follow-up:
   📅 Next visit: [Date and any preparation needed]

5. General reminders:
   ✅ Complete the full course even if you feel better
   ✅ Set daily reminders for medicine times
   ✅ Store medicines properly (cool, dry place)
   ${structuredData.specialInstructions ? '✅ Special notes: ' + structuredData.specialInstructions.join(', ') : ''}

Use simple language, avoid medical jargon. If you must use a medical term, explain it in parentheses.
Be supportive and encouraging. Make it feel like a helpful friend is explaining this.`;

    const simplificationResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: simplificationPrompt,
    });

    const simplifiedText = simplificationResponse.text || "Could not create simplified explanation";

    return {
      extractedText,
      simplifiedExplanation: simplifiedText,
      structuredData,
    };

  } catch (error) {
    console.error("Error analyzing prescription:", error);
    throw new Error(`Failed to analyze prescription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
