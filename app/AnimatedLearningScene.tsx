"use client";

type ModelCategory = "animals" | "vehicles" | "fruits";

type Props = {
  category: ModelCategory;
  name: string;
  fallbackEmoji: string;
  motion: string;
  isActive: boolean;
  motionCycle: number;
};

const illustrationByName: Record<string, string> = {
  小狗: "dog",
  小猫: "cat",
  小鸭: "duck",
  小牛: "cow",
  小羊: "sheep",
  小鸟: "bird",
  大公鸡: "rooster",
  小猪: "pig",
  小马: "horse",
  小青蛙: "frog",
  大象: "elephant",
  狮子: "lion",
  小汽车: "car",
  公交车: "bus",
  消防车: "firetruck",
  火车: "train",
  挖掘机: "excavator",
  飞机: "airplane",
  救护车: "ambulance",
  警车: "policecar",
  摩托车: "motorcycle",
  自行车: "bicycle",
  轮船: "ship",
  直升机: "helicopter",
  苹果: "apple",
  香蕉: "banana",
  橙子: "orange",
  西瓜: "watermelon",
  草莓: "strawberry",
  葡萄: "grape",
  梨: "pear",
  桃子: "peach",
  菠萝: "pineapple",
  芒果: "mango",
  猕猴桃: "kiwi",
  樱桃: "cherry",
  蓝莓: "blueberry",
  柠檬: "lemon",
};

const dustyMotions = new Set(["run", "gallop", "drive", "zip", "pedal"]);
const airyMotions = new Set(["fly", "soar", "hover"]);
const wateryMotions = new Set(["waddle", "leap", "sail"]);
const fruityMotions = new Set(["roll", "peel", "split", "jiggle", "sway", "pop", "bounce"]);

function Dots({ className }: { className: string }) {
  return <span className={className} aria-hidden="true"><i /><i /><i /></span>;
}

export default function AnimatedLearningScene({ category, name, fallbackEmoji, motion, isActive, motionCycle }: Props) {
  const illustration = illustrationByName[name];
  const src = illustration ? `/illustrations/${illustration}.svg` : "";
  const isDog = name === "小狗";
  const isTrain = name === "火车";
  const isBanana = name === "香蕉";
  const isSplitFruit = motion === "split";
  const isElephant = name === "大象";
  const isHelicopter = name === "直升机";

  return (
    <div className={`flat-scene flat-scene-${category} scene-${illustration ?? "fallback"}${isActive ? " is-active" : ""}`} aria-label={`${name}的二维卡通动画`}>
      <span className="flat-halo" aria-hidden="true" />
      <span className="flat-shadow" aria-hidden="true" />
      {isDog && (
        <span className="dog-meadow" aria-hidden="true">
          <i className="grass grass-one" /><i className="grass grass-two" /><i className="grass grass-three" />
          <i className="dog-ball" />
        </span>
      )}
      {isTrain && (
        <span className="train-world" aria-hidden="true">
          <i className="train-hill hill-one" /><i className="train-hill hill-two" />
          <i className="train-tree tree-one" /><i className="train-tree tree-two" />
          <i className="train-track" />
        </span>
      )}
      <span className="flat-animation-set" key={`${name}-${motionCycle}-${isActive ? "play" : "rest"}`}>
        <span className={`main-emoji flat-art art-${illustration ?? "fallback"}`} aria-hidden="true">
          {src ? <img className="flat-illustration" src={src} alt="" draggable={false} /> : <span className="flat-fallback">{fallbackEmoji}</span>}
        </span>

        <span className="motion-effects" aria-hidden="true">
          {dustyMotions.has(motion) && <Dots className="dust-puffs" />}
          {motion === "spray" && <Dots className={`water-stream ${isElephant ? "elephant-water" : "truck-water"}`} />}
          {motion === "siren" && <Dots className="siren-lights" />}
          {motion === "chug" && <Dots className="smoke-puffs" />}
          {motion === "dig" && <Dots className="dirt-puffs" />}
          {airyMotions.has(motion) && <Dots className="air-lines" />}
          {(fruityMotions.has(motion) || ["play", "jump", "bounce", "flap"].includes(motion)) && (
            <span className="motion-sparkles"><i>✦</i><i>✦</i><i>✦</i></span>
          )}
          {name === "小狗" && <span className="paw-trail"><i>●</i><i>●</i><i>●</i></span>}
          {motion === "roar" && <span className="roar-rings"><i /><i /><i /></span>}
          {motion === "sniff" && <span className="scent-curls"><i>﹏</i><i>﹏</i><i>﹏</i></span>}
          {wateryMotions.has(motion) && <span className="ripple-set"><i /><i /><i /></span>}
          {isHelicopter && <span className="rotor-effect"><i /><i /></span>}
          {isBanana && (
            <span className="banana-reveal">
              <i className="banana-fruit" />
              <i className="banana-peel banana-peel-one" />
              <i className="banana-peel banana-peel-two" />
              <i className="banana-peel banana-peel-three" />
            </span>
          )}
          {isSplitFruit && src && (
            <span className="split-reveal">
              <img className="split-copy split-left" src={src} alt="" draggable={false} />
              <img className="split-copy split-right" src={src} alt="" draggable={false} />
            </span>
          )}
        </span>
      </span>
      <span className="model-2d-badge" aria-hidden="true">2D 动画</span>
    </div>
  );
}
