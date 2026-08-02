"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type CategoryKey = "animals" | "vehicles";

type CardItem = {
  name: string;
  pinyin: string;
  emoji: string;
  sound: string;
  prompt: string;
  color: string;
  accent: string;
};

const categories: Record<CategoryKey, { label: string; icon: string; items: CardItem[] }> = {
  animals: {
    label: "动物",
    icon: "🐾",
    items: [
      { name: "小狗", pinyin: "xiǎo gǒu", emoji: "🐶", sound: "汪汪！", prompt: "小狗怎么叫？", color: "#FFF0BA", accent: "#ED8B3A" },
      { name: "小猫", pinyin: "xiǎo māo", emoji: "🐱", sound: "喵喵！", prompt: "小猫怎么叫？", color: "#E8DBFF", accent: "#8C6CCF" },
      { name: "小鸭", pinyin: "xiǎo yā", emoji: "🦆", sound: "嘎嘎！", prompt: "小鸭在游泳", color: "#DDF5FF", accent: "#3BA5C6" },
      { name: "小牛", pinyin: "xiǎo niú", emoji: "🐮", sound: "哞哞！", prompt: "小牛吃青草", color: "#E0F4C8", accent: "#62A84A" },
      { name: "小羊", pinyin: "xiǎo yáng", emoji: "🐑", sound: "咩咩！", prompt: "小羊软绵绵", color: "#FFE1E4", accent: "#D86B78" },
      { name: "小鸟", pinyin: "xiǎo niǎo", emoji: "🐦", sound: "啾啾！", prompt: "小鸟飞上天", color: "#DDEBFF", accent: "#577FCE" },
    ],
  },
  vehicles: {
    label: "车辆",
    icon: "🛞",
    items: [
      { name: "小汽车", pinyin: "xiǎo qì chē", emoji: "🚗", sound: "嘀嘀！", prompt: "小汽车开走啦", color: "#FFE0D7", accent: "#E85D45" },
      { name: "公交车", pinyin: "gōng jiāo chē", emoji: "🚌", sound: "嘟嘟！", prompt: "大家一起坐公交", color: "#FFF0BA", accent: "#D69024" },
      { name: "消防车", pinyin: "xiāo fáng chē", emoji: "🚒", sound: "呜哇呜哇！", prompt: "消防车去帮忙", color: "#FFDCDD", accent: "#DC4E50" },
      { name: "火车", pinyin: "huǒ chē", emoji: "🚂", sound: "呜——呜——！", prompt: "火车钻山洞", color: "#DDF5FF", accent: "#328EAB" },
      { name: "挖掘机", pinyin: "wā jué jī", emoji: "🚜", sound: "轰隆隆！", prompt: "挖掘机挖呀挖", color: "#F5E2BB", accent: "#B47724" },
      { name: "飞机", pinyin: "fēi jī", emoji: "✈️", sound: "嗡嗡！", prompt: "飞机飞上云朵", color: "#DDEBFF", accent: "#557AC5" },
    ],
  },
};

export default function Home() {
  const [category, setCategory] = useState<CategoryKey>("animals");
  const [index, setIndex] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const pointerStart = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const speakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = categories[category].items;
  const item = items[index];

  useEffect(() => {
    return () => {
      if (speakingTimer.current) clearTimeout(speakingTimer.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const changeCard = (direction: number) => {
    setIndex((current) => (current + direction + items.length) % items.length);
    setIsSpeaking(false);
    window.navigator.vibrate?.(18);
  };

  const speak = () => {
    if (!speakerOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${item.name}。${item.sound}`);
    utterance.lang = "zh-CN";
    utterance.rate = 0.72;
    utterance.pitch = 1.12;
    const chineseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("zh"));
    if (chineseVoice) utterance.voice = chineseVoice;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    setShowHint(false);
    window.navigator.vibrate?.(28);
    window.speechSynthesis.speak(utterance);
    if (speakingTimer.current) clearTimeout(speakingTimer.current);
    speakingTimer.current = setTimeout(() => setIsSpeaking(false), 2400);
  };

  const selectCategory = (nextCategory: CategoryKey) => {
    window.speechSynthesis?.cancel();
    setCategory(nextCategory);
    setIndex(0);
    setIsSpeaking(false);
    setShowHint(true);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    pointerStart.current = event.clientX;
    didSwipe.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > 48) {
      didSwipe.current = true;
      changeCard(distance < 0 ? 1 : -1);
    }
  };

  const handleCardClick = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    speak();
  };

  const cardStyle = {
    "--card-color": item.color,
    "--accent-color": item.accent,
  } as CSSProperties;

  return (
    <main className="app-shell" onKeyDown={(event) => {
      if (event.key === "ArrowLeft") changeCard(-1);
      if (event.key === "ArrowRight") changeCard(1);
    }}>
      <div className="sun-spot sun-spot-one" />
      <div className="sun-spot sun-spot-two" />

      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">♪</div>
        <div className="brand-copy">
          <p>小耳朵</p>
          <h1>点点乐</h1>
        </div>
        <button
          className="sound-toggle"
          type="button"
          aria-label={speakerOn ? "关闭声音" : "打开声音"}
          aria-pressed={speakerOn}
          onClick={() => {
            window.speechSynthesis?.cancel();
            setSpeakerOn((current) => !current);
            setIsSpeaking(false);
          }}
        >
          <span aria-hidden="true">{speakerOn ? "🔊" : "🔇"}</span>
        </button>
      </header>

      <nav className="category-switcher" aria-label="选择认知主题">
        {(Object.keys(categories) as CategoryKey[]).map((key) => (
          <button
            type="button"
            key={key}
            className={category === key ? "category-button active" : "category-button"}
            aria-pressed={category === key}
            onClick={() => selectCategory(key)}
          >
            <span aria-hidden="true">{categories[key].icon}</span>
            {categories[key].label}
          </button>
        ))}
      </nav>

      <section className="learning-area" aria-live="polite">
        <button
          type="button"
          className={isSpeaking ? "learning-card is-speaking" : "learning-card"}
          style={cardStyle}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerStart.current = null; }}
          onClick={handleCardClick}
          aria-label={`${item.name}，点一下听声音，左右滑动换卡片`}
        >
          <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="scene-cloud cloud-one" aria-hidden="true" />
          <span className="scene-cloud cloud-two" aria-hidden="true" />
          <span className="scene-ground" aria-hidden="true" />
          <span className="main-emoji" aria-hidden="true">{item.emoji}</span>
          <span className={isSpeaking ? "sound-bubble visible" : "sound-bubble"} aria-hidden="true">
            {item.sound}
          </span>
          <span className="word-group">
            <strong>{item.name}</strong>
            <span className="pinyin">{item.pinyin}</span>
          </span>
          <span className="tiny-prompt">{item.prompt}</span>
          <span className={showHint ? "tap-hint" : "tap-hint subtle"}>
            <span className="tap-icon" aria-hidden="true">☝️</span>
            点一点，听声音
          </span>
        </button>
      </section>

      <footer className="controls">
        <button className="round-button" type="button" onClick={() => changeCard(-1)} aria-label="上一张">‹</button>
        <div className="progress-dots" aria-label={`第 ${index + 1} 张，共 ${items.length} 张`}>
          {items.map((dotItem, dotIndex) => (
            <button
              key={dotItem.name}
              type="button"
              className={dotIndex === index ? "dot active" : "dot"}
              onClick={() => setIndex(dotIndex)}
              aria-label={`查看${dotItem.name}`}
              aria-current={dotIndex === index ? "true" : undefined}
            />
          ))}
        </div>
        <button className="round-button" type="button" onClick={() => changeCard(1)} aria-label="下一张">›</button>
      </footer>
      <p className="swipe-tip"><span aria-hidden="true">↔</span> 左右滑动换一张</p>
    </main>
  );
}
