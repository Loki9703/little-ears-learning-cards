"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import AnimatedLearningScene from "./AnimatedLearningScene";

type CategoryKey = "animals" | "vehicles" | "fruits" | "dinosaurs";
type PlayStage = "name" | "sound" | "lesson";
type MotionKey = "play" | "run" | "jump" | "waddle" | "nod" | "bounce" | "fly" | "flap" | "sniff" | "gallop" | "leap" | "spray" | "roar" | "drive" | "siren" | "chug" | "dig" | "soar" | "zip" | "pedal" | "sail" | "hover" | "roll" | "peel" | "split" | "jiggle" | "sway" | "pop" | "stomp" | "charge" | "graze" | "tail-swing" | "prowl" | "club" | "crest-call" | "sail-stride" | "glide";
const LESSON_PREFERENCE_KEY = "little-ears-lesson-audio";

type CardItem = {
  name: string;
  pinyin: string;
  emoji: string;
  sound: string;
  prompt: string;
  audio?: string;
  effect?: string;
  effectDuration?: number;
  effectRepeats?: number;
  effectVolume?: number;
  lesson?: string;
  storyAudio?: string;
  storyDuration?: number;
  shortAudio?: string;
  shortDuration?: number;
  scientificCall?: string;
  callDuration?: number;
  narration?: {
    name: string;
    feature: string;
    lesson: string;
  };
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
      { name: "小兔子", pinyin: "xiǎo tù zi", emoji: "🐇", sound: "蹦蹦跳！", prompt: "长耳朵轻轻摆", audio: "/audio/rabbit.mp3", effect: "/audio/effects/rabbit.mp3", effectDuration: 3600, effectRepeats: 1, lesson: "/audio/lessons/rabbit.mp3", color: "#F6E9E4", accent: "#B66F68" },
      { name: "小乌龟", pinyin: "xiǎo wū guī", emoji: "🐢", sound: "慢慢爬！", prompt: "背着硬硬的小房子", audio: "/audio/turtle.mp3", effect: "/audio/effects/turtle.mp3", effectDuration: 4200, effectRepeats: 1, lesson: "/audio/lessons/turtle.mp3", color: "#DCEFD8", accent: "#568A54" },
      { name: "小鱼", pinyin: "xiǎo yú", emoji: "🐟", sound: "游呀游！", prompt: "尾巴摇一摇", audio: "/audio/fish.mp3", effect: "/audio/effects/fish.mp3", effectDuration: 3600, effectRepeats: 1, lesson: "/audio/lessons/fish.mp3", color: "#DCEFFA", accent: "#3B8DA8" },
      { name: "小猴子", pinyin: "xiǎo hóu zi", emoji: "🐒", sound: "吱吱！", prompt: "长尾巴会帮忙", audio: "/audio/monkey.mp3", effect: "/audio/effects/monkey.mp3", effectDuration: 3200, effectRepeats: 1, lesson: "/audio/lessons/monkey.mp3", color: "#F3DFC8", accent: "#9D673B" },
      { name: "小熊", pinyin: "xiǎo xióng", emoji: "🐻", sound: "咚咚走！", prompt: "厚厚的毛真暖和", audio: "/audio/bear.mp3", effect: "/audio/effects/bear.mp3", effectDuration: 3800, effectRepeats: 1, lesson: "/audio/lessons/bear.mp3", color: "#EEDCC8", accent: "#90613E" },
      { name: "大熊猫", pinyin: "dà xióng māo", emoji: "🐼", sound: "咔嚓咔嚓！", prompt: "最爱吃绿竹子", audio: "/audio/panda.mp3", effect: "/audio/effects/panda.mp3", effectDuration: 4200, effectRepeats: 1, lesson: "/audio/lessons/panda.mp3", color: "#E6EFDB", accent: "#58774E" },
      { name: "蝴蝶", pinyin: "hú dié", emoji: "🦋", sound: "扑扇扑扇！", prompt: "花间飞来飞去", audio: "/audio/butterfly.mp3", effect: "/audio/effects/butterfly.mp3", effectDuration: 3600, effectRepeats: 1, lesson: "/audio/lessons/butterfly.mp3", color: "#E9DFFC", accent: "#7A61B7" },
      { name: "小蜜蜂", pinyin: "xiǎo mì fēng", emoji: "🐝", sound: "嗡嗡！", prompt: "忙着采花蜜", audio: "/audio/bee.mp3", effect: "/audio/effects/bee.mp3", effectDuration: 3600, effectRepeats: 1, lesson: "/audio/lessons/bee.mp3", color: "#FFF0B8", accent: "#B48118" },
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
      { name: "出租车", pinyin: "chū zū chē", emoji: "🚕", sound: "嘀嘀！", prompt: "招招手就来啦", audio: "/audio/taxi.mp3", effect: "/audio/effects/taxi.mp3", effectDuration: 3600, effectRepeats: 1, lesson: "/audio/lessons/taxi.mp3", color: "#FFF0B6", accent: "#BD8518" },
      { name: "货车", pinyin: "huò chē", emoji: "🚚", sound: "轰隆隆！", prompt: "帮大家运东西", audio: "/audio/truck.mp3", effect: "/audio/effects/truck.mp3", effectDuration: 3800, effectRepeats: 1, lesson: "/audio/lessons/truck.mp3", color: "#DDECF4", accent: "#477D98" },
      { name: "火箭", pinyin: "huǒ jiàn", emoji: "🚀", sound: "轰——！", prompt: "飞向高高的天空", audio: "/audio/rocket.mp3", effect: "/audio/effects/rocket.mp3", effectDuration: 4200, effectRepeats: 1, effectVolume: 0.48, lesson: "/audio/lessons/rocket.mp3", color: "#E5E6FA", accent: "#676DB1" },
      { name: "滑板", pinyin: "huá bǎn", emoji: "🛹", sound: "咕噜咕噜！", prompt: "站稳才能向前滑", audio: "/audio/skateboard.mp3", effect: "/audio/effects/skateboard.mp3", effectDuration: 3600, effectRepeats: 1, lesson: "/audio/lessons/skateboard.mp3", color: "#F2DFD3", accent: "#A96845" },
      { name: "蒸汽火车", pinyin: "zhēng qì huǒ chē", emoji: "🚂", sound: "呜——！", prompt: "烟囱冒出白白的气", audio: "/audio/locomotive.mp3", effect: "/audio/effects/locomotive.mp3", effectDuration: 4200, effectRepeats: 1, lesson: "/audio/lessons/locomotive.mp3", color: "#E3E4EA", accent: "#626A78" },
      { name: "拖拉机", pinyin: "tuō lā jī", emoji: "🚜", sound: "突突突！", prompt: "田野里的好帮手", audio: "/audio/tractor.mp3", effect: "/audio/effects/tractor.mp3", effectDuration: 4200, effectRepeats: 1, lesson: "/audio/lessons/tractor.mp3", color: "#E2EEC8", accent: "#6F8E36" },
      { name: "赛车", pinyin: "sài chē", emoji: "🏎️", sound: "嗖——！", prompt: "安全赛道上跑得快", audio: "/audio/racecar.mp3", effect: "/audio/effects/racecar.mp3", effectDuration: 3400, effectRepeats: 1, lesson: "/audio/lessons/racecar.mp3", color: "#FFE0DD", accent: "#C95049" },
      { name: "帆船", pinyin: "fān chuán", emoji: "⛵", sound: "呼啦呼啦！", prompt: "风儿推着帆船走", audio: "/audio/sailboat.mp3", effect: "/audio/effects/sailboat.mp3", effectDuration: 4200, effectRepeats: 1, lesson: "/audio/lessons/sailboat.mp3", color: "#DBEFF8", accent: "#3B86A4" },
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
      { name: "甜瓜", pinyin: "tián guā", emoji: "🍈", sound: "香香甜甜", prompt: "里面藏着许多小种子", audio: "/audio/melon.mp3", effect: "/audio/features/melon.mp3", effectDuration: 6200, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/melon.mp3", color: "#EAF1C9", accent: "#788E3D" },
      { name: "牛油果", pinyin: "niú yóu guǒ", emoji: "🥑", sound: "绿绿软软", prompt: "中间有一颗大果核", audio: "/audio/avocado.mp3", effect: "/audio/features/avocado.mp3", effectDuration: 6200, effectRepeats: 1, effectVolume: 0.88, lesson: "/audio/lessons/avocado.mp3", color: "#DFEBC8", accent: "#5F823D" },
    ],
  },
  dinosaurs: {
    label: "恐龙",
    icon: "🦕",
    items: [
      { name: "霸王龙", pinyin: "bà wáng lóng", emoji: "🦖", sound: "低沉轰鸣", prompt: "两条后腿跑得快", scientificCall: "/audio/dinosaurs/calls/tyrannosaurus-scientific-call.mp3", callDuration: 2750, storyAudio: "/audio/dinosaurs/tyrannosaurus-story.mp3", storyDuration: 11900, shortAudio: "/audio/dinosaurs/short/tyrannosaurus-intro.mp3", shortDuration: 5320, color: "#F7DFC3", accent: "#A95F35" },
      { name: "三角龙", pinyin: "sān jiǎo lóng", emoji: "🦕", sound: "三只尖角", prompt: "头上像戴着大盾牌", storyAudio: "/audio/dinosaurs/triceratops-story.mp3", storyDuration: 11880, shortAudio: "/audio/dinosaurs/short/triceratops-intro.mp3", shortDuration: 7220, color: "#DDECCB", accent: "#62864E" },
      { name: "腕龙", pinyin: "wàn lóng", emoji: "🦕", sound: "脖子长长", prompt: "能吃到高高的树叶", storyAudio: "/audio/dinosaurs/brachiosaurus-story.mp3", storyDuration: 10460, shortAudio: "/audio/dinosaurs/short/brachiosaurus-intro.mp3", shortDuration: 5350, color: "#E1EFD4", accent: "#5F884F" },
      { name: "剑龙", pinyin: "jiàn lóng", emoji: "🦕", sound: "背板一排排", prompt: "尾巴还有四根尖刺", storyAudio: "/audio/dinosaurs/stegosaurus-story.mp3", storyDuration: 10150, shortAudio: "/audio/dinosaurs/short/stegosaurus-intro.mp3", shortDuration: 6860, color: "#E6E4F5", accent: "#7469A7" },
      { name: "迅猛龙", pinyin: "xùn měng lóng", emoji: "🦖", sound: "啾叫与气声", prompt: "脚上有弯弯的爪子", scientificCall: "/audio/dinosaurs/calls/velociraptor-scientific-call.mp3", callDuration: 2350, storyAudio: "/audio/dinosaurs/velociraptor-story.mp3", storyDuration: 16510, shortAudio: "/audio/dinosaurs/short/velociraptor-intro.mp3", shortDuration: 6120, color: "#F3E1C5", accent: "#9A6A37" },
      { name: "甲龙", pinyin: "jiǎ lóng", emoji: "🦕", sound: "穿着铠甲", prompt: "尾巴像一把大锤", storyAudio: "/audio/dinosaurs/ankylosaurus-story.mp3", storyDuration: 9910, shortAudio: "/audio/dinosaurs/short/ankylosaurus-intro.mp3", shortDuration: 5590, color: "#E0E8CF", accent: "#63794B" },
      { name: "副栉龙", pinyin: "fù zhì lóng", emoji: "🦕", sound: "低沉号角声", prompt: "像一根弯弯的管子", scientificCall: "/audio/dinosaurs/calls/parasaurolophus-scientific-call.mp3", callDuration: 3050, storyAudio: "/audio/dinosaurs/parasaurolophus-story.mp3", storyDuration: 14130, shortAudio: "/audio/dinosaurs/short/parasaurolophus-intro.mp3", shortDuration: 5180, color: "#F6DFC9", accent: "#B36743" },
      { name: "棘龙", pinyin: "jí lóng", emoji: "🦖", sound: "背上高高的帆", prompt: "长嘴巴像鳄鱼", storyAudio: "/audio/dinosaurs/spinosaurus-story.mp3", storyDuration: 9600, shortAudio: "/audio/dinosaurs/short/spinosaurus-intro.mp3", shortDuration: 5660, color: "#D8EAE8", accent: "#4E817D" },
      { name: "无齿翼龙", pinyin: "wú chǐ yì lóng", emoji: "🪽", sound: "翅膀大大", prompt: "乘着风在天空滑翔", storyAudio: "/audio/dinosaurs/pteranodon-story.mp3", storyDuration: 12530, shortAudio: "/audio/dinosaurs/short/pteranodon-intro.mp3", shortDuration: 6460, color: "#DCEBFA", accent: "#557FA9" },
    ],
  },
};

const motionByName: Record<string, MotionKey> = {
  小狗: "play",
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
  小兔子: "leap",
  小乌龟: "waddle",
  小鱼: "sail",
  小猴子: "bounce",
  小熊: "nod",
  大熊猫: "bounce",
  蝴蝶: "fly",
  小蜜蜂: "fly",
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
  出租车: "drive",
  货车: "drive",
  火箭: "soar",
  滑板: "zip",
  蒸汽火车: "chug",
  拖拉机: "drive",
  赛车: "zip",
  帆船: "sail",
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
  甜瓜: "split",
  牛油果: "sway",
  霸王龙: "stomp",
  三角龙: "charge",
  腕龙: "graze",
  剑龙: "tail-swing",
  迅猛龙: "prowl",
  甲龙: "club",
  副栉龙: "crest-call",
  棘龙: "sail-stride",
  无齿翼龙: "glide",
};

export default function Home() {
  const [category, setCategory] = useState<CategoryKey>("animals");
  const [index, setIndex] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [lessonOn, setLessonOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [motionCycle, setMotionCycle] = useState(0);
  const [playStage, setPlayStage] = useState<PlayStage | null>(null);
  const [showHint, setShowHint] = useState(true);
  const pointerStart = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const speakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const audioResolve = useRef<(() => void) | null>(null);
  const speechResolve = useRef<(() => void) | null>(null);
  const playbackSession = useRef(0);

  const items = categories[category].items;
  const item = items[index];
  const usesFeatureTeaching = category === "fruits" || category === "dinosaurs";
  const motion = motionByName[item.name] ?? "bounce";

  useEffect(() => {
    let savedLessonOn = true;
    try {
      savedLessonOn = window.localStorage.getItem(LESSON_PREFERENCE_KEY) !== "off";
    } catch {
      // Storage may be unavailable in privacy-restricted browsers; keep the safe default.
    }
    const preferenceTimer = window.setTimeout(() => setLessonOn(savedLessonOn), 0);
    return () => window.clearTimeout(preferenceTimer);
  }, []);

  useEffect(() => {
    return () => {
      if (speakingTimer.current) clearTimeout(speakingTimer.current);
      if (motionTimer.current) clearTimeout(motionTimer.current);
      stageTimers.current.forEach(clearTimeout);
      playbackSession.current += 1;
      audioPlayer.current?.pause();
      audioResolve.current?.();
      window.speechSynthesis?.cancel();
      speechResolve.current?.();
    };
  }, []);

  const cancelPlayback = () => {
    playbackSession.current += 1;
    audioPlayer.current?.pause();
    audioResolve.current?.();
    window.speechSynthesis?.cancel();
    speechResolve.current?.();
    if (speakingTimer.current) clearTimeout(speakingTimer.current);
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];
    setIsSpeaking(false);
    setPlayStage(null);
  };

  const stopMotion = () => {
    if (motionTimer.current) clearTimeout(motionTimer.current);
    setIsAnimating(false);
  };

  const toggleLesson = () => {
    const nextLessonOn = !lessonOn;
    cancelPlayback();
    stopMotion();
    setLessonOn(nextLessonOn);
    try {
      window.localStorage.setItem(LESSON_PREFERENCE_KEY, nextLessonOn ? "on" : "off");
    } catch {
      // The switch still works for this visit when storage is unavailable.
    }
    window.navigator.vibrate?.(18);
  };

  const triggerMotion = () => {
    if (motionTimer.current) clearTimeout(motionTimer.current);
    setMotionCycle((current) => current + 1);
    setIsAnimating(true);
    setShowHint(false);
    window.navigator.vibrate?.(28);
    const activeStoryDuration = lessonOn ? item.storyDuration : item.shortDuration;
    const teachingDuration = activeStoryDuration
      ? activeStoryDuration + (item.callDuration ?? 0) + (item.scientificCall ? 420 : 0)
      : item.scientificCall
        ? (item.callDuration ?? 2500) + 12200
        : 3600;
    motionTimer.current = setTimeout(() => setIsAnimating(false), teachingDuration + 250);
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
        if (audioPlayer.current === audio) audioPlayer.current = null;
        if (audioResolve.current === finishClip) audioResolve.current = null;
        resolve();
      };

      audio.preload = "auto";
      audio.volume = volume;
      audio.onended = finishClip;
      audio.onerror = finishClip;
      audioPlayer.current = audio;
      audioResolve.current = finishClip;
      if (maxDuration) {
        speakingTimer.current = setTimeout(() => {
          audio.pause();
          finishClip();
        }, maxDuration);
      }
      void audio.play().catch(finishClip);
    })
  );

  const speakText = (text: string, session: number) => (
    new Promise<void>((resolve) => {
      if (session !== playbackSession.current || !("speechSynthesis" in window)) {
        resolve();
        return;
      }

      let finished = false;
      const finishSpeech = () => {
        if (finished) return;
        finished = true;
        speechResolve.current = null;
        if (speakingTimer.current) clearTimeout(speakingTimer.current);
        resolve();
      };
      const utterance = new SpeechSynthesisUtterance(text);
      const chineseVoices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("zh"));
      utterance.voice = chineseVoices.find((voice) => /xiaoxiao|xiaoyi|tingting|huihui|meijia|sinji/i.test(voice.name)) ?? chineseVoices[0] ?? null;
      utterance.lang = "zh-CN";
      utterance.rate = 0.82;
      utterance.pitch = 1.12;
      utterance.volume = 0.88;
      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;
      speechResolve.current = finishSpeech;
      speakingTimer.current = setTimeout(finishSpeech, Math.max(5000, text.length * 700));
      window.speechSynthesis.speak(utterance);
    })
  );

  const playAudio = async () => {
    if (!speakerOn || typeof window === "undefined") return;
    cancelPlayback();
    const session = playbackSession.current;
    setIsSpeaking(true);

    if (item.scientificCall) {
      setPlayStage("sound");
      await playClip(item.scientificCall, 1, session);
      if (session !== playbackSession.current) return;
      await new Promise<void>((resolve) => setTimeout(resolve, 380));
      if (session !== playbackSession.current) return;
    }

    const activeStoryAudio = lessonOn ? item.storyAudio : item.shortAudio;
    const activeStoryDuration = lessonOn ? item.storyDuration : item.shortDuration;
    if (activeStoryAudio) {
      setPlayStage("name");
      if (lessonOn) {
        stageTimers.current.push(setTimeout(() => {
          if (session === playbackSession.current) setPlayStage(item.scientificCall ? "lesson" : "sound");
        }, Math.min(2300, (activeStoryDuration ?? 10000) * 0.22)));
        if (!item.scientificCall) {
          stageTimers.current.push(setTimeout(() => {
            if (session === playbackSession.current) setPlayStage("lesson");
          }, Math.min(6100, (activeStoryDuration ?? 10000) * 0.56)));
        }
      } else if (!item.scientificCall) {
        stageTimers.current.push(setTimeout(() => {
          if (session === playbackSession.current) setPlayStage("sound");
        }, Math.min(2200, (activeStoryDuration ?? 5000) * 0.38)));
      }
      await playClip(activeStoryAudio, 0.94, session);
      stageTimers.current.forEach(clearTimeout);
      stageTimers.current = [];
      if (session !== playbackSession.current) return;
      setIsSpeaking(false);
      setPlayStage(null);
      return;
    }

    if (item.narration) {
      setPlayStage("name");
      await speakText(item.narration.name, session);
      if (session !== playbackSession.current) return;
      setPlayStage("sound");
      await speakText(item.narration.feature, session);
      if (session !== playbackSession.current) return;
      if (lessonOn) {
        setPlayStage("lesson");
        await speakText(item.narration.lesson, session);
        if (session !== playbackSession.current) return;
      }
      setIsSpeaking(false);
      setPlayStage(null);
      return;
    }

    setPlayStage("name");
    await playClip(item.audio ?? "", 0.9, session);
    if (session !== playbackSession.current) return;

    setPlayStage("sound");
    for (let repeat = 0; repeat < (item.effectRepeats ?? 0); repeat += 1) {
      await playClip(item.effect ?? "", item.effectVolume ?? 0.55, session, item.effectDuration);
      if (session !== playbackSession.current) return;
    }

    if (lessonOn) {
      setPlayStage("lesson");
      await playClip(item.lesson ?? "", 0.88, session);
      if (session !== playbackSession.current) return;
    }

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
        <div className="topbar-actions">
          <button
            className={lessonOn ? "lesson-toggle active" : "lesson-toggle"}
            type="button"
            aria-label={lessonOn ? "关闭小知识讲解" : "打开小知识讲解"}
            aria-pressed={lessonOn}
            onClick={toggleLesson}
          >
            <span className="lesson-toggle-icon" aria-hidden="true">💡</span>
            <span className="lesson-toggle-label">讲解</span>
            <span className="lesson-toggle-state">{lessonOn ? "开" : "关"}</span>
            <span className="lesson-switch" aria-hidden="true"><i /></span>
          </button>
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
        </div>
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
          aria-label={`${item.name}，点一下看动画并听${lessonOn ? "完整教学" : "名称和声音"}，左右滑动换卡片`}
        >
          <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="scene-cloud cloud-one" aria-hidden="true" />
          <span className="scene-cloud cloud-two" aria-hidden="true" />
          <span className="scene-ground" aria-hidden="true" />
          <AnimatedLearningScene
            category={category}
            name={item.name}
            fallbackEmoji={item.emoji}
            motion={motion}
            isActive={isAnimating}
            motionCycle={motionCycle}
            motionVariant={motionCycle % 3}
            playStage={playStage}
          />
          <span className={isSpeaking ? "sound-bubble visible" : "sound-bubble"} aria-hidden="true">
            {playStage === "name" ? "听名字" : playStage === "lesson" ? (item.scientificCall ? "听讲解" : "小知识") : item.scientificCall ? `科学拟声 · ${item.sound}` : item.sound}
          </span>
          <span className="word-group">
            <strong>{item.name}</strong>
            <span className="pinyin">{item.pinyin}</span>
          </span>
          <span className="tiny-prompt">{item.prompt}</span>
          {item.scientificCall && <span className="science-sound-note">科学拟声 · 依据近缘动物与发声结构模拟</span>}
          <span className={showHint ? "tap-hint" : "tap-hint subtle"}>
            <span className={isSpeaking ? "stage-icon" : "tap-icon"} aria-hidden="true">{isSpeaking ? "♪" : "☝️"}</span>
            {playStage === "name" ? "正在认识名称" : playStage === "sound" ? (item.scientificCall ? "正在听科学拟声" : usesFeatureTeaching ? "正在认识外形特征" : "正在听真实声音") : playStage === "lesson" ? (item.scientificCall ? "正在听柔和讲解" : "正在学小知识") : isAnimating ? "看，小动画动起来啦！" : lessonOn ? (item.scientificCall ? "点一点，听拟声和讲解" : item.storyAudio ? "点一点，听有声小故事" : "点一点，看动画、听讲解") : item.scientificCall ? "点一点，听拟声和名称" : usesFeatureTeaching ? "点一点，听名字和特征" : "点一点，听名字和声音"}
          </span>
          <span className="lesson-steps" aria-hidden="true">
            {item.scientificCall ? (
              <>
                <span className={playStage === "sound" ? "active" : ""}>① 拟声</span>
                <span className={playStage === "name" ? "active" : ""}>② 名称</span>
                {lessonOn && <span className={playStage === "lesson" ? "active" : ""}>③ 讲解</span>}
              </>
            ) : (
              <>
                <span className={playStage === "name" ? "active" : ""}>① 名称</span>
                <span className={playStage === "sound" ? "active" : ""}>② {usesFeatureTeaching ? "特征" : "声音"}</span>
                {lessonOn && <span className={playStage === "lesson" ? "active" : ""}>③ 小知识</span>}
              </>
            )}
          </span>
        </button>
      </section>

      <footer className="controls">
        <button className="round-button" type="button" onClick={() => changeCard(-1)} aria-label="上一张">‹</button>
        <div className="progress-overview" aria-label={`第 ${index + 1} 张，共 ${items.length} 张`}>
          <span className="progress-track" aria-hidden="true">
            <i style={{ width: `${((index + 1) / items.length) * 100}%` }} />
          </span>
          <span className="progress-count"><strong>{index + 1}</strong><span>/ {items.length}</span></span>
        </div>
        <button className="round-button" type="button" onClick={() => changeCard(1)} aria-label="下一张">›</button>
      </footer>
      <p className="swipe-tip"><span aria-hidden="true">↔</span> 左右滑动换一张</p>
      <a className="model-credit-link" href="/credits" target="_blank" rel="noreferrer">内容来源、许可与拟声说明</a>
    </main>
  );
}
