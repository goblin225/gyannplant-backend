const Resume = require("../models/Resume");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateResume = async (req, res) => {
  const { prompt } = req.body;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Write a complete ATS-friendly resume for the following job seeker:\n\n${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const atsResumeText = aiResponse.choices[0]?.message?.content || "No response";

    const newResume = await Resume.create({ prompt, atsResumeText });

    res.status(200).json({ message: "Resume generated", resume: newResume });
  } catch (err) {
    console.error("Error generating resume:", err);
    res.status(500).json({ error: err.message });
  }
};