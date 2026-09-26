#!/usr/bin/env python3
"""Package only reviewed extension files; never include DOM captures or .git."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

ROOT = Path(__file__).resolve().parent.parent
FILES = (
    'manifest.json', 'colors.js', 'content.js', 'theme.css',
    'popup.html', 'popup.css', 'popup.js', 'LICENSE', 'PRIVACY.md',
)
INSTALL = '''Chromeで chrome://extensions を開き、デベロッパーモードをオンにします。
「パッケージ化されていない拡張機能を読み込む」から、このcalendar-lookフォルダを選択します。
Notion Calendarを再読み込みします。既定はライトです。
拡張アイコンで有効／無効、ライト／ダークを変更できます。
更新時はChromeの拡張機能ページで再読み込みボタンを押してください。
保存済みの配色設定は維持されます。
https://github.com/takizawave/clearcal
'''

def main():
    manifest = json.loads((ROOT / 'manifest.json').read_text())
    for name in FILES:
        if not (ROOT / name).is_file():
            raise FileNotFoundError(name)
    destination = ROOT / 'dist' / 'calendar-look.zip'
    destination.parent.mkdir(exist_ok=True)
    with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
        for name in FILES:
            archive.write(ROOT / name, 'calendar-look/' + name)
        archive.writestr('calendar-look/INSTALL.txt', INSTALL)
    print(f'Built {destination.name} (v{manifest["version"]})')

if __name__ == '__main__':
    main()
