import React, { useState } from 'react';
import { enhancePromptApi, generateImageApi } from '../services/api';

const STYLE_PRESETS = [
  'Photorealistic',
  'Digital illustration',
  '3D render',
  'Anime',
  'Watercolor',
];

export const TextToImage: React.FC = () => {
  const [rawPrompt, setRawPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [tone, setTone] = useState('');
  const [intent, setIntent] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [style, setStyle] = useState<string | undefined>();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { raw: string; enhanced: string; final: string; timestamp: string }[]
  >([]);

  const handleEnhance = async () => {
    if (!rawPrompt.trim()) {
      setError('Please enter a prompt first.');
      return;
    }
    setError(null);
    setIsEnhancing(true);
    try {
      const res = await enhancePromptApi(rawPrompt);
    setEnhancedPrompt(res.enhancedPrompt);
    setTone(res.tone);
    setIntent(res.intent);
    } catch (err) {
      console.error(err);
      setError('Failed to enhance prompt. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApprove = () => {
    if (!enhancedPrompt.trim()) return;
    setFinalPrompt(enhancedPrompt);
  };

  const handleGenerate = async () => {
    if (!finalPrompt.trim()) {
      setError('Please approve or edit the enhanced prompt before generating.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const res = await generateImageApi(finalPrompt, style);
      setImageBase64(res.imageBase64);
      const entry = {
        raw: rawPrompt,
        enhanced: enhancedPrompt,
        final: res.promptUsed,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = 'generated-image.png';
    link.click();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
          <h2 className="text-lg font-medium flex items-center justify-between">
            <span>1. Write your idea</span>
            <span className="text-xs text-slate-400">Step 1 of 3</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Start with a rough description. The AI will optimize it for image generation.
          </p>
          <textarea
            className="mt-3 h-32 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="Example: A cozy reading nook with a cat, next to a large window overlooking a futuristic city at sunset..."
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleEnhance}
              disabled={isEnhancing}
            >
              {isEnhancing ? 'Analyzing & Enhancing…' : 'Enhance for AI Image'}
            </button>
            <span className="text-[11px] text-slate-500">
              Uses GPT-4o-mini to detect tone, intent & optimize wording.
            </span>
          </div>
        </div>

        {enhancedPrompt && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                2. Review enhanced prompt
              </h2>
              <span className="text-xs text-slate-400">Approval required</span>
            </div>
            <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-3">
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Tone
                </div>
                <div className="mt-1 text-sm">{tone || '—'}</div>
              </div>
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Intent
                </div>
                <div className="mt-1 text-sm">{intent || '—'}</div>
              </div>
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Style preset (optional)
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setStyle((prev) => (prev === preset ? undefined : preset))
                      }
                      className={`rounded-full border px-2 py-1 text-[11px] ${
                        style === preset
                          ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              className="mt-2 h-32 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={enhancedPrompt}
              onChange={(e) => setEnhancedPrompt(e.target.value)}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 disabled:opacity-60"
                  onClick={handleApprove}
                  disabled={!enhancedPrompt.trim()}
                >
                  Approve prompt
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                No image will be generated until you approve this prompt.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Recent prompts</h3>
              <span className="text-[11px] text-slate-500">Last 5</span>
            </div>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs text-slate-300">
              {history.map((item) => (
                <li
                  key={item.timestamp}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-2"
                >
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>Approved</span>
                  </div>
                  <div className="line-clamp-2 text-slate-200">
                    {item.final}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium">3. Generate image</h2>
              <p className="mt-1 text-xs text-slate-400">
                Uses DALL·E (`gpt-image-1`) via the backend.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
              {finalPrompt ? 'Ready to generate' : 'Waiting for approval'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!finalPrompt.trim() || isGenerating}
            className="mb-3 inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? 'Generating image…' : 'Generate image'}
          </button>

          <div className="mt-2 flex-1 rounded-xl border border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-center p-3">
            {isGenerating && (
              <div className="flex flex-col items-center gap-2 text-sm text-slate-300">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
                <span>Creating your image…</span>
              </div>
            )}
            {!isGenerating && imageBase64 && (
              <div className="w-full space-y-3">
                <img
                  src={`data:image/png;base64,${imageBase64}`}
                  alt="Generated"
                  className="w-full rounded-xl border border-slate-800 object-cover"
                />
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Final prompt used
                  </div>
                  <p className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-[13px] leading-snug">
                    {finalPrompt}
                    {style ? (
                      <span className="ml-1 text-sky-300">
                        • Style: {style}
                      </span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="mt-2 inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[12px] text-slate-200 hover:border-sky-400 hover:text-white"
                  >
                    Download PNG
                  </button>
                </div>
              </div>
            )}
            {!isGenerating && !imageBase64 && (
              <p className="text-xs text-slate-500 text-center px-4">
                Approve the enhanced prompt and click{' '}
                <span className="font-medium text-slate-200">
                  Generate image
                </span>{' '}
                to see your result here.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};


