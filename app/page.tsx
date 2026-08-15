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

const groupAdvice = {
  analyst: {
    name: "思考を成果に変える日",
    intro: "大きく考えられるあなたは、最初の一手を具体化した瞬間に強い。",
    morning: "最重要タスクに45分だけ集中。完成より、まず形にしよう。",
    daytime: "詰まったら目的を1行で書き直し、別ルートを1つ試そう。",
    evening: "できたことを事実で3つ記録。前進を見える化しよう。",
  },
  diplomat: {
    name: "想いを行動につなぐ日",
    intro: "意味や可能性を感じられるあなたは、誰かへの価値を思い出すと動ける。",
    morning: "今日の一歩が誰を笑顔にするか想像してから始めよう。",
    daytime: "ひとりで抱えず、応援してくれる人に進捗をひとこと共有。",
    evening: "心が動いた瞬間を1つメモ。明日のエネルギーにしよう。",
  },
  sentinel: {
    name: "着実な前進をつくる日",
    intro: "丁寧に積み上げられるあなたは、手順が見えるほど安心して力を出せる。",
    morning: "今日の一歩を3つの小さな工程に分け、1つ目から開始。",
    daytime: "予定の間に10分の余白を。整える時間も立派な前進やで。",
    evening: "完了にチェックを入れ、自分の継続力をしっかり称えよう。",
  },
  explorer: {
    name: "勢いを味方にする日",
    intro: "今この瞬間の感覚をつかめるあなたは、考え込むより触れてみると進める。",
    morning: "5分だけ手を動かしてスタート。面白くなったらそのまま続けよう。",
    daytime: "場所や順番を変えて気分転換。新鮮さを味方につけよう。",
    evening: "今日のナイスチャレンジを1つ選び、派手に自分を褒めよう。",
  },
};

const initialAnswers: Answers = { wonderful: "", future: "", action: "" };

function getGroup(type: string): keyof typeof groupAdvice {
  if (mbtiGroups.analyst.includes(type)) return "analyst";
  if (mbtiGroups.diplomat.includes(type)) return "diplomat";
  if (mbtiGroups.sentinel.includes(type)) return "sentinel";
  return "explorer";
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
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

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const chars = [...text];
  const lines: string[] = [];
  let line = "";

  chars.forEach((char) => {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);

  lines.slice(0, maxLines).forEach((current, index) => {
    const isLast = index === maxLines - 1 && lines.length > maxLines;
    ctx.fillText(isLast ? `${current.slice(0, -1)}…` : current, x, y + index * lineHeight);
  });
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
  const advice = mbti ? groupAdvice[getGroup(mbti)] : groupAdvice.diplomat;
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

  useEffect(() => {
    const savedMbti = window.localStorage.getItem("sunup-mbti");
    const savedDays = Number(window.localStorage.getItem("sunup-days"));
    if (savedMbti) setMbti(savedMbti);
    if (savedDays > 0) setDays(savedDays);
  }, []);

  const begin = () => {
    setAnswers(initialAnswers);
    setQuestionIndex(0);
    setShareStatus("");
    setScreen("question");
  };

  const goNext = () => {
    if (currentAnswer.trim().length < 2) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1);
    } else {
      setScreen("mbti");
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createShareImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, "#fff6a8");
    gradient.addColorStop(0.48, "#ffcf51");
    gradient.addColorStop(1, "#ff7b68");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.fillStyle = "rgba(255,255,255,.42)";
    ctx.beginPath();
    ctx.arc(955, 120, 215, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff4e8d";
    ctx.beginPath();
    ctx.arc(100, 1260, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#24154f";
    ctx.font = "900 46px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("SUNUP!", 76, 102);
    ctx.font = "700 28px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText(`${dateLabel}  •  MY MORNING EFFICACY`, 76, 150);

    ctx.fillStyle = "#fffdf5";
    drawRoundRect(ctx, 60, 205, 960, 1005, 52);

    ctx.fillStyle = "#ff4e8d";
    ctx.font = "900 26px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("TODAY, I BELIEVE IN ME.", 112, 278);
    ctx.fillStyle = "#24154f";
    ctx.font = "900 62px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("今日も、わたしならできる。", 112, 360);

    const cards = [
      ["MY GREATNESS", answers.wonderful, "#fff4a8"],
      ["MY BEST FUTURE", answers.future, "#ffd8e5"],
      ["TODAY'S ONE STEP", answers.action, "#e6dcff"],
    ];

    cards.forEach(([label, value, color], index) => {
      const y = 415 + index * 205;
      ctx.fillStyle = color;
      drawRoundRect(ctx, 108, y, 864, 168, 30);
      ctx.fillStyle = "#6d50ff";
      ctx.font = "900 22px Arial, 'Hiragino Sans', sans-serif";
      ctx.fillText(label, 148, y + 47);
      ctx.fillStyle = "#24154f";
      ctx.font = "700 30px Arial, 'Hiragino Sans', sans-serif";
      drawWrappedText(ctx, value, 148, y + 94, 770, 40, 2);
    });

    ctx.fillStyle = "#24154f";
    drawRoundRect(ctx, 108, 1040, 864, 102, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 26px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText(`${mbti} / ${mbtiName}`, 148, 1084);
    ctx.font = "700 23px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText(`今日のテーマ：${advice.name}`, 148, 1123);

    ctx.fillStyle = "#24154f";
    ctx.font = "800 26px Arial, 'Hiragino Sans', sans-serif";
    ctx.fillText("#朝のエフィカシー  #SUNUP", 76, 1290);

    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const downloadImage = async () => {
    const blob = await createShareImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sunup-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setShareStatus("シェア画像を保存したで！");
  };

  const shareImage = async () => {
    const blob = await createShareImage();
    if (!blob) return;
    const file = new File([blob], "sunup-morning.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "今日の朝エフィカシー",
          text: "今日も、わたしならできる。 #朝のエフィカシー #SUNUP",
        });
        setShareStatus("シェアの準備、ばっちり！");
      } catch {
        setShareStatus("");
      }
    } else {
      await downloadImage();
    }
  };

  return (
    <main className={`app-shell screen-${screen}`}>
      <div className="sun-orbit orbit-one" aria-hidden="true" />
      <div className="sun-orbit orbit-two" aria-hidden="true" />
      <div className="spark spark-one" aria-hidden="true">✦</div>
      <div className="spark spark-two" aria-hidden="true">✦</div>
      <div className="squiggle squiggle-one" aria-hidden="true">～～</div>

      <header className="topbar">
        <button className="brand" type="button" onClick={() => setScreen("welcome")} aria-label="トップへ戻る">
          <span className="brand-sun" aria-hidden="true"><span /></span>
          <span>SUNUP!</span>
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
                autoFocus
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
                  onClick={() => questionIndex === 0 ? setScreen("welcome") : setQuestionIndex((value) => value - 1)}
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
            <button className="back-button" type="button" onClick={() => { setQuestionIndex(2); setScreen("question"); }}>← 質問にもどる</button>
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
              <div><span>SUNUP!</span><small>MY MORNING EFFICACY</small></div>
              <b>{dateLabel}</b>
            </div>
            <h3>TODAY,<br />I BELIEVE <em>IN ME.</em></h3>
            <div className="answer-summary summary-yellow"><span>MY GREATNESS</span><p>{answers.wonderful}</p></div>
            <div className="answer-summary summary-pink"><span>MY BEST FUTURE</span><p>{answers.future}</p></div>
            <div className="answer-summary summary-purple"><span>TODAY&apos;S ONE STEP</span><p>{answers.action}</p></div>
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
            <p className="power-line">今日の合言葉：<b>「小さく始めた自分は、もう前に進んでる。」</b></p>
          </div>

          <div className="share-actions">
            <p>この気持ち、未来の自分にも残しとこ。</p>
            <div>
              <button className="secondary-button" type="button" onClick={downloadImage}><span>↓</span> 画像を保存</button>
              <button className="primary-button share-button" type="button" onClick={shareImage}><span>シェアする</span><span className="button-arrow">↗</span></button>
            </div>
            <span className="share-status" role="status">{shareStatus}</span>
          </div>

          <button className="restart-button" type="button" onClick={() => setScreen("welcome")}>明日もまた、自分を信じる →</button>
        </section>
      )}

      <footer className="site-footer"><span>SUNUP! / SELF EFFICACY TRAINING</span><span>YOU&apos;VE GOT THIS.</span></footer>
    </main>
  );
}
