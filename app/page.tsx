"use client";

import { useEffect, useMemo, useState } from "react";

type Answers = {
  wonderful: string;
  future: string;
  action: string;
};

type Screen = "welcome" | "question" | "mbti" | "result";

const questions: Array<{
  key: keyof Answers;
  number: string;
  eyebrow: string;
  title: string;
  prompt: string;
  placeholder: string;
  color: string;
}> = [
  {
    key: "wonderful",
    number: "01",
    eyebrow: "NOTICE YOUR LIGHT",
    title: "自分の素晴らしいところは\n何ですか？",
    prompt: "小さなことでも大丈夫。自分に「いいね」を贈ろう。",
    placeholder: "例：人の話を最後まで聞ける。昨日も一歩前に進めた。",
    color: "yellow",
  },
  {
    key: "future",
    number: "02",
    eyebrow: "SEE THE BEST FUTURE",
    title: "自分の最高の未来とは\n何ですか？",
    prompt: "もう叶っているように、景色や気持ちまで描いてみよう。",
    placeholder: "例：好きな人たちと笑いながら、誇れる仕事をしている。",
    color: "pink",
  },
  {
    key: "action",
    number: "03",
    eyebrow: "MAKE TODAY AMAZING",
    title: "今日も最高の1日にするために\n何をしますか？",
    prompt: "今日の自分が、ほんまに動ける一歩を決めよう。",
    placeholder: "例：午前中に企画書の最初の1ページを書き上げる。",
    color: "purple",
  },
];

const mbtiTypes = [
  { type: "INTJ", name: "建築家" },
  { type: "INTP", name: "論理学者" },
  { type: "ENTJ", name: "指揮官" },
  { type: "ENTP", name: "討論者" },
  { type: "INFJ", name: "提唱者" },
  { type: "INFP", name: "仲介者" },
  { type: "ENFJ", name: "主人公" },
  { type: "ENFP", name: "運動家" },
  { type: "ISTJ", name: "管理者" },
  { type: "ISFJ", name: "擁護者" },
  { type: "ESTJ", name: "幹部" },
  { type: "ESFJ", name: "領事" },
  { type: "ISTP", name: "巨匠" },
  { type: "ISFP", name: "冒険家" },
  { type: "ESTP", name: "起業家" },
  { type: "ESFP", name: "エンターテイナー" },
] as const;

const mbtiGroups = {
  analyst: ["INTJ", "INTP", "ENTJ", "ENTP"],
  diplomat: ["INFJ", "INFP", "ENFJ", "ENFP"],
  sentinel: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  explorer: ["ISTP", "ISFP", "ESTP", "ESFP"],
};

const groupVoices = {
  analyst: {
    titleEndings: ["未来の輪郭になる日", "確かな道を描く日", "次の扉をひらく日", "静かな確信へ変わる日"],
    essence: [
      "遠くまで見渡せる知性は、まだ誰にも見えていない道へ光を引ける",
      "問いを深く抱ける強さは、混ざり合った景色から本質をすくい上げる",
      "頭の中に広がる地図は、最初の一歩を置いた瞬間に現実の道へ変わる",
    ],
  },
  diplomat: {
    titleEndings: ["誰かの希望へつながる日", "心の灯りになる日", "やさしい追い風になる日", "想いに翼が生える日"],
    essence: [
      "人の心にある小さな光を見つけられるあなたは、自分の願いにもあたたかな居場所をつくれる",
      "意味を感じる力は、何気ない一歩を誰かの希望へ結び直してくれる",
      "やさしさの奥にある強さは、迷いさえも未来へ向かう物語に変えていく",
    ],
  },
  sentinel: {
    titleEndings: ["揺るがない自信になる日", "明日の土台になる日", "確かな実りへ変わる日", "信頼をひとつ育てる日"],
    essence: [
      "丁寧に重ねた一日は、目立たなくても未来を支える強い地面になる",
      "守りたいものを大切にできる力は、今日の歩みに静かな安定を与えてくれる",
      "ひとつずつ確かめて進む姿は、昨日の自分にはなかった自信を育てている",
    ],
  },
  explorer: {
    titleEndings: ["軽やかな勢いになる日", "新しい景色を連れてくる日", "鮮やかな追い風に変わる日", "心を弾ませる日"],
    essence: [
      "今この瞬間の温度をつかめるあなたは、動き出した場所から世界を明るく塗り替えられる",
      "心が弾む方向を見つける感覚は、迷いを軽やかな一歩へ変える才能や",
      "触れて、試して、笑える強さは、予定になかった幸運まで今日へ連れてくる",
    ],
  },
};

const themeProfiles = {
  achievement: {
    keywords: ["完了", "終わ", "達成", "タスク", "todo", "仕事", "企画", "締切", "前倒し", "片付", "整理"],
    titleSeeds: ["小さな完了", "今日のひと区切り", "積み重ねた一手", "先回りした決意"],
    images: [
      "ひとつ終えるたび、胸の中に新しい余白が生まれ、その余白へ次の風が入ってくる",
      "目の前のひとつに心を置くことは、未来の自分へ静かな贈り物を渡すこと",
      "積み重ねは音を立てないけれど、振り返ったときに大きな景色をつくっている",
    ],
    morning: ["最初のひと区切りが、今日の空気を軽くしてくれる", "手をつけた瞬間から、止まっていた時間が味方へ変わる", "小さな完了をひとつ迎えるたび、自信の輪郭が濃くなる"],
    daytime: ["進んだ分だけ心に余白が生まれ、次の一手が自然に見えてくる", "焦りより手応えを数えると、午後の景色はぐっと明るくなる", "ひとつずつ閉じた扉の向こうで、新しい可能性が待っている"],
    evening: ["今日閉じられた小さな丸を、未来へ続く星として眺めよう", "やり切った数より、向き合った自分のまなざしを誇ろう", "今日の完了は、明日の自分が安心して立てる足場になる"],
    power: ["ひとつ終えるたび、未来は軽くなる。", "今日の一手は、明日の余白をつくっている。", "積み重ねた静けさは、やがて大きな自信になる。"],
  },
  recovery: {
    keywords: ["休", "眠", "疲", "ゆっくり", "整え", "余白", "散歩", "深呼吸", "穏やか", "無理しない"],
    titleSeeds: ["自分をいたわる時間", "静かな余白", "やさしい呼吸", "整えていく一歩"],
    images: ["立ち止まる時間は空白やなく、次の光を受け取るための静かな器になる", "力を抜いた心には、急いでいたとき見えなかった景色がそっと戻ってくる", "自分をいたわる選択は、未来へ長く歩くための勇気そのものや"],
    morning: ["急がない呼吸が、今日の自分にちょうどいい速度を教えてくれる", "朝の静けさをひとつ受け取るだけで、心の輪郭はゆっくり戻ってくる", "がんばる前に整えることも、立派な前進になる"],
    daytime: ["少し立ち止まるたび、本当に大切な方向が澄んで見えてくる", "余白を守ることが、午後の自分をやさしく支えてくれる", "力を抜いた分だけ、必要なエネルギーが静かに戻ってくる"],
    evening: ["今日守れた自分の心を、毛布のような言葉で包んであげよう", "できなかったことより、無理をさせなかった自分を称えよう", "休む勇気を選んだ今日は、明日の光をもう育てている"],
    power: ["休むことも、未来へ向かう美しい一歩。", "やさしい速度でも、わたしはちゃんと進んでいる。", "余白の中で、次の光は育っている。"],
  },
  connection: {
    keywords: ["家族", "子ども", "仲間", "友", "人", "会う", "話", "笑顔", "感謝", "尊敬", "応援"],
    titleSeeds: ["誰かを想う気持ち", "つながりのぬくもり", "交わした言葉", "やさしいまなざし"],
    images: ["誰かを想って選んだ一歩は、見えない場所でもあたたかな波紋を広げていく", "心から生まれた言葉は、相手だけでなく自分の朝にも光を戻してくれる", "つながりを大切にする姿は、今日という日にやわらかな意味を宿す"],
    morning: ["大切な誰かの笑顔を思い浮かべると、朝の一歩にあたたかな理由が生まれる", "心に浮かんだ人への想いが、今日のエネルギーをやさしく灯す", "自分へ向けたやさしさが、出会う人へ自然に広がっていく"],
    daytime: ["短い言葉でも、心をこめて渡せば午後の景色を変えられる", "誰かと交わす温度が、止まりかけた歩みにもう一度風をくれる", "ひとりで進む時間にも、応援してくれる存在の光は届いている"],
    evening: ["今日交わした笑顔をひとつ思い出し、そのぬくもりを自分にも返そう", "誰かを大切にできた自分の心を、今夜は静かに抱きしめよう", "今日届いたやさしさを数えると、一日はあたたかな物語になる"],
    power: ["やさしさは、めぐって自分の力になる。", "つながる心が、今日を明るくしていく。", "想いを渡すたび、未来はあたたかくなる。"],
  },
  learning: {
    keywords: ["学", "本", "読", "勉強", "研究", "資格", "知識", "練習", "習慣", "インプット"],
    titleSeeds: ["新しい気づき", "小さな学び", "ひらいた一冊", "育てている好奇心"],
    images: ["知らなかったことに出会うたび、世界の地図には新しい道が一本ずつ増えていく", "学びはすぐに答えにならなくても、必要な朝に芽を出す種として心へ残る", "好奇心が向いた先には、今の自分を少し越えていく扉が待っている"],
    morning: ["新しい言葉をひとつ迎えるだけで、朝の景色に知らなかった色が増える", "好奇心の火を小さく灯せば、学びは自然に歩き始める", "わからないことは、未来から届いた招待状かもしれない"],
    daytime: ["答えを急がず問いを楽しむと、午後の思考はしなやかに広がっていく", "ひとつの発見が、離れていた点と点を静かにつないでくれる", "学んだことを自分の言葉にすると、知識は頼れる力へ変わる"],
    evening: ["今日増えた小さな『わかった』を、未来の自分へそっと手渡そう", "まだ途中の問いも、そのまま明日へ連れていけばええ", "知ろうとした自分の姿勢が、今日いちばん美しい成長や"],
    power: ["好奇心は、未来の扉をひらく鍵。", "今日の一行が、明日の視界を広げる。", "問いを持つ自分は、もう成長の途中にいる。"],
  },
  creation: {
    keywords: ["作", "書", "描", "発信", "企画", "デザイン", "創", "撮", "編集", "表現"],
    titleSeeds: ["生まれかけのアイデア", "まだ白いページ", "心に浮かんだ色", "形にしたい想い"],
    images: ["まだ形のない想いは、手を動かした瞬間からこの世界に居場所を持ちはじめる", "完璧になる前の小さな表現にも、今のあなたにしか出せない温度がある", "白いページは不足ではなく、どんな未来も迎えられる自由そのものや"],
    morning: ["最初の線や一行が、眠っていた世界をそっと目覚めさせる", "うまくつくるより、心の温度をひとつ形にする朝にしよう", "まだ荒いアイデアほど、自由な可能性を抱えている"],
    daytime: ["途中で変わることも創造の一部。心が動く方向へ景色を更新していこう", "誰かの正解より、自分の中で光った瞬間を大切にしよう", "つくりながら見つかる答えが、午後の自分を遠くへ運んでくれる"],
    evening: ["今日生まれたものの中に、自分らしい光をひとつ見つけよう", "完成していない部分にも、明日へ続く美しい余韻がある", "形にしようとした勇気を、今夜は作品より先に称えよう"],
    power: ["わたしの一歩が、まだない景色をつくる。", "未完成の中にも、わたしの光は宿っている。", "心が動いた場所から、世界は生まれはじめる。"],
  },
  growth: {
    keywords: ["挑戦", "始め", "新し", "一歩", "行動", "変わ", "成長", "前進", "勇気", "できる"],
    titleSeeds: ["今日選んだ一歩", "胸に灯った決意", "新しい始まり", "昨日を越える勇気"],
    images: ["大きな変化はいつも、誰にも見えないほど小さな決意から始まっている", "一歩を選んだ心には、まだ見ぬ景色からもう追い風が届きはじめている", "昨日までの自分を責めずに、今日の自分を信じることが成長の扉をひらく"],
    morning: ["始めようと思えた心が、もう今日最初の前進になっている", "小さな一歩ほど、未来の方向を大きく変える力を持っている", "胸の中の『やってみたい』を、朝の光へそっと連れ出そう"],
    daytime: ["完璧でなくても進んだ跡は、午後の自分に確かな勇気を返してくれる", "迷いながら選んだ道にも、あなたにしか出会えない景色がある", "一度止まっても大丈夫。向き直るたびに歩みは強くなる"],
    evening: ["今日踏み出した自分へ、結果より先に大きな拍手を贈ろう", "うまくいったことも迷ったことも、全部が明日の翼になる", "昨日にはなかった勇気が、今日の自分の中でちゃんと育っている"],
    power: ["小さく踏み出した瞬間、未来はもう動いている。", "わたしの勇気は、今日の一歩で育っていく。", "昨日より一歩、それだけで今日は美しい。"],
  },
};

const traitGifts: Record<string, string> = {
  E: "人との間に熱を灯す力",
  I: "静けさの中で本音を育てる力",
  N: "まだ見えない可能性を描く力",
  S: "目の前の手応えを確かめる力",
  T: "物事の芯を澄んだ目で見つめる力",
  F: "心の温度を受け取り、やさしさへ変える力",
  J: "歩く道筋を整え、約束を守る力",
  P: "流れに応じて軽やかに羽ばたく力",
};

const initialAnswers: Answers = { wonderful: "", future: "", action: "" };

function getGroup(type: string): keyof typeof groupVoices {
  if (mbtiGroups.analyst.includes(type)) return "analyst";
  if (mbtiGroups.diplomat.includes(type)) return "diplomat";
  if (mbtiGroups.sentinel.includes(type)) return "sentinel";
  return "explorer";
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

function inlineSummary(value: string, length: number) {
  return truncate(value.replace(/\s+/g, " ").trim(), length);
}

function hashText(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickFrom<T>(items: readonly T[], seed: number, offset: number) {
  return items[(seed + offset * 17) % items.length];
}

function detectTheme(answers: Answers): keyof typeof themeProfiles {
  const sources = [answers.wonderful.toLowerCase(), answers.future.toLowerCase(), answers.action.toLowerCase()];
  let bestTheme: keyof typeof themeProfiles = "growth";
  let bestScore = 0;

  (Object.keys(themeProfiles) as Array<keyof typeof themeProfiles>).forEach((theme) => {
    const score = themeProfiles[theme].keywords.reduce((total, keyword) => (
      total
      + (sources[0].includes(keyword) ? 1 : 0)
      + (sources[1].includes(keyword) ? 2 : 0)
      + (sources[2].includes(keyword) ? 3 : 0)
    ), 0);
    if (score > bestScore) {
      bestTheme = theme;
      bestScore = score;
    }
  });

  return bestTheme;
}

function createDailyReport(answers: Answers, mbti: string, dateLabel: string, days: number) {
  const type = mbti || "ENFP";
  const group = groupVoices[getGroup(type)];
  const theme = themeProfiles[detectTheme(answers)];
  const seed = hashText(`${answers.wonderful}|${answers.future}|${answers.action}|${type}|${dateLabel}|${days}`);
  const wonderful = inlineSummary(answers.wonderful, 38) || "自分の中にある光";
  const future = inlineSummary(answers.future, 42) || "描きたい未来";
  const action = inlineSummary(answers.action, 46) || "今日選んだ一歩";
  const gifts = [...type].map((letter) => traitGifts[letter]).filter(Boolean);

  return {
    name: `${pickFrom(theme.titleSeeds, seed, 1)}が${pickFrom(group.titleEndings, seed, 2)}`,
    intro: [
      `「${wonderful}」と自分の光を見つけられたあなたは、もう今日の朝にひとつの灯りをともしてる。誰かに証明するためやなく、自分の声を自分で受け取れたこと。その静かな強さが、これからの一日を内側からあたためていくで。`,
      `${type}のあなたが持つ「${gifts[0]}」と「${gifts[2]}」は、今日もちゃんと息をしてる。${pickFrom(group.essence, seed, 3)}。急いで答えにならなくても、その気質は迷ったときに戻れる、あなた自身の方角や。`,
      `${pickFrom(theme.images, seed, 4)}。あなたが描いた「${future}」は遠い夢のままやなく、今日という時間へ光を送ってくれている。`,
      `そして「${action}」と決めた一歩は、その光へ手を伸ばした証や。大きく進める日も、ほんの少しだけの日もある。それでも、自分で選んだ方向を信じるかぎり、今日のあなたはもう昨日より前にいるで。`,
    ].join("\n\n"),
    morning: `${pickFrom(theme.morning, seed, 5)}。${gifts[0]}を味方に、「${inlineSummary(answers.action, 28)}」へ向かう最初の呼吸を、自分らしい速度で始めよう。`,
    daytime: `昼は${gifts[1]}が光る時間。${pickFrom(theme.daytime, seed, 6)}。朝に決めた一歩が揺らいでも、心が向き直った場所から何度でも今日を始められるで。`,
    evening: `夜は${gifts[2]}と${gifts[3]}を、自分自身へ返す時間。${pickFrom(theme.evening, seed, 7)}。今日を生きたあなたへ、結果より先に「ようやった」と伝えてな。`,
    powerLine: pickFrom(theme.power, seed, 8),
  };
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function getWrappedTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  const paragraphs = text.replace(/\r\n?/g, "\n").split("\n");

  paragraphs.forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }

    let line = "";
    [...paragraph].forEach((char) => {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    });
    lines.push(line);
  });

  return lines.length ? lines : [""];
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  ctx.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [mbti, setMbti] = useState("");
  const [days, setDays] = useState(1);
  const [shareStatus, setShareStatus] = useState("");

  const currentQuestion = questions[questionIndex];
  const currentAnswer = answers[currentQuestion?.key] ?? "";
  const mbtiName = mbtiTypes.find((item) => item.type === mbti)?.name ?? "";
  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ja-JP", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(new Date()),
    [],
  );
  const advice = useMemo(
    () => createDailyReport(answers, mbti, dateLabel, days),
    [answers, mbti, dateLabel, days],
  );
  const photoClass = screen === "question" ? `photo-question-${questionIndex + 1}` : `photo-${screen}`;

  useEffect(() => {
    const savedMbti = window.localStorage.getItem("sunup-mbti");
    const savedDays = Number(window.localStorage.getItem("sunup-days"));
    const frame = window.requestAnimationFrame(() => {
      if (savedMbti) setMbti(savedMbti);
      if (savedDays > 0) setDays(savedDays);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const resetScroll = () => {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };

  const begin = () => {
    setAnswers(initialAnswers);
    setQuestionIndex(0);
    setShareStatus("");
    setScreen("question");
    resetScroll();
  };

  const goNext = () => {
    if (currentAnswer.trim().length < 2) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1);
    } else {
      setScreen("mbti");
    }
    resetScroll();
  };

  const complete = () => {
    if (!mbti) return;
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = window.localStorage.getItem("sunup-last-date");
    const storedDays = Number(window.localStorage.getItem("sunup-days")) || 0;
    const nextDays = lastDate === today ? Math.max(storedDays, 1) : storedDays + 1;
    window.localStorage.setItem("sunup-mbti", mbti);
    window.localStorage.setItem("sunup-last-date", today);
    window.localStorage.setItem("sunup-days", String(nextDays));
    setDays(nextDays);
    setScreen("result");
    resetScroll();
  };

  const createShareImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const cards = [
      ["自分の素晴らしいところは？", answers.wonderful, "#fff4a8"],
      ["自分の最高の未来は？", answers.future, "#ffd8e5"],
      ["今日を最高の1日にするために何をする？", answers.action, "#e6dcff"],
    ] as const;
    const lineHeight = 40;
    const cardGap = 37;
    const cardsStartY = 415;

    ctx.font = "700 30px Arial, 'Hiragino Sans', sans-serif";
    const cardLayouts = cards.map(([label, value, color]) => {
      const lines = getWrappedTextLines(ctx, value, 770);
      return {
        label,
        color,
        lines,
        height: Math.max(168, 134 + (lines.length - 1) * lineHeight),
      };
    });
    const cardsHeight = cardLayouts.reduce((total, card) => total + card.height, 0)
      + cardGap * cardLayouts.length;
    const mbtiY = cardsStartY + cardsHeight + 10;
    const innerBottom = mbtiY + 170;
    const canvasHeight = Math.max(1350, innerBottom + 140);
    canvas.height = canvasHeight;

    try {
      const background = await loadCanvasImage("/backgrounds/result.webp");
      drawImageCover(ctx, background, canvas.width, canvasHeight);
    } catch {
      ctx.fillStyle = "#ffcf51";
      ctx.fillRect(0, 0, canvas.width, canvasHeight);
    }

    const photoVeil = ctx.createLinearGradient(0, 0, 1080, canvasHeight);
    photoVeil.addColorStop(0, "rgba(255,246,168,.55)");
    photoVeil.addColorStop(0.48, "rgba(255,207,81,.32)");
    photoVeil.addColorStop(1, "rgba(255,123,104,.28)");
    ctx.fillStyle = photoVeil;
    ctx.fillRect(0, 0, 1080, canvasHeight);

    ctx.fillStyle = "rgba(255,255,255,.42)";
    ctx.beginPath();
    ctx.arc(955, 120, 215, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff4e8d";
    ctx.beginPath();
    ctx.arc(100, canvasHeight - 90, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#24154f";
    ctx.font = "900 46px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("エフィってこ！", 76, 102);
    ctx.font = "700 28px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText(`${dateLabel}  •  MY MORNING EFFICACY`, 76, 150);

    ctx.fillStyle = "rgba(255,253,245,.48)";
    drawRoundRect(ctx, 60, 205, 960, innerBottom - 205, 52);

    ctx.fillStyle = "#ff4e8d";
    ctx.font = "900 26px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("TODAY, I BELIEVE IN ME.", 112, 278);
    ctx.fillStyle = "#24154f";
    ctx.font = "900 62px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("今日も、わたしならできる。", 112, 360);

    let cardY = cardsStartY;
    cardLayouts.forEach(({ label, color, lines, height }) => {
      ctx.fillStyle = color;
      drawRoundRect(ctx, 108, cardY, 864, height, 30);
      ctx.fillStyle = "#6d50ff";
      ctx.font = "900 22px Arial, 'Hiragino Sans', sans-serif";
      ctx.fillText(label, 148, cardY + 47);
      ctx.fillStyle = "#24154f";
      ctx.font = "700 30px Arial, 'Hiragino Sans', sans-serif";
      lines.forEach((line, index) => {
        ctx.fillText(line, 148, cardY + 94 + index * lineHeight);
      });
      cardY += height + cardGap;
    });

    ctx.fillStyle = "#24154f";
    drawRoundRect(ctx, 108, mbtiY, 864, 102, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 26px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText(`${mbti} / ${mbtiName}`, 148, mbtiY + 44);
    ctx.font = "700 23px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText(`今日のテーマ：${advice.name}`, 148, mbtiY + 83);

    ctx.fillStyle = "#24154f";
    ctx.font = "800 26px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("#朝のエフィカシー  #エフィってこ", 76, innerBottom + 80);

    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const copyImage = async () => {
    setShareStatus("");

    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setShareStatus("このブラウザは画像コピーに未対応やねん。シェアボタンを使ってな。");
      return;
    }

    const imagePromise = createShareImage().then((blob) => {
      if (!blob) throw new Error("画像を作成できませんでした");
      return blob;
    });

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": imagePromise }),
      ]);
      setShareStatus("画像をコピーしたで！入力欄でそのまま貼り付けてな。");
    } catch {
      setShareStatus("コピーできへんかったわ。ブラウザのクリップボード許可を確認してな。");
    }
  };

  const shareImage = async () => {
    const blob = await createShareImage();
    if (!blob) return;
    const file = new File([blob], "efittekoi-morning.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
        });
        setShareStatus("シェアの準備、ばっちり！");
      } catch {
        setShareStatus("");
      }
    } else {
      await copyImage();
    }
  };

  return (
    <main className={`app-shell screen-${screen}`}>
      <div className={`screen-photo ${photoClass}`} aria-hidden="true" />
      <div className="sun-orbit orbit-one" aria-hidden="true" />
      <div className="sun-orbit orbit-two" aria-hidden="true" />
      <div className="spark spark-one" aria-hidden="true">✦</div>
      <div className="spark spark-two" aria-hidden="true">✦</div>
      <div className="squiggle squiggle-one" aria-hidden="true">～～</div>

      <header className="topbar">
        <button className="brand" type="button" onClick={() => { setScreen("welcome"); resetScroll(); }} aria-label="トップへ戻る">
          <span className="brand-sun" aria-hidden="true"><span /></span>
          <span>エフィってこ！</span>
        </button>
        <div className="today-chip">
          <span className="today-dot" aria-hidden="true" />
          {dateLabel}
        </div>
      </header>

      {screen === "welcome" && (
        <section className="welcome-view page-view">
          <div className="welcome-copy">
            <p className="kicker"><span>3 MINUTES</span> MORNING EFFICACY</p>
            <h1>
              今日も、<br />
              <span className="marker-text">わたしなら</span><br />
              できる。
            </h1>
            <p className="welcome-lead">
              3つの問いで、自分への信頼をチャージ。<br />
              最高の未来に向かう一歩を、ここから始めよう。
            </p>
            <button className="primary-button start-button" type="button" onClick={begin}>
              <span>朝の3分をはじめる</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
            <div className="micro-note"><span aria-hidden="true">✓</span> 回答はこの端末の中だけ。安心して本音を書いてな。</div>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <div className="hero-sun">
              <div className="sun-face">
                <span className="eye left-eye" />
                <span className="eye right-eye" />
                <span className="smile" />
              </div>
              <span className="ray ray-1" /><span className="ray ray-2" />
              <span className="ray ray-3" /><span className="ray ray-4" />
              <span className="ray ray-5" /><span className="ray ray-6" />
            </div>
            <div className="pop-card card-belief"><b>I CAN</b><span>自分を信じる</span></div>
            <div className="pop-card card-future"><b>BEST</b><span>未来を描く</span></div>
            <div className="pop-card card-action"><b>GO!</b><span>今日、動く</span></div>
            <div className="pink-bubble">YES!</div>
          </div>

          <div className="welcome-footer">
            <div><b>{String(days).padStart(2, "0")}</b><span>DAYS WITH ME</span></div>
            <p>「できる」は、毎朝つくれる。</p>
          </div>
        </section>
      )}

      {screen === "question" && currentQuestion && (
        <section className={`question-view page-view theme-${currentQuestion.color}`}>
          <div className="progress-wrap" aria-label={`全4ステップ中${questionIndex + 1}ステップ目`}>
            <div className="progress-labels"><span>YOUR MORNING BOOST</span><b>{questionIndex + 1} / 4</b></div>
            <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / 4) * 100}%` }} /></div>
          </div>

          <div className="question-layout">
            <aside className="question-number" aria-hidden="true">
              <span>QUESTION</span>
              <b>{currentQuestion.number}</b>
            </aside>
            <div className="question-card">
              <p className="question-eyebrow">✦ {currentQuestion.eyebrow}</p>
              <h2>{currentQuestion.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
              <p className="question-prompt">{currentQuestion.prompt}</p>
              <label className="answer-label" htmlFor="morning-answer">あなたの言葉で</label>
              <textarea
                id="morning-answer"
                maxLength={180}
                value={currentAnswer}
                onChange={(event) => setAnswers((previous) => ({ ...previous, [currentQuestion.key]: event.target.value }))}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") goNext();
                }}
                placeholder={currentQuestion.placeholder}
              />
              <div className="answer-meta"><span>⌘ + Enter でも次へ</span><b>{currentAnswer.length} / 180</b></div>
              <div className="question-actions">
                <button
                  className="back-button"
                  type="button"
                  onClick={() => {
                    if (questionIndex === 0) {
                      setScreen("welcome");
                    } else {
                      setQuestionIndex((value) => value - 1);
                    }
                    resetScroll();
                  }}
                >
                  ← もどる
                </button>
                <button className="primary-button next-button" type="button" disabled={currentAnswer.trim().length < 2} onClick={goNext}>
                  <span>{questionIndex === 2 ? "MBTIを選ぶ" : "次の質問へ"}</span><span className="button-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {screen === "mbti" && (
        <section className="mbti-view page-view">
          <div className="progress-wrap" aria-label="全4ステップ中4ステップ目">
            <div className="progress-labels"><span>LAST STEP — ALMOST THERE!</span><b>4 / 4</b></div>
            <div className="progress-track"><span style={{ width: "100%" }} /></div>
          </div>
          <div className="mbti-heading">
            <p className="question-eyebrow">✦ YOUR DAILY STYLE</p>
            <h2>あなたのMBTIを<br /><span>教えてな。</span></h2>
            <p>今日の一歩を、あなたらしく実行するヒントに使うで。</p>
          </div>
          <div className="mbti-grid" role="radiogroup" aria-label="MBTIを選択">
            {mbtiTypes.map((item) => (
              <button
                type="button"
                key={item.type}
                className={mbti === item.type ? "mbti-option selected" : "mbti-option"}
                role="radio"
                aria-checked={mbti === item.type}
                onClick={() => setMbti(item.type)}
              >
                <b>{item.type}</b><span>{item.name}</span><i aria-hidden="true">✓</i>
              </button>
            ))}
          </div>
          <div className="mbti-actions">
            <button className="back-button" type="button" onClick={() => { setQuestionIndex(2); setScreen("question"); resetScroll(); }}>← 質問にもどる</button>
            <button className="primary-button finish-button" type="button" disabled={!mbti} onClick={complete}>
              <span>今日のメッセージを見る</span><span className="button-arrow">✦</span>
            </button>
          </div>
          <p className="mbti-note">※ MBTIは性格を決めつけるものではなく、今日の行動を考えるヒントとして使っています。</p>
        </section>
      )}

      {screen === "result" && (
        <section className="result-view page-view">
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
          </div>
          <div className="result-heading">
            <div className="result-badge">MORNING BOOST COMPLETE! <span>✓</span></div>
            <h2>めっちゃええやん。<br /><span>今日のあなた、最強やで。</span></h2>
            <p>
              「{truncate(answers.wonderful, 30)}」って言えるあなたは、もう自分の力をちゃんと見つけられてる。<br />
              未来を描いて、一歩まで決めた。あとは自分を信じて進むだけや。
            </p>
          </div>

          <div className="share-card" id="share-card">
            <div className="share-card-top">
              <div><span>エフィってこ！</span><small>MY MORNING EFFICACY</small></div>
              <b>{dateLabel}</b>
            </div>
            <h3>TODAY, I BELIEVE <em>IN ME.</em></h3>
            <div className="answer-summary summary-yellow"><span>自分の素晴らしいところは？</span><p>{answers.wonderful}</p></div>
            <div className="answer-summary summary-pink"><span>自分の最高の未来は？</span><p>{answers.future}</p></div>
            <div className="answer-summary summary-purple"><span>今日を最高の1日にするために何をする？</span><p>{answers.action}</p></div>
            <div className="share-card-bottom"><b>{mbti} <small>{mbtiName}</small></b><span>#朝のエフィカシー</span></div>
          </div>

          <div className="advice-card">
            <div className="advice-title-row">
              <div><span>FOR {mbti}</span><h3>{advice.name}</h3></div>
              <div className="type-stamp">{mbti}<small>{mbtiName}</small></div>
            </div>
            <p className="advice-intro">{advice.intro}</p>
            <div className="action-focus"><span>今日のフォーカス</span><b>「{truncate(answers.action, 74)}」</b></div>
            <div className="day-plan">
              <div><span className="time-icon morning-icon">AM</span><p><b>朝</b>{advice.morning}</p></div>
              <div><span className="time-icon day-icon">PM</span><p><b>昼</b>{advice.daytime}</p></div>
              <div><span className="time-icon night-icon">✓</span><p><b>夜</b>{advice.evening}</p></div>
            </div>
            <p className="power-line">今日の合言葉：<b>「{advice.powerLine}」</b></p>
          </div>

          <div className="share-actions">
            <p>画像をコピーして、チャットや投稿にそのまま貼り付けよ。</p>
            <div>
              <button className="secondary-button" type="button" onClick={copyImage}><span aria-hidden="true">⧉</span> 画像をコピー</button>
              <button className="primary-button share-button" type="button" onClick={shareImage}><span>シェアする</span><span className="button-arrow">↗</span></button>
            </div>
            <span className="share-status" role="status">{shareStatus}</span>
          </div>

          <button className="restart-button" type="button" onClick={() => { setScreen("welcome"); resetScroll(); }}>明日もまた、自分を信じる →</button>
        </section>
      )}

      <footer className="site-footer"><span>エフィってこ！ / SELF EFFICACY TRAINING</span><span>YOU&apos;VE GOT THIS.</span></footer>
    </main>
  );
}
