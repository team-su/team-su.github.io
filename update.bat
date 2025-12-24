@echo off
chcp 65001 >nul
REM === 配置区 ===
set REPO=git@github.com:team-su/team-su.github.io.git


echo [1/4] 构建 Hugo 站点...
hugo --gc --minify
if errorlevel 1 (
    echo Hugo 构建失败，请检查错误。
    pause
    exit /b 1
)

echo [2/4] 进入 public 目录...
cd public

echo [3/4] 创建 .nojekyll 文件...
echo > .nojekyll

echo [4/4] 提交并推送到 GitHub Pages...
git add -A
git commit -m "Deploy site on %date% %time%" || (
    echo 没有更改需要提交
    goto end
)
git push -f origin master

:end
echo 部署完成！
pause
