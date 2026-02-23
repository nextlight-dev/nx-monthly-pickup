# NX MONTHLY PICKUP

NEXTLIGHTが毎月ピックアップするおすすめ楽曲セレクション。

**https://pickup.nextlight.io**

## システム構成

```
nx-monthly-pickup/
├── index.html                     # エントリHTML（OGP設定含む）
├── vite.config.js                 # Vite設定
├── package.json                   # npm scripts
├── scripts/
│   └── fetch-playlist.py          # yt-dlpでYouTubeプレイリスト取得
├── public/
│   ├── nx_emblem.svg              # ファビコン
│   ├── nx_logo.svg                # ロゴ
│   ├── og-image.png               # OGP画像（1200x630）
│   ├── CNAME                      # カスタムドメイン設定
│   └── data/
│       ├── index.json             # 月一覧 + 最新月
│       ├── 2026-02.json           # 月別プレイリストデータ
│       ├── 2026-01.json
│       └── ...
├── src/
│   ├── main.js                    # データ読み込み・カード描画・月切替
│   └── style.css                  # 全スタイル
└── .github/workflows/
    ├── deploy.yml                 # mainへのpushで自動デプロイ
    └── update.yml                 # プレイリスト更新（手動実行）
```

### 技術スタック

- **Vite** + vanilla JS（フレームワークなし）
- **Python + yt-dlp** でYouTubeプレイリストのメタデータ取得
- **GitHub Pages** でホスティング（カスタムドメイン: pickup.nextlight.io）
- **GitHub Actions** で自動デプロイ + プレイリスト更新

### データの流れ

1. YouTubeプレイリストURL → `fetch-playlist.py` → `public/data/YYYY-MM.json`
2. `index.json` に月一覧を管理
3. `main.js` がデータを読み込み、カードをランダム順で描画

## プレイリスト更新手順

### GitHub上から更新（推奨）

ブラウザだけで完結します。

1. GitHubリポジトリの **Actions** タブを開く
2. 左メニューから **Update Playlist** を選択
3. **Run workflow** をクリック
4. 入力欄を設定:
   - **playlist_url**: YouTubeプレイリストのURL（デフォルトのままでもOK）
   - **month**: 対象月（例: `2026-03`）。空欄で当月
5. **Run workflow** 実行

実行後、自動で:
- プレイリストデータを取得 → JSONに保存
- `index.json` を更新
- コミット & プッシュ
- GitHub Pagesへ自動デプロイ

### ローカルから更新

```bash
# デフォルトプレイリスト・当月
npm run fetch

# 特定の月を指定
python3 scripts/fetch-playlist.py 2026-03

# 別のプレイリストURL
python3 scripts/fetch-playlist.py --url "https://www.youtube.com/playlist?list=XXXXX"

# URLと月を指定
python3 scripts/fetch-playlist.py --url "https://www.youtube.com/playlist?list=XXXXX" 2026-03
```

## ローカル開発

```bash
npm install
npm run dev
```

## デプロイ

`main` ブランチにpushすると GitHub Actions が自動でビルド・デプロイします。
