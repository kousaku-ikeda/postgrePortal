# PostgreSQL 管理ポータル

PostgreSQLの接続・管理・クエリ実行ができるWebポータルアプリケーション。

## 概要

ブラウザからPostgreSQLに接続し、データベース・スキーマ・テーブルの管理およびSQLクエリの実行を行うためのローカル向けWebツール。

### 主な機能

- PostgreSQL接続（HOST / Database / User / Password / Port）
- データベース・スキーマ・テーブルのツリー表示
- データベース / スキーマ / テーブルの作成・削除
- SQLクエリの実行と結果表示

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React + TypeScript + Material-UI (MUI) + Tailwind CSS (Vite) |
| バックエンド | FastAPI + Python |
| DB接続 | psycopg2 |
| テスト (FE) | Vitest + React Testing Library |
| テスト (BE) | pytest + httpx |
| UIテスト | Playwright |

## ディレクトリ構成

```
posgre_portal/
├── frontend/          # React + TypeScript フロントエンド
│   ├── src/
│   └── package.json
└── backend/           # FastAPI バックエンド
     ├── app/
     ├── tests/
     └── requirements.txt
```

## セットアップ

### 前提条件

- Node.js 18 以上
- Python 3.10 以上
- PostgreSQL（`localhost:5432` でアクセス可能であること）

### バックエンド

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

または `start.bat` を実行する。

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

## 接続情報のデフォルト値

| フィールド | デフォルト値 |
|-----------|------------|
| HOST | `localhost` |
| Database | `postgres` |
| User | `postgres` |
| Port | `5432` |

## 注意事項

- 認証なし、ローカル環境専用のツールです
- 外部サービス・クラウドへの接続は不要です
- レスポンシブ対応はしていません
