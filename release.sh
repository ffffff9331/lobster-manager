#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

APP_NAME="OpenClawManager"
MAC_ARCH="aarch64"
CHANNEL="${1:-beta}"
VERSION="$(node -p "require('./package.json').version")"

if [ "$CHANNEL" = "stable" ]; then
  TAG="v${VERSION}"
  TITLE="v${VERSION}"
  ARCHIVE_NAME="${APP_NAME}_${VERSION}_${MAC_ARCH}.zip"
  PRERELEASE=false
else
  TAG="v${VERSION}-${CHANNEL}"
  TITLE="v${VERSION} ${CHANNEL^}"
  ARCHIVE_NAME="${APP_NAME}_${VERSION}-${CHANNEL}_${MAC_ARCH}.zip"
  PRERELEASE=true
fi

APP_PATH="src-tauri/target/aarch64-apple-darwin/release/bundle/macos/${APP_NAME}.app"
DMG_GLOB="src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/*.dmg"
ARCHIVE_PATH="${ARCHIVE_NAME}"
NOTES_FILE="release-notes/${TAG}.md"
CURRENT_BRANCH="$(git branch --show-current)"

if [ ! -f "$NOTES_FILE" ]; then
  echo "未找到发布说明文件: $NOTES_FILE" >&2
  echo "请先补齐 release-notes 后再执行发布脚本。" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "未检测到 gh CLI，请先安装并登录 GitHub。" >&2
  exit 1
fi

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "当前分支不是 main：$CURRENT_BRANCH" >&2
  echo "请确认是否应该从该分支发布。" >&2
fi

npm install
npm run tauri build -- --target aarch64-apple-darwin --bundles app,dmg

if [ ! -d "$APP_PATH" ]; then
  echo "未找到 .app 产物: $APP_PATH" >&2
  exit 1
fi

rm -f "$ARCHIVE_PATH"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$ARCHIVE_PATH"

if gh release view "$TAG" --repo ffffff9331/openclaw-manager >/dev/null 2>&1; then
  if [ "$PRERELEASE" = true ]; then
    gh release edit "$TAG" \
      --repo ffffff9331/openclaw-manager \
      --title "$TITLE" \
      --notes-file "$NOTES_FILE" \
      --prerelease
  else
    gh release edit "$TAG" \
      --repo ffffff9331/openclaw-manager \
      --title "$TITLE" \
      --notes-file "$NOTES_FILE"
  fi
else
  if [ "$PRERELEASE" = true ]; then
    gh release create "$TAG" "$ARCHIVE_PATH" \
      --repo ffffff9331/openclaw-manager \
      --title "$TITLE" \
      --notes-file "$NOTES_FILE" \
      --prerelease
  else
    gh release create "$TAG" "$ARCHIVE_PATH" \
      --repo ffffff9331/openclaw-manager \
      --title "$TITLE" \
      --notes-file "$NOTES_FILE"
  fi
fi

gh release upload "$TAG" "$ARCHIVE_PATH" $DMG_GLOB \
  --repo ffffff9331/openclaw-manager \
  --clobber

git push origin "$CURRENT_BRANCH"
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  git tag "$TAG"
fi
git push origin "$TAG" --force

echo "发布完成："
ls -lh "$ARCHIVE_PATH"
ls -lh $DMG_GLOB || true

echo "Tag: $TAG"
echo "Notes: $NOTES_FILE"
echo "已推送 tag，GitHub Actions 将继续构建 Windows / Linux 产物。"
