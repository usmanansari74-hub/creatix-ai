import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Key, 
  Upload, 
  Code, 
  Eye, 
  Copy, 
  Download, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Terminal, 
  Palette, 
  Grid, 
  FileCode, 
  Laptop, 
  Smartphone, 
  Tablet, 
  RotateCcw,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

const SYSTEM_PROMPT = `You are Creatix AI, a premier Senior UI/UX Designer and Frontend Engineer.
Your ONLY role is to generate beautiful, production-ready, modern frontend code, website layouts, custom Tailwind components, and designs based on user requirements.

IMPORTANT COMPLIANCE FILTER:
If the user's prompt asks for anything unrelated to UI/UX design, frontend code, wireframes, HTML/React component building, landing pages, or digital layout styling (e.g., general knowledge, math, history, coding theory, algorithmic advice, personal chat, politics), you MUST immediately refuse with the EXACT phrase:
"I am Creatix AI. I can only help generate, modify, and improve website UI/UX designs and frontend code."
Do not provide any other answer or commentary if the compliance filter is triggered.

If the prompt IS UI/UX related, generate a single premium self-contained website template inside an HTML structure. 
Return your response in structured JSON format with this exact shape:
{
  "reasoning": "Explain your premium design choices, colors selected, fonts, visual hierarchy, and animations used.",
  "components": ["List of sections generated (e.g., Hero, Navbar, Interactive Pricing, Footer)"],
  "palette": ["HEX codes used in design"],
  "code": "A single comprehensive HTML code string containing complete embedded Tailwind CSS (via CDN), Google Fonts (e.g. Plus Jakarta Sans or Inter), custom styles inside <style>, and rich modern interactivity using standard JS. Ensure beautiful gradients, glassmorphism, fully responsive sections, and rich mock interactive content with modern icons (Lucide or FontAwesome)."
}`;

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(null); 
  const [prompt, setPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); 
  const [viewportSize, setViewportSize] = useState('desktop'); 
  const [generationOutput, setGenerationOutput] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedKey = sessionStorage.getItem('creatix_gemini_key');
    if (savedKey) {
      setApiKey(savedKey);
      validateApiKeyOnLoad(savedKey);
    }
  }, []);

  const validateApiKeyOnLoad = async (key) => {
    setIsKeyValid('checking');
    try {
      const isValid = await testGeminiKey(key);
      if (isValid) {
        setIsKeyValid('valid');
      } else {
        setIsKeyValid('invalid');
      }
    } catch (e) {
      setIsKeyValid('invalid');
    }
  };

  const testGeminiKey = async (keyToTest) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Respond only with 'OK'." }] }]
          })
        }
      );
      if (!response.ok) return false;
      const data = await response.json();
      return !!data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) {
      return false;
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setIsKeyValid('invalid');
      return;
    }
    setIsKeyValid('checking');
    const result = await testGeminiKey(apiKey);
    if (result) {
      setIsKeyValid('valid');
      sessionStorage.setItem('creatix_gemini_key', apiKey);
    } else {
      setIsKeyValid('invalid');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      const isText = file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md');
      
      reader.onload = () => {
        const fileObj = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          dataUrl: reader.result,
          isImage: isImage,
          isText: isText,
          textContents: isText ? reader.result : null
        };
        setUploadedFiles(prev => [...prev, fileObj]);
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerate = async () => {
    setErrorMessage(null);
    const lowerPrompt = prompt.toLowerCase();
    const offTopicKeywords = [
      'history of', 'who was', 'solve math', 'calculate', 'physics', 'religion', 
      'politics', 'personal advice', 'who created', 'tell me a joke about', 'tell me a story about'
    ];
    
    const isOffTopic = offTopicKeywords.some(keyword => lowerPrompt.includes(keyword)) && 
                        !lowerPrompt.includes('website') && 
                        !lowerPrompt.includes('ui') && 
                        !lowerPrompt.includes('ux');

    if (isOffTopic) {
      setGenerationOutput({
        reasoning: "Compliance refusal triggered.",
        components: [],
        palette: [],
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>System Message</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-6 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-950/20">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 mb-6">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
    </div>
    <h3 class="text-xl font-bold text-white mb-2">Creatix AI System Guard</h3>
    <p class="text-slate-400 text-sm leading-relaxed mb-6">
      I am Creatix AI. I can only help generate, modify, and improve website UI/UX designs and frontend code.
    </p>
    <div class="bg-slate-950/50 rounded-lg p-3 text-xs text-red-400 font-mono border border-red-500/10">
      Reason: Off-topic system prompt input detected
    </div>
  </div>
</body>
</html>`
      });
      setActiveTab('preview');
      return;
    }

    if (!prompt.trim()) {
      setErrorMessage("Please enter a design prompt.");
      return;
    }

    if (!apiKey.trim() || isKeyValid !== 'valid') {
      setErrorMessage("A valid Gemini API key is required to use the generator. Please insert and validate your key in the Left Sidebar.");
      return;
    }

    setIsGenerating(true);

    try {
      let fileContext = "";
      const imagesPayload = [];

      if (uploadedFiles.length > 0) {
        fileContext += "\nThe user has attached reference materials:\n";
        uploadedFiles.forEach(f => {
          if (f.isText) {
            fileContext += `[Attached Text File: ${f.name} Content: "${f.textContents}"]\n`;
          } else if (f.isImage) {
            fileContext += `[Attached Image Reference: ${f.name} (Base64 data attached inline)]\n`;
            const base64Data = f.dataUrl.split(',')[1];
            imagesPayload.push({
              inlineData: {
                mimeType: f.type,
                data: base64Data
              }
            });
          }
        });
      }

      const fullUserPrompt = `User Request: "${prompt}"\n${fileContext}\n\nGenerate beautiful website/component UI matching this request. Implement high quality custom styles and elegant features.`;

      const parts = [
        { text: fullUserPrompt }
      ];

      imagesPayload.forEach(img => {
        parts.push(img);
      });

      const callGemini = async (retries = 5, delay = 1000) => {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  { role: 'user', parts: parts }
                ],
                systemInstruction: {
                  parts: [{ text: SYSTEM_PROMPT }]
                },
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: "OBJECT",
                    properties: {
                      reasoning: { type: "STRING" },
                      components: { type: "ARRAY", items: { type: "STRING" } },
                      palette: { type: "ARRAY", items: { type: "STRING" } },
                      code: { type: "STRING" }
                    },
                    required: ["reasoning", "components", "palette", "code"]
                  }
                }
              })
            }
          );

          if (!res.ok) {
            if (retries > 0) {
              await new Promise(r => setTimeout(r, delay));
              return callGemini(retries - 1, delay * 2);
            }
            throw new Error(`API Error: ${res.statusText}`);
          }

          const data = await res.json();
          return data;
        } catch (err) {
          if (retries > 0) {
            await new Promise(r => setTimeout(r, delay));
            return callGemini(retries - 1, delay * 2);
          }
          throw err;
        }
      };

      const result = await callGemini();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error("Could not parse output response from Gemini. Please verify your prompt format.");
      }

      const parsedData = JSON.parse(rawText);

      if (parsedData.code && parsedData.code.includes("I am Creatix AI. I can only help generate")) {
        setGenerationOutput({
          reasoning: "Compliance filter triggered.",
          components: [],
          palette: [],
          code: parsedData.code
        });
      } else {
        setGenerationOutput(parsedData);
      }
      
      setActiveTab('preview');

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred while communicating with Gemini. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generationOutput?.code) return;
    const textarea = document.createElement('textarea');
    textarea.value = generationOutput.code;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textarea);
  };

  const downloadZip = () => {
    if (!generationOutput?.code) return;

    const customComponentStructure = `
/creatix-project
  ├── index.html            (Direct entrypoint containing fully built UI & Tailwind styles)
  ├── package.json          (Self-contained dependency configurations)
  ├── tailwind.config.js    (Tailwind CSS config presets mapping specified colors)
  ├── README.md             (Premium startup guides, components catalog, design system reasoning)
  ├── /src
       ├── components.js    (Parsed component sub-blocks with interactive code scripts)
       └── styles.css       (Specialized styles and keyframe layouts)
    `;

    const readmeContent = `# Created with Creatix AI

## Project Specifications
- **Design Philosophy:** Modern premium high-fidelity glassmorphism responsive layouts.
- **Tailwind Palette:** ${JSON.stringify(generationOutput.palette || [])}
- **Components Included:** ${JSON.stringify(generationOutput.components || [])}

## Setup Guide
1. Launch direct browser sandbox on \`index.html\`.
2. To use within standard build setups:
   - Paste the main HTML content into your custom layout.
   - Install tailwindcss packages configuration inside root folders.

---
Generated reasoning:
${generationOutput.reasoning}
`;

    const aggregatedCode = `/* === CREATIX AI EXPORT SYSTEM ARCHITECTURE ===
${customComponentStructure}
=================================================== */

// --- README.md ---
${readmeContent}

// --- index.html ---
${generationOutput.code}
`;

    const blob = new Blob([aggregatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creatix-ai-design-export.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Creatix AI
              </span>
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pro Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Premium AI UI/UX Design & Frontend Generator</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-[11px] text-slate-400">
              Model: <span className="text-indigo-400 font-mono">gemini-2.5-flash-preview-09-2025</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-[380px] border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-5 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                Gemini API Key Guard
              </span>
              {isKeyValid === 'valid' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shadow-sm shadow-emerald-500/5">
                  <CheckCircle className="w-3 h-3 mr-1" /> API Connected
                </span>
              )}
              {isKeyValid === 'invalid' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-400/10 text-rose-400 border border-rose-400/20 shadow-sm shadow-rose-500/5">
                  <XCircle className="w-3 h-3 mr-1" /> Invalid API Key
                </span>
              )}
              {isKeyValid === 'checking' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 animate-pulse">
                  Verifying...
                </span>
              )}
              {isKeyValid === null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Not Configured
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Required to communicate with Gemini. Your credentials remain safe and secure, stored locally in memory only.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 font-mono"
                />
              </div>
              <button
                onClick={handleValidateKey}
                disabled={isKeyValid === 'checking'}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-medium py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 border border-slate-750 hover:border-slate-700 active:scale-[0.98] disabled:opacity-50"
              >
                <span>Validate API Key</span>
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                UI Prompt Textarea
              </label>
              <textarea
                placeholder="Describe your design vision in depth... (e.g. 'Build a modern luxury real estate platform with black aesthetic, interactive search filtration, animated premium card grid')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 leading-relaxed resize-none"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                File Upload Area (Reference Assets)
              </span>
              <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 bg-slate-950/20 hover:bg-slate-950/40 text-center transition-all group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*,text/*,.json,.md"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                <span className="block text-[11px] font-medium text-slate-300 mb-0.5">
                  Click to choose or drop files
                </span>
                <span className="block text-[9px] text-slate-500">
                  PNG, JPG, SVG, WEBP, TXT (Max 5MB)
                </span>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Attached Assets ({uploadedFiles.length})
                    </span>
                    <button 
                      onClick={() => setUploadedFiles([])}
                      className="text-[9px] text-rose-400 hover:underline flex items-center"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1.5">
                    {uploadedFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {file.isImage ? (
                            <img 
                              src={file.dataUrl} 
                              alt="thumb" 
                              className="w-6 h-6 rounded object-cover border border-slate-800 bg-slate-900" 
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-indigo-400" />
                          )}
                          <div className="truncate text-left">
                            <p className="text-[11px] font-medium text-slate-300 truncate">{file.name}</p>
                            <p className="text-[9px] text-slate-500">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-400 leading-relaxed flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isKeyValid !== 'valid'}
                className={`w-full relative group overflow-hidden py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-[0.99] flex items-center justify-center space-x-2 ${
                  isKeyValid === 'valid'
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 text-white shadow-indigo-500/10'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Generating Premium UI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Design</span>
                  </>
                )}
              </button>
              {isKeyValid !== 'valid' && (
                <p className="text-[10px] text-amber-500 text-center mt-2 font-medium">
                  * Verify your Gemini API key above to enable generation
                </p>
              )}
            </div>

          </div>
        </aside>

        <section className="flex-1 bg-slate-950 flex flex-col min-h-0">
          <div className="border-b border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Tab</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'code' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code Tab</span>
              </button>
              <button
                onClick={() => setActiveTab('reasoning')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'reasoning' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Design System & Architecture</span>
              </button>
            </div>

            {generationOutput && (
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {activeTab === 'preview' && (
                  <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg">
                    <button
                      onClick={() => setViewportSize('desktop')}
                      title="Desktop View"
                      className={`p-1.5 rounded ${viewportSize === 'desktop' ? 'bg-slate-850 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewportSize('tablet')}
                      title="Tablet View"
                      className={`p-1.5 rounded ${viewportSize === 'tablet' ? 'bg-slate-850 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewportSize('mobile')}
                      title="Mobile View"
                      className={`p-1.5 rounded ${viewportSize === 'mobile' ? 'bg-slate-850 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-800 active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={downloadZip}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow shadow-indigo-600/10 active:scale-95"
                    title="Downloads high fidelity responsive components layout zip blueprint"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-950">
            {isGenerating && (
              <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-indigo-400 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Creatix UI Generation Pipeline active</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  Synthesizing prompt, reference documents, and mapping high-end styling systems to live components inside isolation.
                </p>
                <div className="mt-8 flex items-center space-x-3 text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="font-mono">Compiling layouts, CSS gradients, & interactive JS ...</span>
                </div>
              </div>
            )}

            {!generationOutput && !isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl shadow-slate-950/50">
                  <Terminal className="w-9 h-9 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Generate a design to see live preview.</h3>
                <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-6">
                  Configure your secure Gemini API key, input a custom UI layout prompt, attach brand reference guidelines or logos, and tap <span className="text-white font-medium">'Generate Design'</span>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md w-full text-left text-[11px] text-slate-500 border border-slate-850 bg-slate-900/10 p-4 rounded-xl">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500/80 shrink-0 mt-0.5" />
                    <span>Real-time adaptive viewport simulation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500/80 shrink-0 mt-0.5" />
                    <span>Full HTML layout, custom scripts, & animations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500/80 shrink-0 mt-0.5" />
                    <span>Visual layout reasoning & custom palette breakdown</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500/80 shrink-0 mt-0.5" />
                    <span>Direct source-code copy and offline bundle export</span>
                  </div>
                </div>
              </div>
            )}

            {generationOutput && !isGenerating && (
              <div className="flex-1 flex flex-col min-h-0">
                {activeTab === 'preview' && (
                  <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
                    <div 
                      className={`h-full transition-all duration-300 rounded-2xl border border-slate-800 shadow-2xl bg-slate-950 flex flex-col ${
                        viewportSize === 'desktop' ? 'w-full' : 
                        viewportSize === 'tablet' ? 'w-[768px]' : 
                        'w-[375px]'
                      }`}
                    >
                      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
                        </div>
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                          {viewportSize === 'desktop' ? '100% Desktop View' : 
                           viewportSize === 'tablet' ? '768px - Tablet Simulation' : 
                           '375px - Mobile Simulation'}
                        </span>
                        <div className="w-12 text-right">
                          <button 
                            title="Reset Sandbox Sandbox"
                            onClick={() => {
                              const iframe = document.getElementById('sandbox-iframe');
                              if (iframe) iframe.src = iframe.src;
                            }}
                            className="hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 inline" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 bg-white relative rounded-b-2xl overflow-hidden">
                        <iframe
                          id="sandbox-iframe"
                          title="Creatix AI Sandbox Viewport"
                          sandbox="allow-scripts allow-modals"
                          srcDoc={generationOutput.code}
                          className="w-full h-full border-none bg-slate-950"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4">
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center space-x-2 font-mono">
                          <FileCode className="w-4 h-4 text-indigo-400" />
                          <span>index.html (Tailwind CSS Embedded Code Bundle)</span>
                        </span>
                        <button
                          onClick={copyToClipboard}
                          className="hover:text-white flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text bg-slate-950">
                        <code>{generationOutput.code}</code>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reasoning' && (
                  <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-400" />
                        AI Extracted Theme & CSS Design Tokens
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {generationOutput.palette?.map((hex, index) => (
                          <div 
                            key={index} 
                            className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center space-x-3"
                          >
                            <div 
                              className="w-10 h-10 rounded-lg shadow-inner shrink-0 border border-white/10" 
                              style={{ backgroundColor: hex }}
                            />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase">Token {index + 1}</p>
                              <p className="text-xs font-mono font-bold text-white uppercase">{hex}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Grid className="w-4 h-4 text-indigo-400" />
                        Custom Generated Section Assets Structure
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {generationOutput.components?.map((component, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850"
                          >
                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-semibold">
                              {idx + 1}
                            </div>
                            <span className="text-xs font-medium text-slate-200">{component}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-emerald-400" />
                        Design Reasoning & UX Rationale
                      </h4>
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 text-slate-300 text-xs leading-relaxed space-y-3">
                        {generationOutput.reasoning.split('\n\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="border-t border-slate-800 bg-slate-900/30 py-4 px-6 flex items-center justify-center text-[11px] text-slate-500">
            <div>
              &copy; 2026 Creatix AI Technologies. Fully Sandboxed Workspace.
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
