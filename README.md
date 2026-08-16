# エフィってこ！

毎朝3分、3つの問いとMBTI別のアドバイスで「自分ならできる」を育てるセルフトレーニングアプリです。

## 主な機能

- 3つの朝の問いに回答
- MBTIと今日の行動を加味した、朝・昼・夜の過ごし方アドバイス
- 自分の回答に合わせた賞賛コメント
- 結果カードの画像コピー・共有
- MBTIと継続日数を端末内に保存

## 開発

Node.js 22.13以上を使用します。

```bash
pnpm install
pnpm dev
pnpm build
```

## Cloudflareへデプロイ

Cloudflareへログインした後、ビルドとデプロイを実行します。

```bash
pnpm build
pnpm exec wrangler deploy
```

アプリは [vinext](https://github.com/cloudflare/vinext) とCloudflare Workersで動作します。
