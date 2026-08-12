# Little Ears Learning Cards

[简体中文](README.md) | [English](README.en.md)

An interactive recognition-card app designed for toddlers around 18 to 24 months old. Children can tap a card to watch a 2D animation and hear a three-part lesson: the item's name, its real sound or defining fruit characteristic, and a gentle bite-sized fact. Cards can also be changed with a horizontal swipe.

[Try the live site](https://little-ears-learning-20260802.mobinkhan48927.chatgpt.site/)

![Little Ears Learning Cards preview](public/og-2d.png)

## Features

- 56 learning cards across animals, vehicles, and fruits
- Three-stage audio lessons: name, sound or characteristic, and a short fact
- Google Animated Noto Emoji assets combined with custom 2D scenes
- Tap-to-play lessons, swipe navigation, and previous/next controls
- Portrait-first mobile design with desktop and keyboard support
- Sound toggle, progress feedback, and large touch targets
- Reduced-motion fallback through `prefers-reduced-motion`

## How to Use

1. Choose Animals, Vehicles, or Fruits at the top of the page.
2. Tap the card to hear the complete three-stage lesson.
3. Swipe horizontally or use the arrow buttons to change cards.
4. Use the sound button in the top-right corner to mute or restore audio.

## Tech Stack

- Next.js 16, React 19, and TypeScript
- vinext, Vite, and a Cloudflare Workers-compatible build
- Tailwind CSS 4 plus custom CSS animation
- Lottie Web
- OpenAI Sites hosting configuration

## Local Development

Node.js `>=22.13.0` is required.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production preview server |
| `npm run lint` | Run ESLint |
| `npm test` | Build and run the project tests |

## Project Structure

```text
app/
├── page.tsx                    # Card data and primary interactions
├── AnimatedLearningScene.tsx  # 2D scenes and motion choreography
├── NotoLottieAnimation.tsx    # Lottie animation loader
├── globals.css                # Responsive layout and animation styles
└── credits/page.tsx           # Asset credits and licenses

public/
├── animations/noto/           # Animated Noto Emoji files
├── illustrations/             # 2D vector illustrations
└── audio/                     # Names, effects, and lesson narration
```

## Adding a Learning Card

1. Add the card data to the appropriate category in `app/page.tsx`.
2. Add the name, sound or characteristic, and lesson audio under `public/audio/`.
3. Add the illustration or Lottie asset under `public/illustrations/` or `public/animations/noto/`.
4. For a custom scene, add its mapping and motion in `app/AnimatedLearningScene.tsx` and `app/globals.css`.
5. Test the card on portrait mobile, desktop, and reduced-motion settings.

## Deployment

The repository includes `.openai/hosting.json` for OpenAI Sites. Its current vinext setup also produces a Cloudflare Workers-compatible build.

## Assets and Licenses

Most illustrations come from [Google Noto Emoji](https://github.com/googlefonts/noto-emoji), while animated assets come from [Google Animated Noto Emoji](https://googlefonts.github.io/noto-emoji-animation/). The excavator illustration comes from Wikimedia Commons / Openclipart. Third-party assets retain their respective Apache License 2.0, CC BY 4.0, or CC0 1.0 terms. See the in-app credits page and the license files under `public/illustrations/` for details.
