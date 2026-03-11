@echo off
chcp 65001 >nul

REM === 配置区（请确保地址正确） ===
set REPO=git@github.com:team-su/team-su.github.io.git
set BRANCH=master

echo [1/5] 清理并重新构建站点...
if exist public rmdir /s /q public
hugo --minify

echo [2/5] 初始化 public 文件夹...
if not exist public (
    echo [错误] Hugo 构建失败，请检查源码。
    pause
    exit /b 1
)
cd public
git init

echo [3/5] 关联远程仓库: %REPO%
git remote add origin %REPO%
git checkout -b %BRANCH%

echo [4/5] 准备首次提交内容...
echo. > .nojekyll
git add -A
git commit -m "First initial push from local"

echo [5/5] 正在尝试首次推送 (可能需要输入 yes)...
echo 提示：如果卡住，请检查你的代理软件或 SSH Key 是否配置。
ssh -T git@github.com
git push -u origin %BRANCH% -f

:end
echo ---------------------------------------
echo 首次部署（从0到1）已完成！
echo 以后你只需要运行你之前的部署脚本即可。
cd ..
pause