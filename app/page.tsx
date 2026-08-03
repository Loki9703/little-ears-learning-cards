"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import ThreeLearningModel from "./ThreeLearningModel";

type CategoryKey = "animals" | "vehicles" | "fruits";
type PlayStage = "name" | "sound" | "lesson";
type MotionKey = "run" | "jump" | "waddle" | "nod" | "bounce" | "fly" | "flap" | "sniff" | "gallop" | "leap" | "spray" | "roar" | "drive" | "siren" | "chug" | "dig" | "soar" | "zip" | "pedal" | "sail" | "hover" | "roll" | "peel" | "split" | "jiggle" | "sway" | "pop";

type CardItem = {
  name: string;
  pinyin: string;
  emoji: string;
  sound: string;
  prompt: string;
  audio: string;
  effect: string;
  effectDuration: number;
  effectRepeats: number;
  effectVolume?: number;
  lesson: string;
  color: string;
  accent: string;
};

const categories: Record<CategoryKey, { label: string; icon: string; items: CardItem[] }> = {
  animals: {
    label: "动物",
    icon: "🐾",
    items: [
      { name: "小狗", pinyin: "xiǎo gǒu", emoji: "🐶", sound: "汪汪！", prompt: "小狗怎么叫？", audio: "/audio/dog.mp3", effect: "/audio/effects/dog.mp3", effectDuration: 1800, effectRepeats: 2, lesson: "/audio/lessons/dog.mp3", color: "#FFF0BA", accent: "#ED8B3A" },
      { name: "小猫", pinyin: "xiǎo māo", emoji: "🐱", sound: "喵喵！", prompt: "小猫怎么叫？", audio: "/audio/cat.mp3", effect: "/audio/effects/cat.mp3", effectDuration: 1600, effectRepeats: 2, lesson: "/audio/lessons/cat.mp3", color: "#E8DBFF", accent: "#8C6CCF" },
      { name: "小鸭", pinyin: "xiǎo yā", emoji: "🦆", sound: "嘎嘎！", prompt: "小鸭在游泳", audio: "/audio/duck.mp3", effect: "/audio/effects/duck.mp3", effectDuration: 5000, effectRepeats: 1, lesson: "/audio/lessons/duck.mp3", color: "#DDF5FF", accent: "#3BA5C6" },
      { name: "小牛", pinyin: "xiǎo niú", emoji: "🐮", sound: "哞哞！", prompt: "小牛吃青草", audio: "/audio/cow.mp3", effect: "/audio/effects/cow.mp3", effectDuration: 2800, effectRepeats: 1, lesson: "/audio/lessons/cow.mp3", color: "#E0F4C8", accent: "#62A84A" },
      { name: "小羊", pinyin: "xiǎo yáng", emoji: "🐑", sound: "咩咩！", prompt: "小羊软绵绵", audio: "/audio/sheep.mp3", effect: "/audio/effects/sheep.mp3", effectDuration: 1800, effectRepeats: 2, lesson: "/audio/lessons/sheep.mp3", color: "#FFE1E4", accent: "#D86B78" },
      { name: "小鸟", pinyin: "xiǎo niǎo", emoji: "🐦", sound: "啾啾！", prompt: "小鸟飞上天", audio: "/audio/bird.mp3", effect: "/audio/effects/bird.mp3", effectDuration: 3200, effectRepeats: 1, lesson: "/audio/lessons/bird.mp3", color: "#DDEBFF", accent: "#577FCE" },
      { name: "大公鸡", pinyin: "dà gōng jī", emoji: "🐓", sound: "喔喔喔！", prompt: "大公鸡叫早啦", audio: "/audio/rooster.mp3", effect: "/audio/effects/rooster.mp3", effectDuration: 4400, effectRepeats: 1, lesson: "/audio/lessons/rooster.mp3", color: "#FFE7C7", accent: "#D86A32" },
      { name: "小猪", pinyin: "xiǎo zhū", emoji: "🐷", sound: "哼哼！", prompt: "小猪鼻子圆圆的", audio: "/audio/pig.mp3", effect: "/audio/effects/pig.mp3", effectDuration: 3200, effectRepeats: 1, lesson: "/audio/lessons/pig.mp3", color: "#FFDCE8", accent: "#D9698E" },
      { name: "小马", pinyin: "xiǎo mǎ", emoji: "🐴", sound: "咴咴！", prompt: "小马跑得快", audio: "/audio/horse.mp3", effect: "/audio/effects/horse.mp3", effectDuration: 3000, effectRepeats: 1, lesson: "/audio/lessons/horse.mp3", color: "#F3DFC5", accent: "#A86D3D" },
      { name: "小青蛙", pinyin: "xiǎo qīng wā", emoji: "🐸", sound: "呱呱！", prompt: "小青蛙跳得高", audio: "/audio/frog.mp3", effect: "/audio/effects/frog.mp3", effectDuration: 4800, effectRepeats: 1, lesson: "/audio/lessons/frog.mp3", color: "#DCF2C9", accent: "#579B4C" },
      { name: "大象", pinyin: "dà xiàng", emoji: "🐘", sound: "昂——！", prompt: "大象鼻子长长的", audio: "/audio/elephant.mp3", effect: "/audio/effects/elephant.mp3", effectDuration: 3000, effectRepeats: 1, effectVolume: 0.46, lesson: "/audio/lessons/elephant.mp3", color: "#DDE7F2", accent: "#607D9D" },
      { name: "狮子", pinyin: "shī zi", emoji: "🦁", sound: "吼——！", prompt: "狮子声音响亮", audio: "/audio/lion.mp3", effect: "/audio/effects/lion.mp3", effectDuration: 1900, effectRepeats: 1, effectVolume: 0.4, lesson: "/audio/lessons/lion.mp3", color: "#FFE6A9", accent: "#C98227" },
    ],
  },
  vehicles: {
    label: "车辆",
    icon: "🛞",
    items: [
      { name: "小汽车", pinyin: "xiǎo qì chē", emoji: "🚗", sound: "嘀嘀！", prompt: "小汽车开走啦", audio: "/audio/car.mp3", effect: "/audio/effects/car.mp3", effectDuration: 1500, effectRepeats: 2, lesson: "/audio/lessons/car.mp3", color: "#FFE0D7", accent: "#E85D45" },
      { name: "公交车", pinyin: "gōng jiāo chē", emoji: "🚌", sound: "嘟嘟！", prompt: "大家一起坐公交", audio: "/audio/bus.mp3", effect: "/audio/effects/bus.mp3", effectDuration: 2000, effectRepeats: 1, lesson: "/audio/lessons/bus.mp3", color: "#FFF0BA", accent: "#D69024" },
      { name: "消防车", pinyin: "xiāo fáng chē", emoji: "🚒", sound: "呜哇呜哇！", prompt: "消防车去帮忙", audio: "/audio/firetruck.mp3", effect: "/audio/effects/firetruck.mp3", effectDuration: 4800, effectRepeats: 1, lesson: "/audio/lessons/firetruck.mp3", color: "#FFDCDD", accent: "#DC4E50" },
      { name: "火车", pinyin: "huǒ chē", emoji: "🚂", sound: "呜——呜——！", prompt: "火车钻山洞", audio: "/audio/train.mp3", effect: "/audio/effects/train.mp3", effectDuration: 2200, effectRepeats: 2, lesson: "/audio/lessons/train.mp3", color: "#DDF5FF", accent: "#328EAB" },
      { name: "挖掘机", pinyin: "wā jué jī", emoji: "🚜", sound: "轰隆隆！", prompt: "挖掘机挖呀挖", audio: "/audio/excavator.mp3", effect: "/audio/effects/excavator.mp3", effectDuration: 5200, effectRepeats: 1, lesson: "/audio/lessons/excavator.mp3", color: "#F5E2BB", accent: "#B47724" },
      { name: "飞机", pinyin: "fēi jī", emoji: "✈️", sound: "嗡嗡！", prompt: "飞机飞上云朵", audio: "/audio/airplane.mp3", effect: "/audio/effects/airplane.mp3", effectDuration: 5500, effectRepeats: 1, lesson: "/audio/lessons/airplane.mp3", color: "#DDEBFF", accent: "#557AC5" },
      { name: "救护车", pinyin: "jiù hù chē", emoji: "🚑", sound: "呜哇呜哇！", prompt: "救护车去医院", audio: "/audio/ambulance.mp3", effect: "/audio/effects/ambulance.mp3", effectDuration: 4800, effectRepeats: 1, effectVolume: 0.46, lesson: "/audio/lessons/ambulance.mp3", color: "#E1F4ED", accent: "#3E9B78" },
      { name: "警车", pinyin: "jǐng chē", emoji: "🚓", sound: "呜哩呜哩！", prompt: "警车赶去帮忙", audio: "/audio/policecar.mp3", effect: "/audio/effects/policecar.mp3", effectDuration: 4500, effectRepeats: 1, effectVolume: 0.46, lesson: "/audio/lessons/policecar.mp3", color: "#DCE9F7", accent: "#3D72A8" },
      { name: "摩托车", pinyin: "mó tuō chē", emoji: "🏍️", sound: "突突突！", prompt: "骑车要戴头盔", audio: "/audio/motorcycle.mp3", effect: "/audio/effects/motorcycle.mp3", effectDuration: 4200, effectRepeats: 1, effectVolume: 0.48, lesson: "/audio/lessons/motorcycle.mp3", color: "#E6E1F4", accent: "#7465A8" },
      { name: "自行车", pinyin: "zì xíng chē", emoji: "🚲", sound: "叮铃铃！", prompt: "小脚踩一踩", audio: "/audio/bicycle.mp3", effect: "/audio/effects/bicycle.mp3", effectDuration: 1700, effectRepeats: 2, lesson: "/audio/lessons/bicycle.mp3", color: "#DDF3E6", accent: "#4A9A69" },
      { name: "轮船", pinyin: "lún chuán", emoji: "🚢", sound: "呜——！", prompt: "轮船水上走", audio: "/audio/ship.mp3", effect: "/audio/effects/ship.mp3", effectDuration: 5200, effectRepeats: 1, effectVolume: 0.45, lesson: "/audio/lessons/ship.mp3", color: "#DDF1FA", accent: "#3E8EAD" },
      { name: "直升机", pinyin: "zhí shēng jī", emoji: "🚁", sound: "哒哒哒！", prompt: "旋翼转呀转", audio: "/audio/helicopter.mp3", effect: "/audio/effects/helicopter.mp3", effectDuration: 5200, effectRepeats: 1, effectVolume: 0.45, lesson: "/audio/lessons/helicopter.mp3", color: "#F0E6D6", accent: "#9A7145" },
    ],
  },
  fruits: {
    label: "水果",
    icon: "🍎",
    items: [
      { name: "苹果", pinyin: "píng guǒ", emoji: "🍎", sound: "红红圆圆", prompt: "咬一口，咔嚓咔嚓", audio: "/audio/apple.mp3", effect: "/audio/features/apple.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/apple.mp3", color: "#FFE0DA", accent: "#D9574F" },
      { name: "香蕉", pinyin: "xiāng jiāo", emoji: "🍌", sound: "弯弯软软", prompt: "像一弯小月亮", audio: "/audio/banana.mp3", effect: "/audio/features/banana.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/banana.mp3", color: "#FFF1B8", accent: "#C89418" },
      { name: "橙子", pinyin: "chéng zi", emoji: "🍊", sound: "橙橙圆圆", prompt: "里面藏着小橘瓣", audio: "/audio/orange.mp3", effect: "/audio/features/orange.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/orange.mp3", color: "#FFE1B8", accent: "#D97722" },
      { name: "西瓜", pinyin: "xī guā", emoji: "🍉", sound: "绿皮红瓤", prompt: "夏天吃一口真清甜", audio: "/audio/watermelon.mp3", effect: "/audio/features/watermelon.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/watermelon.mp3", color: "#DDF2CE", accent: "#4C9854" },
      { name: "草莓", pinyin: "cǎo méi", emoji: "🍓", sound: "红红尖尖", prompt: "身上有好多小点点", audio: "/audio/strawberry.mp3", effect: "/audio/features/strawberry.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/strawberry.mp3", color: "#FFDCE1", accent: "#D64E67" },
      { name: "葡萄", pinyin: "pú tao", emoji: "🍇", sound: "一颗一颗", prompt: "好多小圆球抱成团", audio: "/audio/grape.mp3", effect: "/audio/features/grape.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/grape.mp3", color: "#E9DDFC", accent: "#7D5AB5" },
      { name: "梨", pinyin: "lí", emoji: "🍐", sound: "脆脆多汁", prompt: "肚子圆圆，头儿小小", audio: "/audio/pear.mp3", effect: "/audio/features/pear.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/pear.mp3", color: "#EEF2BF", accent: "#839638" },
      { name: "桃子", pinyin: "táo zi", emoji: "🍑", sound: "粉粉香香", prompt: "中间藏着硬果核", audio: "/audio/peach.mp3", effect: "/audio/features/peach.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/peach.mp3", color: "#FFE0D8", accent: "#D97568" },
      { name: "菠萝", pinyin: "bō luó", emoji: "🍍", sound: "外衣刺刺", prompt: "头顶戴着绿叶冠", audio: "/audio/pineapple.mp3", effect: "/audio/features/pineapple.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/pineapple.mp3", color: "#FFF0B8", accent: "#B98320" },
      { name: "芒果", pinyin: "máng guǒ", emoji: "🥭", sound: "黄黄香香", prompt: "果肉软软又甜甜", audio: "/audio/mango.mp3", effect: "/audio/features/mango.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/mango.mp3", color: "#FFE8A8", accent: "#C98225" },
      { name: "猕猴桃", pinyin: "mí hóu táo", emoji: "🥝", sound: "外棕内绿", prompt: "里面有一圈小黑籽", audio: "/audio/kiwi.mp3", effect: "/audio/features/kiwi.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/kiwi.mp3", color: "#E2EDC8", accent: "#64883F" },
      { name: "樱桃", pinyin: "yīng táo", emoji: "🍒", sound: "小小红红", prompt: "两颗樱桃手牵手", audio: "/audio/cherry.mp3", effect: "/audio/features/cherry.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/cherry.mp3", color: "#FFD9DE", accent: "#BD3F54" },
      { name: "蓝莓", pinyin: "lán méi", emoji: "🫐", sound: "蓝蓝小小", prompt: "一颗小小蓝宝石", audio: "/audio/blueberry.mp3", effect: "/audio/features/blueberry.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/blueberry.mp3", color: "#DEE3FA", accent: "#526BB0" },
      { name: "柠檬", pinyin: "níng méng", emoji: "🍋", sound: "黄黄酸酸", prompt: "闻一闻，清香扑鼻", audio: "/audio/lemon.mp3", effect: "/audio/features/lemon.mp3", effectDuration: 6000, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/lemon.mp3", color: "#FFF4B8", accent: "#AE9120" },
    ],
  },
};

const motionByName: Record<string, MotionKey> = {
  小狗: "run",
  小猫: "jump",
  小鸭: "waddle",
  小牛: "nod",
  小羊: "bounce",
  小鸟: "fly",
  大公鸡: "flap",
  小猪: "sniff",
  小马: "gallop",
  小青蛙: "leap",
  大象: "spray",
  狮子: "roar",
  小汽车: "drive",
  公交车: "drive",
  消防车: "spray",
  火车: "chug",
  挖掘机: "dig",
  飞机: "soar",
  救护车: "siren",
  警车: "siren",
  摩托车: "zip",
  自行车: "pedal",
  轮船: "sail",
  直升机: "hover",
  苹果: "roll",
  香蕉: "peel",
  橙子: "roll",
  西瓜: "split",
  草莓: "bounce",
  葡萄: "jiggle",
  梨: "sway",
  桃子: "bounce",
  菠萝: "sway",
  芒果: "roll",
  猕猴桃: "split",
  樱桃: "jiggle",
  蓝莓: "pop",
  柠檬: "roll",
};

export default function Home() {
  const [category, setCategory] = useState<CategoryKey>("animals");
  const [index, setIndex] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [motionCycle, setMotionCycle] = useState(0);
  const [playStage, setPlayStage] = useState<PlayStage | null>(null);
  const [showHint, setShowHint] = useState(true);
  const pointerStart = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const speakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const playbackSession = useRef(0);

  const items = categories[category].items;
  const item = items[index];
  const isFruit = category === "fruits";
  const motion = motionByName[item.name] ?? "bounce";

  useEffect(() => {
    return () => {
      if (speakingTimer.current) clearTimeout(speakingTimer.current);
      if (motionTimer.current) clearTimeout(motionTimer.current);
      playbackSession.current += 1;
      audioPlayer.current?.pause();
    };
  }, []);

  const cancelPlayback = () => {
    playbackSession.current += 1;
    audioPlayer.current?.pause();
    if (speakingTimer.current) clearTimeout(speakingTimer.current);
    setIsSpeaking(false);
    setPlayStage(null);
  };

  const stopMotion = () => {
    if (motionTimer.current) clearTimeout(motionTimer.current);
    setIsAnimating(false);
  };

  const triggerMotion = () => {
    if (motionTimer.current) clearTimeout(motionTimer.current);
    setMotionCycle((current) => current + 1);
    setIsAnimating(true);
    setShowHint(false);
    window.navigator.vibrate?.(28);
    motionTimer.current = setTimeout(() => setIsAnimating(false), 3600);
  };

  const changeCard = (direction: number) => {
    cancelPlayback();
    stopMotion();
    setIndex((current) => (current + direction + items.length) % items.length);
    window.navigator.vibrate?.(18);
  };

  const playClip = (src: string, volume: number, session: number, maxDuration?: number) => (
    new Promise<void>((resolve) => {
      if (session !== playbackSession.current) {
        resolve();
        return;
      }

      const audio = new Audio(src);
      let finished = false;
      const finishClip = () => {
        if (finished) return;
        finished = true;
        if (speakingTimer.current) clearTimeout(speakingTimer.current);
        resolve();
      };

      audio.preload = "auto";
      audio.volume = volume;
      audio.onended = finishClip;
      audio.onerror = finishClip;
      audioPlayer.current = audio;
      if (maxDuration) {
        speakingTimer.current = setTimeout(() => {
          audio.pause();
          finishClip();
        }, maxDuration);
      }
      void audio.play().catch(finishClip);
    })
  );

  const playAudio = async () => {
    if (!speakerOn || typeof window === "undefined") return;
    cancelPlayback();
    const session = playbackSession.current;
    setIsSpeaking(true);

    setPlayStage("name");
    await playClip(item.audio, 0.9, session);
    if (session !== playbackSession.current) return;

    setPlayStage("sound");
    for (let repeat = 0; repeat < item.effectRepeats; repeat += 1) {
      await playClip(item.effect, item.effectVolume ?? 0.55, session, item.effectDuration);
      if (session !== playbackSession.current) return;
    }

    setPlayStage("lesson");
    await playClip(item.lesson, 0.88, session);
    if (session !== playbackSession.current) return;

    setIsSpeaking(false);
    setPlayStage(null);
  };

  const selectCategory = (nextCategory: CategoryKey) => {
    cancelPlayback();
    stopMotion();
    setCategory(nextCategory);
    setIndex(0);
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
    triggerMotion();
    void playAudio();
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
            cancelPlayback();
            setSpeakerOn((current) => !current);
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
          className={`learning-card motion-${motion}${isSpeaking ? " is-speaking" : ""}${isAnimating ? " is-animating" : ""}`}
          style={cardStyle}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerStart.current = null; }}
          onClick={handleCardClick}
          aria-label={`${item.name}，点一下看动画并听完整教学，左右滑动换卡片`}
        >
          <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="scene-cloud cloud-one" aria-hidden="true" />
          <span className="scene-cloud cloud-two" aria-hidden="true" />
          <span className="scene-ground" aria-hidden="true" />
          <ThreeLearningModel
            category={category}
            name={item.name}
            fallbackEmoji={item.emoji}
            motion={motion}
            isActive={isAnimating}
            motionCycle={motionCycle}
          />
          <span className={isSpeaking ? "sound-bubble visible" : "sound-bubble"} aria-hidden="true">
            {playStage === "name" ? "听名字" : playStage === "lesson" ? "小知识" : item.sound}
          </span>
          <span className="word-group">
            <strong>{item.name}</strong>
            <span className="pinyin">{item.pinyin}</span>
          </span>
          <span className="tiny-prompt">{item.prompt}</span>
          <span className={showHint ? "tap-hint" : "tap-hint subtle"}>
            <span className={isSpeaking ? "stage-icon" : "tap-icon"} aria-hidden="true">{isSpeaking ? "♪" : "☝️"}</span>
            {playStage === "name" ? "正在认识名称" : playStage === "sound" ? (isFruit ? "正在认识水果特征" : "正在听真实声音") : playStage === "lesson" ? "正在学小知识" : isAnimating ? "看，3D 模型动起来啦！" : "点一点，看 3D 动画、听讲解"}
          </span>
          <span className="lesson-steps" aria-hidden="true">
            <span className={playStage === "name" ? "active" : ""}>① 名称</span>
            <span className={playStage === "sound" ? "active" : ""}>② {isFruit ? "特征" : "声音"}</span>
            <span className={playStage === "lesson" ? "active" : ""}>③ 小知识</span>
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
              onClick={() => {
                cancelPlayback();
                stopMotion();
                setIndex(dotIndex);
                setShowHint(true);
              }}
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
