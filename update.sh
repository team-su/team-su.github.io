#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# 先同步远程，避免 non-fast-forward 导致 push 失败。
# 构建检查放在 pull 之后，校验的才是这次真正要上线的内容。
echo "==> 同步远程"
git pull --rebase --autostash origin main

# 与 CI 相同的构建参数，先在本地发现内容错误。
if command -v hugo >/dev/null 2>&1; then
  echo "==> 本地构建检查"

  # 本地与 CI 的 Hugo 版本不一致时只告警：不阻断，但要说清构建结果可能有差异。
  ci_hugo=$(awk -F'"' '/hugo-version:/ {print $2; exit}' .github/workflows/deploy.yml 2>/dev/null || true)
  local_hugo=$(hugo version 2>/dev/null | sed -n 's/^hugo v\([0-9][0-9.]*\).*/\1/p')
  if [[ -n "$ci_hugo" && -n "$local_hugo" && "$ci_hugo" != "$local_hugo" ]]; then
    echo "警告：本地 Hugo $local_hugo 与 CI 的 $ci_hugo 不一致，构建结果可能有差异" >&2
  fi

  hugo --minify --buildFuture --cleanDestinationDir --gc >/dev/null
else
  echo "警告：未找到 hugo，跳过本地构建检查" >&2
fi

git add -A
if git diff --cached --quiet; then
  echo "没有改动需要提交。"
  exit 0
fi

git commit -m "update $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# 可选：等待并检查 GitHub Actions 部署结果，避免“push 成功但部署失败”。
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "==> 等待 GitHub Actions 部署"
  head_sha=$(git rev-parse HEAD)
  run_id=""
  for _ in {1..15}; do
    run_id=$(gh run list --workflow=deploy.yml --branch=main --limit=20 \
      --json databaseId,headSha \
      --jq ".[] | select(.headSha == \"$head_sha\") | .databaseId" | head -n1 || true)
    [[ -n "$run_id" ]] && break
    sleep 2
  done

  if [[ -n "$run_id" ]]; then
    gh run watch "$run_id" --exit-status
  else
    echo "未找到本次提交对应的部署运行，请手动检查：gh run list" >&2
    exit 1
  fi
else
  echo "提示：未安装或未登录 gh，跳过部署结果检查。"
  echo "查看部署状态：gh run list --workflow=deploy.yml"
fi
