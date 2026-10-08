# Privacy / プライバシー

ClearCal — Contrast for Notion Calendarは、Notion Calendarの配色を端末内で変更する拡張です。

## 参照するもの

`calendar.notion.so` と `calendar.notion.com` の予定要素をCSSセレクタで検出し、背景色・文字色・枠線色のスタイル値と、不在を示すアイコンの形状を参照します。予定名、説明、メールアドレス、イベント識別子の値を取得する処理はありません。

## 保存するもの

Chromeの `storage.local` に、拡張の有効／無効とライト／ダークの選択のみを保存します。カレンダーのデータは保存しません。設定はGoogleアカウントへ同期しません。

## 外部送信

拡張からのネットワーク送信、分析、広告、トラッキングはありません。Notion Calendar本体が行う通信は、この拡張とは別です。

## 権限

- `storage`: 表示設定を保存するため。
- 対象サイト: `https://calendar.notion.so/*` と `https://calendar.notion.com/*`。配色変更に必要なcontent scriptをこの2つのカレンダーサイトだけで実行します。

## 削除

拡張を無効にすると追加した配色が解除されます。Chromeからアンインストールすると拡張の保存設定が削除されます。

## 報告

問題はGitHub Issuesで報告できます。予定や認証情報などの非公開情報を投稿しないでください。
