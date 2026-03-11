@echo off
chcp 65001 >nul

REM === 配置区 ===
set REPO=git@github.com:team-su/team-su.github.io.git
set BRANCH=master

echo [1/3] 正在构建 Hugo 站点...
hugo --minify
if errorlevel 1 (
    echo Hugo 构建失败，请检查错误。
    pause
    exit /b 1
)

echo [2/3] 进入 public 目录并检查改动...
if not exist public (
    echo [错误] 找不到 public 目录。
    pause
    exit /b 1
)
cd public

REM 核心改进 1：如果已有 .git，先尝试同步远程，防止“落后”导致卡死
if not exist .git (
    echo [初始化] 正在重新关联远程仓库...
    git init
    git remote add origin %REPO%
    git fetch origin
    git checkout -b %BRANCH% || git checkout -b %BRANCH% origin/%BRANCH%
)

echo. > .nojekyll
git add -A

REM 核心改进 2：强制提交并处理无变化的情况
git commit -m "Update site: %date% %time%" || echo 没有新的改动。

echo [3/3] 正在推送增量更新到 GitHub...
REM 建议使用 -f，因为静态博客的 public 历史没那么重要，确保能推上去才是第一位
git push origin %BRANCH%

:end
echo ---------------------------------------
echo 部署完成！
cd ..
pause