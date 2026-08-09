export default function CreditsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "36px 22px 64px", color: "#493e30", fontFamily: "system-ui, sans-serif", lineHeight: 1.7 }}>
      <a href="/" style={{ color: "#a86d3d", textDecoration: "none" }}>← 返回学习卡片</a>
      <h1 style={{ marginBottom: 8 }}>2D 插画来源与许可</h1>
      <p style={{ marginTop: 0, color: "#746657" }}>动物、车辆和水果采用统一的彩色矢量插画及动画，让幼儿更容易辨认；场景、声音编排和交互效果由本站重新设计。</p>
      <ul style={{ paddingLeft: 22 }}>
        <li style={{ margin: "10px 0" }}>
          大部分插画来自 <a href="https://github.com/googlefonts/noto-emoji" target="_blank" rel="noreferrer" style={{ color: "#a35d2d" }}>Google Noto Emoji</a>，图像资源使用 Apache License 2.0。
        </li>
        <li style={{ margin: "10px 0" }}>
          动态卡片使用 <a href="https://googlefonts.github.io/noto-emoji-animation/" target="_blank" rel="noreferrer" style={{ color: "#a35d2d" }}>Google Animated Noto Emoji</a>，动画资源使用 <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noreferrer" style={{ color: "#a35d2d" }}>CC BY 4.0</a>。
        </li>
        <li style={{ margin: "10px 0" }}>
          挖掘机插画来自 <a href="https://commons.wikimedia.org/wiki/File:Backhoe.svg" target="_blank" rel="noreferrer" style={{ color: "#a35d2d" }}>Wikimedia Commons / Openclipart</a>，使用 CC0 1.0 公共领域贡献协议。
        </li>
      </ul>
      <p>许可文本已随插画资源一并保留。本站对插画仅做网页尺寸、布局及交互动画适配。</p>
    </main>
  );
}
