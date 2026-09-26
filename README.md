# ClearCal — Contrast for Notion Calendar

[English below](#english)

Notion Calendarの配色をGoogle Calendar風にする、非公式Chrome拡張です。**白い背景のライトモードが既定**で、ダークモードにも切り替えられます。

- 予定を見分けやすい濃い色で表示
- 不在の予定は元の色系統を保った淡い背景と読みやすい文字で表示
- 予定名・時刻の文字色を背景に合わせて自動調整
- カレンダー、サイドバー、ツールバーの背景色を統一
- ワンクリックで元の配色に復元
- 予定の配置・サイズ・操作・同期先はそのまま

## 作ったきっかけ

Notion Calendarを使っていて、予定の背景色と文字色のコントラストが自分には弱く、予定名や時刻を読み取りづらく感じることがありました。そこで、使い慣れたGoogle Calendarの配色を参考に、自分が見やすい色に調整するために作った拡張です。

もともとは自分用ですが、同じように感じている人にも使ってもらえたらと思い、公開しました。見やすさには好みや環境による違いがあるので、まずは自分に合うか試してみてください。

## インストール

1. [最新版のリリース](https://github.com/takizawave/clearcal/releases/latest) から **clearcal.zip** をダウンロードして解凍します。
2. Chromeで `chrome://extensions` を開き、右上の「デベロッパーモード」をオンにします。
3. 「パッケージ化されていない拡張機能を読み込む」を押します。
4. 解凍した **clearcalフォルダ**を選択します。中のファイルは選択しません。ファイルがグレー表示でも正常です。
5. [Notion Calendar](https://calendar.notion.so/) を再読み込みします。
6. Chromeの拡張アイコンから、有効／無効とライト／ダークを変更できます。

Chrome Web Storeには公開していません。GitHubの「Code → Download ZIP」からソースを取得し、`manifest.json` があるフォルダを読み込むこともできます。ビルドやnpmインストールは不要です。

### 更新

新しいZIPを解凍し、現在読み込んでいるフォルダのファイルを置き換えます。`chrome://extensions` で拡張の再読み込みボタンを押し、Notion Calendarも再読み込みしてください。保存済みの配色設定は維持されます。

## 配色とコントラスト

| 対象 | ライト | ダーク |
| --- | --- | --- |
| カレンダー背景 | `#ffffff` | `#131314` |
| サイドバー・上部 | `#f8fafd` | `#1b1b1b` |
| 通常の文字 | `#1f1f1f` | `#e3e3e3` |
| 補助の文字 | `#444746` | `#c4c7c5` |
| 罫線 | `#dadce0` | `#333537` |
| 今日の強調 | `#0b57d0` | `#a8c7fa` |

ダークの主な色はGoogle Calendarの表示色を基準にしています。ライトはGoogle風のパレットです。予定は元の色相に近い10色＋グレーに変換します。Googleアカウントの色設定との自動同期や、完全な見た目の再現ではありません。

通常の予定名・時刻は、塗りに対して4.5:1以上となる文字色を計算します。枠線のみの予定は枠線表示を保ちます。罫線には文字の基準を適用していません。ドラッグ中・無効・半透明などの状態を含めた画面全体のWCAG準拠を保証するものではありません。

## プライバシー

- 対象サイトは `https://calendar.notion.so/*` のみ。
- 権限は `storage` のみで、有効／無効と配色モードを端末内に保存します。
- 予定要素のCSS色と不在を示すアイコンの形状を参照し、予定名・メールアドレス・イベント識別子の値は読み取りません。
- 拡張自体の外部通信、分析・トラッキング、リモートコード、カレンダーAPIへの書き込みはありません。
- オフにすると、拡張が追加したテーマ属性と色プロパティを削除します。

詳細は [PRIVACY.md](PRIVACY.md) を参照してください。

## 開発・検証

Node.js 18以上、配布用ZIPの作成にはPython 3を使います。追加依存はありません。

```sh
node --test tests/*.test.cjs
python3 scripts/package.py
```

ZIPは `dist/clearcal.zip` に生成されます。梱包対象はスクリプト内の許可リストに限定しています。

検証済み:

- 両テーマで塗り・枠線の予定色のコントラスト計算
- ローカルの実DOMコピー83件で予定名・時刻を測定：ダーク最低4.63:1、ライト最低4.79:1
- 予定の動的追加・色変更への追従
- 無効化時の復元、予定の位置とサイズが変わらないこと

検証に用いた実DOMコピーや個人のカレンダー情報は、このリポジトリと配布ZIPには含めていません。

実アプリ上のドラッグ・予定編集を含む網羅的な動作検証は未実施です。Notion CalendarのDOM/CSS変更で調整が必要になる場合があります。

## 不具合報告

[Issues](https://github.com/takizawave/clearcal/issues) へ、Chromeのバージョン、ライト／ダークの設定、再現手順をお知らせください。スクリーンショットを添付する場合は、予定名・メールアドレスなどを隠してください。

## ライセンス

[MIT](LICENSE)。Google / Notionの公式拡張ではなく、両社とは関係ありません。

---

## English

ClearCal is an unofficial Chrome extension that gives Notion Calendar a Google Calendar-inspired color palette. **Light mode with a white background is the default**, with an optional dark mode.

- Stronger event colors to help distinguish events
- Soft, tinted backgrounds and readable text for out-of-office events
- Event title and time colors adjusted for contrast against their backgrounds
- Consistent colors across the calendar, sidebar, and toolbar
- A toggle to restore Notion Calendar's original appearance
- No changes to event positions, sizes, interactions, or calendar sync

### Why I built it

While using Notion Calendar, I sometimes found the contrast between event backgrounds and text too low for me to comfortably read event titles and times. I built this extension for myself, taking inspiration from the Google Calendar colors I was used to.

It started as a personal tool, but I decided to share it for anyone who feels the same way. Readability depends on your preferences and setup, so give it a try and see whether it works for you.

### Installation

1. Download **clearcal.zip** from the [latest release](https://github.com/takizawave/clearcal/releases/latest) and extract it.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the extracted **clearcal folder**. Select the folder itself, not an individual file; grayed-out files in the folder picker are normal.
5. Reload [Notion Calendar](https://calendar.notion.so/).
6. Use the extension's toolbar popup to enable or disable it and switch between light and dark modes.

ClearCal is not currently listed on the Chrome Web Store. You can also download the source using GitHub's **Code → Download ZIP** and load the folder containing `manifest.json`. No build step or npm install is required.

To update, replace the files in the folder you loaded with those from the new ZIP, click the extension's reload button at `chrome://extensions`, and reload Notion Calendar. Your saved theme preference is preserved.

### Colors and contrast

| Element | Light | Dark |
| --- | --- | --- |
| Calendar background | `#ffffff` | `#131314` |
| Sidebar and toolbar | `#f8fafd` | `#1b1b1b` |
| Primary text | `#1f1f1f` | `#e3e3e3` |
| Secondary text | `#444746` | `#c4c7c5` |
| Grid lines | `#dadce0` | `#333537` |
| Today highlight | `#0b57d0` | `#a8c7fa` |

The main dark-mode colors are based on Google Calendar's displayed colors; light mode uses a Google-inspired palette. Events are mapped to ten colors plus gray, keeping close to their original hue. This does not sync color settings from your Google account or reproduce Google Calendar exactly.

For ordinary event titles and times, ClearCal calculates text colors with a contrast ratio of at least **4.5:1** against the event fill. Outline-only events retain their outline appearance. This text contrast threshold does not apply to grid lines, and it is not a claim of full WCAG compliance across every state, including dragging, disabled elements, or translucent content.

### Privacy

- Runs only on `https://calendar.notion.so/*`.
- Requests only the `storage` permission and saves the enabled state and theme choice locally.
- Inspects event CSS colors and the shape of the out-of-office icon, without reading event titles, email addresses, or event identifier values.
- Makes no network requests of its own and includes no analytics, tracking, remote code, or calendar API writes.
- Removes its theme attributes and added color properties when disabled.

See [PRIVACY.md](PRIVACY.md) for the privacy policy in Japanese.

### Development and testing

Use Node.js 18 or later to run the tests and Python 3 to build the ZIP. No additional dependencies are required.

```sh
node --test tests/*.test.cjs
python3 scripts/package.py
```

The ZIP is written to `dist/clearcal.zip`. The packaging script includes only explicitly listed files.

Validation includes contrast calculations for filled and outlined events in both themes; measurements of event titles and times across 83 events in a local DOM copy (minimum 4.63:1 in dark mode and 4.79:1 in light mode); dynamic event additions and color changes; and restoration of the original appearance without changing event positions or sizes.

The DOM copy used for testing and personal calendar information are not included in this repository or the release ZIP. Comprehensive testing of interactions such as dragging and editing events in the live app has not been completed. Changes to Notion Calendar's DOM or CSS may require updates to the extension.

### Reporting issues

Please include your Chrome version, theme choice, and steps to reproduce the problem in [GitHub Issues](https://github.com/takizawave/clearcal/issues). Hide event titles, email addresses, and other personal information in screenshots.

### License

[MIT](LICENSE). ClearCal is not an official Google or Notion extension and is not affiliated with either company.
