# 小耳朵点点乐

[简体中文](README.md) | [English](README.en.md)

面向 1 岁半至 2 岁幼儿的互动认知学习卡。孩子可以点击卡片观看 2D 动画，依次听名称、声音或外形特征，以及柔和的小知识讲解；也可以左右滑动认识下一种事物。

[在线体验](https://little-ears-learning-20260802.mobinkhan48927.chatgpt.site/)

![小耳朵点点乐界面预览](public/og-2d.png)

## 主要功能

- 动物、车辆、水果、恐龙四个主题，共 65 张学习卡
- 名称、声音或特征、小知识三段式语音教学
- Google Animated Noto Emoji、原创恐龙插画与统一的 2D 场景效果
- 点击播放完整教学，左右滑动或使用按钮切换卡片
- 适配手机竖屏，同时支持桌面端与键盘方向键
- 独立声音开关、进度提示和清晰的大尺寸触控区域
- 支持 `prefers-reduced-motion`，为减少动态效果的系统偏好提供降级体验

## 使用方式

1. 在顶部选择“动物”“车辆”“水果”或“恐龙”。
2. 点击卡片，依次听名称、声音或特征、小知识。
3. 左右滑动卡片，或点击两侧按钮切换内容。
4. 使用右上角声音按钮随时静音或恢复声音。

## 技术栈

- Next.js 16、React 19、TypeScript
- vinext、Vite、Cloudflare Workers 兼容构建
- Tailwind CSS 4 与项目自定义 CSS 动画
- Lottie Web
- OpenAI Sites 托管配置

## 本地运行

环境要求：Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

开发服务启动后，根据终端提示打开本地地址。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务 |
| `npm run build` | 生成生产构建 |
| `npm run start` | 启动生产预览服务 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm test` | 构建并运行项目测试 |

## 项目结构

```text
app/
├── page.tsx                    # 学习卡数据与主要交互
├── AnimatedLearningScene.tsx  # 2D 场景和动画编排
├── NotoLottieAnimation.tsx    # Lottie 动画加载器
├── globals.css                # 响应式布局与动画样式
└── credits/page.tsx           # 素材来源与许可

public/
├── animations/noto/           # Animated Noto Emoji 动画
├── illustrations/             # 2D 矢量与恐龙插画
└── audio/                     # 名称、效果与知识讲解语音
```

## 增加学习卡

1. 在 `app/page.tsx` 对应分类中增加卡片数据。
2. 将名称语音、声音或特征语音、讲解语音放入 `public/audio/` 对应目录。
3. 将插画或 Lottie 动画放入 `public/illustrations/` 或 `public/animations/noto/`。
4. 如需专属场景动作，在 `app/AnimatedLearningScene.tsx` 和 `app/globals.css` 中补充映射与动画。
5. 在手机竖屏、桌面端和减少动态效果模式下完成测试。

## 部署

项目包含 `.openai/hosting.json`，可发布到 OpenAI Sites。生产构建也兼容项目当前的 vinext/Cloudflare Workers 配置。

## 素材与许可

大部分插画来自 [Google Noto Emoji](https://github.com/googlefonts/noto-emoji)，动态资源来自 [Google Animated Noto Emoji](https://googlefonts.github.io/noto-emoji-animation/)。挖掘机插画来自 Wikimedia Commons / Openclipart，恐龙插画由 OpenAI 图像生成工具为本项目制作。第三方素材遵循各自的 Apache License 2.0、CC BY 4.0 或 CC0 1.0 许可；详细信息与随附许可文本请查看应用内的“素材来源与许可”页面以及 `public/illustrations/`。
