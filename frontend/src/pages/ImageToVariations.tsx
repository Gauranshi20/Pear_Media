import React, { useState } from 'react';
import { imageVariationsApi } from '../services/api';

type UploadState = 'idle' | 'analyzing' | 'done';

export const ImageToVariations: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    objects?: string[];
    theme?: string;
    style?: string;
    caption?: string;
  } | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setError(null);
    setFile(selected);
    setAnalysis(null);
    setVariations([]);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload an image first.');
      return;
    }
    setError(null);
    setUploadState('analyzing');
    try {
      const res = await imageVariationsApi(file);
      setAnalysis(res.analysis);
      setVariations(res.variations);
      setUploadState('done');
    } catch (err) {
      console.error(err);
      setError('Failed to analyze image or generate variations. Please try again.');
      setUploadState('idle');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setVariations([]);
    setUploadState('idle');
    setError(null);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">1. Upload an image</h2>
              <p className="mt-1 text-xs text-slate-400">
                The backend will analyze objects, theme, style, and caption.
              </p>
            </div>
            {file && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-300 hover:border-slate-500"
              >
                Clear
              </button>
            )}
          </div>

          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-8 text-center hover:border-sky-500">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-300">
              <span className="text-2xl">⬆️</span>
            </div>
            <p className="text-sm font-medium text-slate-50">
              Drag & drop or click to upload
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PNG, JPG, up to ~5MB. We only use it in-memory for this analysis.
            </p>
            {file && (
              <p className="mt-2 text-xs text-emerald-400">
                Selected: {file.name}
              </p>
            )}
          </label>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || uploadState === 'analyzing'}
            className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadState === 'analyzing'
              ? 'Analyzing & generating variations…'
              : 'Analyze image & create variations'}
          </button>

          {error && (
            <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {analysis && (
            <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 md:p-4 space-y-3 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">2. Image analysis</h3>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                  AI powered
                </span>
              </div>
              {analysis.caption && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Caption
                  </div>
                  <p className="mt-1 rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-[13px]">
                    {analysis.caption}
                  </p>
                </div>
              )}
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Theme
                  </div>
                  <p className="mt-1 text-[13px]">
                    {analysis.theme || 'Not detected'}
                  </p>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Style
                  </div>
                  <p className="mt-1 text-[13px]">
                    {analysis.style || 'Not detected'}
                  </p>
                </div>
              </div>
              {analysis.objects && analysis.objects.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Detected objects
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {analysis.objects.map((obj) => (
                      <span
                        key={obj}
                        className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium">
                3. Original vs variations
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Compare the uploaded image with at least two AI-generated variations.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
              {uploadState === 'analyzing'
                ? 'Analyzing…'
                : uploadState === 'done'
                ? 'Complete'
                : 'Waiting for upload'}
            </span>
          </div>

          <div className="mt-2 grid flex-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2 flex flex-col">
              <div className="mb-1 text-[11px] font-medium text-slate-400">
                Original
              </div>
              <div className="flex-1 rounded-lg border border-dashed border-slate-800 bg-slate-950/70 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Original upload"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="px-2 text-center text-[11px] text-slate-500">
                    Upload an image to see it here.
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2 flex flex-col">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Generated variations</span>
                <span>
                  {variations.length > 0
                    ? `${variations.length} images`
                    : 'None yet'}
                </span>
              </div>
              <div className="flex-1 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-center overflow-hidden">
                {uploadState === 'analyzing' && (
                  <div className="flex flex-col items-center gap-2 text-xs text-slate-300">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
                    <span>Analyzing image & generating variations…</span>
                  </div>
                )}
                {uploadState !== 'analyzing' && variations.length > 0 && (
                  <div className="flex w-full gap-2 overflow-x-auto p-1">
                    {variations.map((b64, idx) => (
                      <img
                        key={idx}
                        src={`data:image/png;base64,${b64}`}
                        alt={`Variation ${idx + 1}`}
                        className="h-40 w-full max-w-[220px] flex-none rounded-lg border border-slate-800 object-cover"
                      />
                    ))}
                  </div>
                )}
                {uploadState !== 'analyzing' && variations.length === 0 && (
                  <p className="px-2 text-center text-[11px] text-slate-500">
                    Once analyzed, at least two AI-generated variations will
                    appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


