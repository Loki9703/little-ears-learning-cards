"use client";

import NotoLottieAnimation from "./NotoLottieAnimation";

type ModelCategory = "animals" | "vehicles" | "fruits";

type Props = {
  category: ModelCategory;
  name: string;
  fallbackEmoji: string;
  motion: string;
  isActive: boolean;
  motionCycle: number;
  motionVariant: number;
  playStage: "name" | "sound" | "lesson" | null;
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
  小兔子: "rabbit",
  小乌龟: "turtle",
  小鱼: "fish",
  小猴子: "monkey",
  小熊: "bear",
  大熊猫: "panda",
  蝴蝶: "butterfly",
  小蜜蜂: "bee",
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
  出租车: "taxi",
  货车: "truck",
  火箭: "rocket",
  滑板: "skateboard",
  蒸汽火车: "locomotive",
  拖拉机: "tractor",
  赛车: "racecar",
  帆船: "sailboat",
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
  甜瓜: "melon",
  牛油果: "avocado",
};

const notoAnimationByName: Record<string, string> = {
  小狗: "dog",
  小鸟: "bird",
  大公鸡: "rooster",
  小猪: "pig",
  小马: "horse",
  小青蛙: "frog",
  狮子: "lion",
  小兔子: "rabbit",
  小乌龟: "turtle",
  小鱼: "fish",
  小猴子: "monkey",
  小熊: "bear",
  大熊猫: "panda",
  蝴蝶: "butterfly",
  小蜜蜂: "bee",
  小汽车: "car",
  公交车: "bus",
  火车: "train",
  挖掘机: "excavator",
  飞机: "airplane",
  摩托车: "motorcycle",
  自行车: "bicycle",
  出租车: "taxi",
  货车: "truck",
  火箭: "rocket",
  滑板: "skateboard",
  蒸汽火车: "locomotive",
  拖拉机: "tractor",
  赛车: "racecar",
  帆船: "sailboat",
  苹果: "apple",
  橙子: "orange",
  西瓜: "watermelon",
  草莓: "strawberry",
  葡萄: "grape",
  梨: "pear",
  菠萝: "pineapple",
  芒果: "mango",
  猕猴桃: "kiwi",
  樱桃: "cherry",
  蓝莓: "blueberry",
  柠檬: "lemon",
  甜瓜: "melon",
  牛油果: "avocado",
};

const dustyMotions = new Set(["run", "gallop", "drive", "zip", "pedal"]);
const airyMotions = new Set(["fly", "soar", "hover"]);
const wateryMotions = new Set(["waddle", "leap", "sail"]);
const fruityMotions = new Set(["roll", "peel", "split", "jiggle", "sway", "pop", "bounce"]);

const animalContextByName: Record<string, "garden" | "farm" | "pond" | "savanna"> = {
  小鸟: "garden",
  大公鸡: "farm",
  小猪: "farm",
  小马: "farm",
  小青蛙: "pond",
  狮子: "savanna",
  小兔子: "garden",
  小乌龟: "pond",
  小鱼: "pond",
  小猴子: "garden",
  小熊: "savanna",
  大熊猫: "garden",
  蝴蝶: "garden",
  小蜜蜂: "garden",
};

const vehicleContextByName: Record<string, "road" | "construction" | "sky"> = {
  小汽车: "road",
  公交车: "road",
  摩托车: "road",
  自行车: "road",
  挖掘机: "construction",
  飞机: "sky",
  出租车: "road",
  货车: "road",
  火箭: "sky",
  滑板: "road",
  拖拉机: "construction",
  赛车: "road",
};

function Dots({ className }: { className: string }) {
  return <span className={className} aria-hidden="true"><i /><i /><i /></span>;
}

export default function AnimatedLearningScene({ category, name, fallbackEmoji, motion, isActive, motionCycle, motionVariant, playStage }: Props) {
  const illustration = illustrationByName[name];
  const src = illustration ? `/illustrations/${illustration}.svg` : "";
  const notoAnimation = notoAnimationByName[name];
  const animatedSrc = notoAnimation ? `/animations/noto/${notoAnimation}.json` : "";
  const animalContext = animalContextByName[name];
  const vehicleContext = vehicleContextByName[name];
  const isDog = name === "小狗";
  const isCat = name === "小猫";
  const isTrain = name === "火车" || name === "蒸汽火车";
  const isFiretruck = name === "消防车";
  const isBanana = name === "香蕉";
  const isWatermelon = name === "西瓜";
  const isSplitFruit = motion === "split";
  const isElephant = name === "大象";
  const isHelicopter = name === "直升机";

  return (
    <div className={`flat-scene flat-scene-${category} scene-${illustration ?? "fallback"} variant-${motionVariant} stage-${playStage ?? (isActive ? "action" : "idle")}${animatedSrc ? " has-noto-animation" : ""}${isActive ? " is-active" : ""}`} aria-label={`${name}的二维卡通动画`}>
      <span className="flat-halo" aria-hidden="true" />
      <span className="flat-shadow" aria-hidden="true" />
      {isDog && (
        <span className="dog-meadow" aria-hidden="true">
          <i className="grass grass-one" /><i className="grass grass-two" /><i className="grass grass-three" />
          <i className="dog-ball" />
        </span>
      )}
      {isCat && (
        <span className="cat-playground" aria-hidden="true">
          <i className="cat-cushion" />
          <i className="yarn-ball"><b /><b /></i>
          <i className="cat-butterfly"><b /><b /></i>
        </span>
      )}
      {isTrain && (
        <span className="train-world" aria-hidden="true">
          <i className="train-hill hill-one" /><i className="train-hill hill-two" />
          <i className="train-tree tree-one" /><i className="train-tree tree-two" />
          <i className="train-track" />
          <i className="train-tunnel" />
        </span>
      )}
      {isFiretruck && (
        <span className="rescue-scene" aria-hidden="true">
          <i className="rescue-road" />
          <i className="rescue-building"><b /><b /></i>
          <span className="rescue-flames"><i /><i /><i /></span>
          <span className="rescue-splash"><i /><i /><i /></span>
        </span>
      )}
      {animatedSrc && animalContext && (
        <span className={`noto-context animal-context context-${animalContext}`} aria-hidden="true">
          <i className="context-ground" />
          <i className="context-prop context-prop-one" />
          <i className="context-prop context-prop-two" />
          <span className="context-particles"><i /><i /><i /></span>
        </span>
      )}
      {animatedSrc && vehicleContext && (
        <span className={`noto-context vehicle-context context-${vehicleContext}`} aria-hidden="true">
          <i className="context-ground" />
          <i className="context-prop context-prop-one" />
          <i className="context-prop context-prop-two" />
          <span className="context-particles"><i /><i /><i /></span>
        </span>
      )}
      {category === "fruits" && (
        <span className="fruit-table" aria-hidden="true">
          <i className="fruit-plate" />
          <i className="fruit-leaf" />
          <i className="fruit-napkin" />
          <span className="fruit-glints"><i>✦</i><i>✦</i><i>✦</i></span>
        </span>
      )}
      <span className="flat-animation-set" key={`${name}-${motionCycle}-${isActive ? "play" : "rest"}`}>
        <span className={`main-emoji flat-art art-${illustration ?? "fallback"}`} aria-hidden="true">
          {src ? (
            animatedSrc ? (
              <NotoLottieAnimation
                animationSrc={animatedSrc}
                fallbackSrc={src}
                isPlaying={isActive}
                playKey={motionCycle}
              />
            ) : <img className="flat-illustration" src={src} alt="" draggable={false} />
          ) : <span className="flat-fallback">{fallbackEmoji}</span>}
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
          {isWatermelon && !animatedSrc && (
            <span className="watermelon-open">
              <i className="melon-half melon-left"><b /><b /><b /></i>
              <i className="melon-half melon-right"><b /><b /><b /></i>
            </span>
          )}
          {isSplitFruit && src && !isWatermelon && (
            <span className="split-reveal">
              <img className="split-copy split-left" src={src} alt="" draggable={false} />
              <img className="split-copy split-right" src={src} alt="" draggable={false} />
            </span>
          )}
        </span>
      </span>
      <span className="model-2d-badge" aria-hidden="true">{animatedSrc ? "官方动态" : "2D 动画"}</span>
    </div>
  );
}
