const credits = [
  ["小狗（柴犬）", "Quaternius", "https://poly.pizza/m/y4wdQpg767", "CC0 1.0"],
  ["小猫", "Quaternius", "https://poly.pizza/m/qKICY6xla2", "CC0 1.0"],
  ["小鸭", "Poly by Google", "https://poly.pizza/m/6HpauUCfIAb", "CC BY 3.0"],
  ["小牛", "Quaternius", "https://poly.pizza/m/5XSc2Fka3F", "CC0 1.0"],
  ["小羊", "Quaternius", "https://poly.pizza/m/C39AUXUUes", "CC0 1.0"],
  ["小鸟", "Quaternius", "https://poly.pizza/m/gYYC0gYMnw", "CC0 1.0"],
  ["大公鸡", "Quaternius", "https://poly.pizza/m/ineV9pU5VL", "CC0 1.0"],
  ["小猪", "Quaternius", "https://poly.pizza/m/TNvG3QUFlp", "CC0 1.0"],
  ["小马", "Quaternius", "https://poly.pizza/m/qvTrSG9pZF", "CC0 1.0"],
  ["小青蛙", "Quaternius", "https://poly.pizza/m/9Z2V8fpazF", "CC0 1.0"],
  ["大象", "Poly by Google", "https://poly.pizza/m/a27MA0rXyyj", "CC BY 3.0"],
  ["狮子", "Poly by Google", "https://poly.pizza/m/3XAJojWxSWz", "CC BY 3.0"],
  ["小汽车", "Quaternius", "https://poly.pizza/m/unqqkULtRU", "CC0 1.0"],
  ["公交车", "Kyle Li", "https://poly.pizza/m/2_1dZHNPJqJ", "CC BY 3.0"],
  ["消防车", "Ivan Klus", "https://poly.pizza/m/7iHJ519SwxG", "CC BY 3.0"],
  ["火车", "Poly by Google", "https://poly.pizza/m/7UGWg1k6Pwp", "CC BY 3.0"],
  ["挖掘机", "Jakob Robinson", "https://jayclock.itch.io/excavator-3d-model", "作者许可免费使用"],
  ["飞机", "Poly by Google", "https://poly.pizza/m/8ciDd9k8wha", "CC BY 3.0"],
  ["救护车", "Poly by Google", "https://poly.pizza/m/8NOFImgkI5N", "CC BY 3.0"],
  ["警车", "Quaternius", "https://poly.pizza/m/BwwnUrWGmV", "CC0 1.0"],
  ["摩托车", "AliceCassie", "https://poly.pizza/m/j20srJUjpB", "CC0 1.0"],
  ["自行车", "Poly by Google", "https://poly.pizza/m/19VoUuA2pcN", "CC BY 3.0"],
  ["轮船", "Quaternius", "https://poly.pizza/m/yq9EKmEmfC", "CC0 1.0"],
  ["直升机", "kazuma", "https://poly.pizza/m/EQJ2MECUbx", "CC0 1.0"],
  ["苹果、香蕉、橙子、西瓜、草莓、葡萄、梨、菠萝、樱桃、柠檬", "Kenney", "https://poly.pizza/u/Kenney", "CC0 1.0"],
  ["桃子、芒果", "jeremy", "https://poly.pizza/m/bvUNGzHch5q", "CC BY 3.0"],
  ["猕猴桃", "Poly by Google", "https://poly.pizza/m/56IwzJAdYDT", "CC BY 3.0"],
  ["蓝莓", "sirkitree", "https://poly.pizza/m/ecQMbKzX7Mo", "CC BY 3.0"],
];

export default function CreditsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "36px 22px 64px", color: "#493e30", fontFamily: "system-ui, sans-serif", lineHeight: 1.7 }}>
      <a href="/" style={{ color: "#a86d3d", textDecoration: "none" }}>← 返回学习卡片</a>
      <h1 style={{ marginBottom: 8 }}>3D 模型来源与许可</h1>
      <p style={{ marginTop: 0, color: "#746657" }}>感谢以下创作者开放这些模型。模型在网页中仅用于儿童认知教学，并做了尺寸、灯光和交互动画适配。</p>
      <ul style={{ paddingLeft: 22 }}>
        {credits.map(([name, creator, url, license]) => (
          <li key={`${name}-${creator}`} style={{ margin: "10px 0" }}>
            <strong>{name}</strong> — <a href={url} target="_blank" rel="noreferrer" style={{ color: "#a35d2d" }}>{creator}</a>（{license}）
          </li>
        ))}
      </ul>
      <p>模型经由 Poly Pizza 或创作者页面取得；各模型版权及许可仍归相应创作者与许可条款约定。</p>
    </main>
  );
}
