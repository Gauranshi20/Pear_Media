import React, { useState } from 'react';
import { TextToImage } from './pages/TextToImage';
import { ImageToVariations } from './pages/ImageToVariations';

type TabKey = 'text' | 'image';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('text');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              AI Image Studio
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Enhance prompts, generate images, and explore variations in a single-page AI playground.
            </p>
          </div>
          <div className="flex gap-2 text-xs md:text-sm text-slate-400">
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
              Text → Enhanced Prompt → Image
            </span>
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
              Image → Analysis → Variations
            </span>
          </div>
        </header>

        <div className="mb-4 inline-flex rounded-full bg-slate-900/60 p-1 text-sm">
          <button
            className={`flex-1 rounded-full px-4 py-2 transition ${
              activeTab === 'text'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Text to Image
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-2 transition ${
              activeTab === 'image'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('image')}
          >
            Image to Variations
          </button>
        </div>

        <main className="mt-4">
          {activeTab === 'text' ? <TextToImage /> : <ImageToVariations />}
        </main>

        <footer className="mt-10 border-t border-slate-800 pt-4 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>Built for AI workflow experimentation.</span>
          <span className="text-slate-600">
            Backend-powered with OpenAI • Demo prototype
          </span>
        </footer>
      </div>
    </div>
  );
};


