import Groq from 'groq-sdk';
import env from '../config/env.js';

// Initialise Groq client with API key from environment
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * Summarize the given text using Groq LLM.
 * Returns a concise, professional summary.
 * @param {string} text - The text to summarize.
 * @returns {Promise<string>} The summary string.
 */
export async function summarize(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid or missing text for summarization');
  }
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a professional assistant. Produce concise, impressive, and well-structured summaries suitable for business presentations. Use clear language and highlight key insights.',
      },
      {
        role: 'user',
        content: `Summarize the following text in a professional and impressive manner:\n\n${text}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1024,
  });
  return completion.choices[0].message.content.trim();
}
