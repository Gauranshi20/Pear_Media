## AI Image Studio – Text & Image Workflows

### Project Overview

AI Image Studio is a single-page web application that lets you:

- **Text → Enhanced Prompt → Image Generation**: Enter a rough idea in natural language, let GPT-4o-mini analyze tone and intent and optimize the prompt, explicitly approve or edit it, then generate an image via DALL·E (`gpt-image-1`).
- **Image Upload → Image Analysis → Image Variations**: Upload an image, have GPT-4o-mini analyze it (objects, theme, style, caption), then generate at least two side-by-side variations with DALL·E based on that analysis.

The app is designed as a **demo-ready AI product prototype** with a clean, responsive UI and clear flows for both workflows.

---

### Features

- **Single-page React app** with tabbed navigation:
  - **Text to Image** tab
  - **Image to Variations** tab
- **Text → Image workflow (strict sequence)**:
  - User enters a **raw text prompt**
  - Backend calls **OpenAI GPT-4o-mini** to:
    - Detect **tone**
    - Detect **intent**
    - Improve clarity
    - Optimize for image generation
  - Enhanced prompt, tone, and intent are displayed
  - User can **edit** the enhanced prompt and must **explicitly approve** it
  - Only after approval, user can trigger **image generation** via **OpenAI Image (`gpt-image-1`)**
  - UI shows:
    - Final prompt used
    - Generated image
- **Image → Variations workflow (strict sequence)**:
  - User uploads an image (PNG/JPG)
  - Backend uses **GPT-4o-mini with vision** to analyze the image and extract:
    - Objects
    - Theme
    - Style
    - Caption / description
  - Analysis is displayed in UI
  - Backend then generates **at least 2 similar images** with **OpenAI Image (`gpt-image-1`)**
  - UI shows:
    - Original uploaded image
    - Generated variations side-by-side
- **Bonus features implemented**
  - **Image style selector** for text-based generation (e.g., Photorealistic, Digital illustration, 3D render, Anime, Watercolor)
  - **Download generated image** (PNG) for the Text → Image workflow
  - **Prompt history** (last 5 approved prompts)
- **UX niceties**
  - Clear step labels (Step 1 / 2 / 3)
  - Loading spinners and “Analyzing / Generating…” states
  - Error messaging for network/API issues and validation
  - Fully **mobile-responsive layout** using Tailwind CSS

---

### Tech Stack

- **Frontend**
  - React (Vite)
  - TypeScript
  - Tailwind CSS (v3)
  - Axios
- **Backend**
  - Node.js
  - Express
  - Multer (memory storage for image uploads)
  - dotenv
  - OpenAI Node SDK
  - CORS
- **Tooling & Build**
  - Vite
  - TypeScript
  - PostCSS + TailwindCSS

---

### Project Structure

Top-level:

- `frontend/` – Vite React SPA
- `backend/` – Node/Express API
- `README.md` – This documentation

Backend (`backend/`):

- `index.js` – Express app entry, middleware, and route mounting
- `routes/aiRoutes.js` – All AI-related routes
- `controllers/aiController.js` – Handlers for prompt enhancement, image generation, and image analysis + variations
- `package.json` – Backend dependencies and scripts

Frontend (`frontend/src/`):

- `App.tsx` – Main SPA shell (tabs, layout, routing between flows)
- `main.tsx` – Vite entry point
- `style.css` – Tailwind layers
- `pages/TextToImage.tsx` – Text → Enhanced Prompt → Image workflow UI/logic
- `pages/ImageToVariations.tsx` – Image Upload → Analysis → Variations workflow UI/logic
- `services/api.ts` – Axios client and typed helper functions for API calls

This matches the required structure:

- `/frontend`
  - `/src`
    - `/components` (can be added as needed)
    - `/pages`
    - `/services`
    - `App.jsx` (implemented as `App.tsx` with TypeScript)
- `/backend`
  - `index.js`
  - `/routes`
  - `/controllers`

---

### Backend API Design

All AI functionality is exposed under the `/api/ai` prefix.

- **POST `/api/ai/enhance-prompt`**
  - **Body**: `{ "prompt": string }`
  - **What it does**:
    - Calls `gpt-4o-mini` with a JSON-response system prompt to:
      - Detect **tone**
      - Detect **intent**
      - Rewrite the prompt to be **clear and optimized** for image generation
    - Returns parsed JSON
  - **Response**:
    - `{ tone: string, intent: string, enhancedPrompt: string }`

- **POST `/api/ai/generate-image`**
  - **Body**: `{ "prompt": string, "style"?: string }`
  - **What it does**:
    - Optionally appends a style description
    - Calls OpenAI Image API:
      - `model: "gpt-image-1"`
      - `n: 1`
      - `size: "1024x1024"`
    - Returns the **base64 JSON** image and the final prompt used
  - **Response**:
    - `{ promptUsed: string, imageBase64: string }`

- **POST `/api/ai/image-variations`**
  - **Form-data** (multipart):
    - `image`: uploaded file
  - **What it does**:
    1. Uses **Multer** with in-memory storage to access the uploaded file as a `Buffer`.
    2. Encodes image to base64 and wraps it as a `data:image/...;base64,...` URL.
    3. Calls `gpt-4o-mini` vision with a system prompt asking for JSON summary:
       - `objects: string[]`
       - `theme: string`
       - `style: string`
       - `caption: string`
    4. Uses this analysis to build a text prompt and calls **OpenAI Image**:
       - `model: "gpt-image-1"`
       - `n: 2`
       - `size: "512x512"`
    5. Returns the analysis, the original image (base64) and both variations.
  - **Response**:
    - ```json
      {
        "analysis": {
          "objects": string[],
          "theme": string,
          "style": string,
          "caption": string
        },
        "variations": string[],           // base64 images
        "originalImageBase64": string,
        "promptForVariations": string
      }
      ```

All backend errors are logged to the console and returned as JSON with HTTP 4xx/5xx codes.

---

### Frontend Workflow Details

#### Text → Enhanced Prompt → Image

1. **Write idea** (`TextToImage.tsx`)
   - User types a raw prompt in a textarea.
   - On “Enhance for AI Image”:
     - Frontend calls `enhancePromptApi(prompt)` (POST `/enhance-prompt`).

2. **Review enhanced prompt**
   - UI shows:
     - **Tone** and **Intent**
     - Editable **enhanced prompt** textarea
     - **Style selector** badges (e.g., Photorealistic, Anime…)
   - User can:
     - Edit the enhanced prompt text
     - Optionally choose a style preset
   - User must click **“Approve prompt”** before image generation.

3. **Generate image**
   - After approval, the **Generate image** button is enabled.
   - On click:
     - Frontend calls `generateImageApi(finalPrompt, style)`.
     - UI shows loading state while waiting.
   - On success:
     - Displays generated image
     - Displays final prompt used and chosen style
     - Allows **Download PNG** of generated image
     - Stores a compact **prompt history** (last 5) showing final prompts.

This strictly enforces: **no image generation occurs before approval**.

#### Image Upload → Image Analysis → Variations

1. **Upload image** (`ImageToVariations.tsx`)
   - User drags/drops or clicks to select an image.
   - Preview of the original appears in the “Original” column.

2. **Analyze & generate variations**
   - Clicking **“Analyze image & create variations”**:
     - Sends multipart form-data with the file to `/image-variations` via `imageVariationsApi(file)`.
     - UI shows an **Analyzing…** loading indicator.

3. **Display analysis**
   - Once the backend returns, UI shows:
     - Caption
     - Theme
     - Style
     - Detected objects (as chips)

4. **Display variations**
   - At least **two generated images** are shown side-by-side (horizontally scrollable on small screens).
   - Original and variations are aligned in a responsive grid for quick visual comparison.

---

### Environment Variables

Create a `.env` file in the **backend** folder (`backend/.env`) with:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

For the **frontend**, create `frontend/.env` (or `.env.local` for Vercel/Netlify) with:

```env
VITE_BACKEND_URL=https://your-backend-host-url
```

**Important**:

- **Do NOT commit** real API keys to GitHub.
- The code always reads keys from `process.env` (backend) and `import.meta.env` (frontend).

---

### Setup Instructions (Local Development)

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-image-studio.git
cd ai-image-studio
```

#### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

Run backend locally:

```bash
npm run dev
```

This starts Express on `http://localhost:5000`.

#### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Run dev server:

```bash
npm run dev
```

Visit the app at the URL printed by Vite (typically `http://localhost:5173`). Both workflows should now function end-to-end using your OpenAI key.

---

### Hosting & Deployment

#### Backend (Vercel Serverless or Render)

You can deploy the backend either as:

- **Vercel serverless functions** (convert routes into an API handler), or
- A standard Node service on **Render**.

**Render (Node service) example:**

1. Push this repository to a **public GitHub repo**.
2. On Render:
   - Create new **Web Service** → "Connect from GitHub".
   - Select the repo and `backend` as the root (or specify build/start commands):
     - **Build command**: `npm install`
     - **Start command**: `node index.js`
   - Set **Environment Variables**:
     - `OPENAI_API_KEY=...`
     - `PORT=10000` (or let Render manage; Express uses `process.env.PORT`)
3. Deploy and note the service URL, e.g. `https://your-backend.onrender.com`.

#### Frontend (Vercel or Netlify)

**Vercel example:**

1. From the same GitHub repo, import project in Vercel.
2. Choose `frontend` as the root directory.
3. Configure:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Environment variable:
   - `VITE_BACKEND_URL=https://your-backend.onrender.com`
5. Deploy – Vercel gives you a public URL (e.g. `https://ai-image-studio.vercel.app`).

**Netlify example:**

1. New Site from Git → connect the repo.
2. Base directory: `frontend/`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variable:
   - `VITE_BACKEND_URL=https://your-backend.onrender.com`
6. Deploy and use the generated Netlify URL.

---

### API Integrations Summary

- **Text / NLP**
  - OpenAI **GPT-4o** via Chat Completions API
  - Used for:
    - Tone detection
    - Intent detection
    - Prompt rewriting & optimization for image generation
    - Vision-based image analysis (objects, style, theme, caption)

- **Image**
  - OpenAI **Image Generation** (`gpt-image-1`)
  - Used for:
    - Text → Image generation
    - Image → Variations generation (based on analysis prompt)

All calls are **real API calls**, no mocks.

---

### Screenshots (Placeholders)

Add screenshots of the deployed app here:

- `screenshots/text-to-image.png` – Text to Image tab after generating an image.
- `screenshots/image-variations.png` – Image to Variations tab with original and variations.

You can store these in a `/screenshots` folder and reference them:

- **Text to Image screen** – ![Text to Image](screenshots/text-to-image.png)
- **Image Variations screen** – ![Image Variations](screenshots/image-variations.png)

---

### Hosting Links (to be filled in)

After deployment, update this section with actual URLs:

- **Live frontend**: `https://your-frontend-host-url`
- **Live backend base URL**: `https://your-backend-host-url`
- **Public GitHub repository**: `https://github.com/your-username/ai-image-studio`

---



### Notes & Limitations

- OpenAI requests may fail or rate limit on free/trial accounts; errors are surfaced in the UI with friendly messages.
- Image generation and analysis quality depends on the model and your API tier.
- Uploaded images are only processed in-memory by the backend and not persisted.

This project is ready to be pushed to a **public GitHub repository**, wired to Vercel/Netlify + Render/Vercel Serverless, and demonstrated as a compact AI product prototype.


