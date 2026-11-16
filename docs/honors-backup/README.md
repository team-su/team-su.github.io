# 荣誉墙改版与数据补录 · 交接说明

改动日期：2026-11-15｜三件事都已完成，旧版可一键切回。

---

## 一、这次改了什么

### 1. About 页不再展示荣誉；导航：About 右边加 Honors、Tags 换成 SUCTF

- `content/page/about.md` 里的 `## 战队荣誉` 和 `{{< honors-preview >}}` 已删除，About 页现在只有队史自述 + 邮箱。
- SUCTF 页用 `hideTitle: true`（`layouts/_default/prose.html` 新增的参数）隐藏页面大标题；列表用 `.honors-hosted.suctf-list` 覆盖掉原来的底部留白和分隔线。
- 导航（`hugo.toml` 的 `[[menu.main]]`）现在是：Archives · Members · Pioneers · About · **Honors** · **SUCTF**。Tags 入口已删除（`/tags/` 页面还在，只是没有导航入口）。
- `layouts/shortcodes/honors-preview.html` 已删除（不再使用）；`honor-result-inline.html` 保留，`variant="classic"` 旧版版式还在用它。

### 2. `/page/honors/` 按 r3kapig「Selected Awards」重排

- **没有滑块**：60 条成绩按日期倒序平铺，页面正常滚动（和 r3kapig 一样的长列表）。
- 跨年处带**年份刻度**（`2026 ————` 这种细线 + 小号年份），切「冠军」筛选时没有冠军的年份刻度会自动隐藏。
- 「主办」区块从荣誉页移走，放到新的 **SUCTF 页**（`/page/suctf/`）。
- 版式：一张两列表，**没有表头**。赛事名一行、名次换到下一行，右侧「地点 · 时间」纯文字（不挂链接，来源只留在 honors.toml 里备查），**无框、无底色、无加粗**。
- 名次写法：**按你给的 demo 用英文**（`data/honors.toml` 里每个 badge 都有 `label`（中文）和 `en`（英文），页面渲染用 `en`）：
  - 冠军 / 第一名 → `🏆 1st`，金色文字（唯一带奖杯的档）
  - 一等奖 / 金奖 → `★ 1st Prize`，金色文字，不放奖杯
  - 亚军 / 第二名 → `🥈 2nd`，银色文字
  - 季军 / 第三名 → `🥉 3rd`，铜色文字
  - 三等奖 / 铜奖 / 优秀奖 → `3rd Prize` / `Bronze Award` / `Honorable Mention`，灰字无图标
  - 其余名次 → `7th`、`10th` 这类纯英文序数，灰字无图标
  - 带阶段的用括号：`1st (Quals)`、`3rd (Finals)`、`3rd (CTF)`、`2nd (Team)`、`3rd (Live Solo)`、`1st Prize (A/D)`
  - **前三名一律用冠/亚/季**（原数据里的「第一名 / 第二名 / 总排名第三 / 结业第三」已改成「冠军 / 亚军 / 总排名季军 / 结业季军」），**有中国特色的奖项保留中文**（如 `金长城奖`），笼统的等级/名次用英文（`1st`、`1st Prize`、`2nd`、`3rd Prize`）
  - 多条名次用 `/` 紧排：`7th (Finals)/10th (Quals)`
- 排序：按比赛日期倒序（最新在前），不再按年份分段；没有具体日期的行退回显示年份，不会留空。
- 右侧「地点 · 时间」是纯文字；要核验就把 `data/honors.toml` 里同一条的 `source` 复制出来打开。
- 顶部只留「全部 / 冠军」筛选：**冠军栏目 = 所有金色名次**（冠军、一等奖、金长城奖都算，16 条）；不显示统计数字，也不显示表头，年份刻度已去掉。
- 「主办」区块原样保留。
- 文件：`layouts/shortcodes/honors-wall.html`、`layouts/partials/honor-result-awards.html`（新，荣誉页专用渲染器）、`themes/su-theme/assets/css/main.css`（`.awards*` 段 + `.honor-place*`）。
- 渲染器是拆开的：荣誉页走 `honor-result-awards.html`，About 预览和 `variant="classic"` 旧版仍走 `honor-result-inline.html`，互不影响。

### 3. 59 条成绩逐条补「时间 / 地点 / 来源」

- 新增四个字段（均为字符串，排序字段自动生成）：
  ```yaml
      - event: 第九届 XCTF 国际网络攻防联赛总决赛
        date: "2025.10.26–10.28"   # 展示用
        sort: "2025.10.26"         # 排序用起点
        location: "宁波"
        source: "https://epaper.blnews.com.cn/html/2025-10/27/content_7102_18990471.htm"
  ```
- 覆盖 **58 / 59**：只有「XCTF SCTF 2019」还没有官方赛程（见第四节）。

### 3.1 按你的反馈做的数据修正

| 修正 | 依据 |
|---|---|
| `SCTF 2017` → 移到 2018 年，改名 `XCTF SCTF`，日期 2018.06.19–20 / Online | i春秋 SCTF 2018 赛事页：[competition/detail/151](https://www.ichunqiu.com/competition/detail/151)（「线上赛时间：2018-06-19 09:00 - 2018-06-20 21:00」，主办三叶草 Syclover） |
| 所有 XCTF 分站赛补前缀：`SCTF`→`XCTF SCTF`（2018/2021/2023）、`L3HCTF`→`XCTF L3HCTF`（2025） | 你的口径；原数据里 `XCTF SUSCTF 2022`、`XCTF ACTF 2022/2023`、`XCTF WMCTF 2020`、`XCTF SCTF 2019` 本来就有前缀 |
| `BYTECTF` 2021 = 线上赛：2021.10.16–17 / Online | 字节跳动官方公告「10月16/17日，我们初赛见」（赛事站 2021bytectf.xctf.org.cn）；官方赛程页 [anquan419.com/comp/10/58.html](https://www.anquan419.com/comp/10/58.html)（我这台机器连接被拒，你那边可以打开核对） |
| `矩阵杯网络安全大赛`：`冠军` → `★ 战队攻防对抗赛一等奖` + `人工智能挑战赛优秀奖` | i春秋矩阵杯赛事页 [competition/detail/332](https://www.ichunqiu.com/competition/detail/332)（首届矩阵杯设漏挖赛三赛道 + 战队攻防对抗赛 + 人工智能挑战赛） |
| 分站赛补 `XCTF` + 年份：`LilacCTF`→`XCTF LilacCTF 2026`、`RCTF`→`XCTF RCTF 2025/2024/2021`、`TPCTF`→`XCTF TPCTF 2023`、`WHCTF`→`XCTF WHCTF 2017`、`AliCTF`(2016)→`XCTF AliCTF 2016` | 你提供的官方战报：Lilac = 第十届 XCTF 分站赛（哈工大 Lilac 战队）、RCTF 2025 = 第十届序章（福大 ROIS）、RCTF 2024 = 第九届先导、TPCTF 2023 = 第八届（清华 Redbud × 北大 pkucc 联合体）、WHCTF 2017 = 第四届揭幕站（武大）、AliCTF 2016 = 第二届杭州站 |
| `XCTF SCTF` 三条同名会互相串（featured 按名字匹配），统一补年份：`XCTF SCTF 2018 / 2021 / 2023` | — |
| 强网拟态决赛的季军属 **CTF 赛道**，写作 `3rd (CTF)` | 决赛同名次分赛道（车联网 / AI / 数据安全等），标注赛道才不歧义 |
| `强网拟态` 拆两条：`强网拟态（预赛）` 2025.10.25–26 Online `🏆 1st (Quals)`；`强网拟态（决赛）` 2025.11.26–29 南京 `🥉 3rd (Finals)` | CTFtime [2952](https://ctftime.org/event/2952/) / [2999](https://ctftime.org/event/2999/)；决赛地点南京（紫金山实验室） |
| `国产 OS 漏洞挖掘赛`：名字保留，补 2024.01.17 / 武汉，名次改 `★ 一等奖` | 你给的公众号文章：[山石荣获全国首届开源软件网络安全攻防大赛一等奖](https://mp.weixin.qq.com/s/NKLLBek2zFENJjo901TJdA)（2024-01-17 国家网络安全基地闭幕颁奖，设麒麟/欧拉两条赛道，考国产 OS 的 0day 挖掘） |
- 完整来源表见下方第五节；检索过程与「依据摘录」在 `research-batch-A.md`、`-B.md`、`-C.md`。

---

## 二、文件清单

| 路径 | 作用 |
|---|---|
| `layouts/shortcodes/honors-wall.html` | 新版荣誉墙（r3kapig 式表格）+ `variant="classic"` 分发 |
| `layouts/partials/honors-wall-classic.html` | **旧版版式原件**（逐字保留） |
| `layouts/partials/honor-result-awards.html` | 荣誉页名次渲染（🏆/★/🥈/🥉，纯文字无框） |
| `themes/su-theme/assets/css/main.css` | 新增 `.awards*`；旧 `.honors-*` 未删 |
| `content/page/suctf.md` + `layouts/shortcodes/suctf-list.html` | SUCTF 页：**只有列表**（无标题、无文案、无底部留白），数据取自 honors.toml 的 `[[hosted]]` |
| `data/honors.toml` | 荣誉数据：只有 `hosted` + `years` 两块，没有 summary / preview_limit / featured |
| `docs/honors-backup/honors.yaml.bak-20261116` | 迁移前的 yaml 原件 |
| `docs/honors-backup/*.bak` | 改动前的 4 个文件快照（yaml、两个 shortcode、inline partial、CSS 段） |
| `docs/honors-backup/ctftime-*.json` | 从 CTFtime 抓的 209 个赛事的时间/地点原始数据 |
| `docs/honors-backup/ctftime-mapping.json` | 人工确认过的条目 ↔ CTFtime event id 映射 |
| `docs/honors-backup/merge_honors.py` | 数据合并脚本（幂等，可重跑） |
| `docs/honors-backup/research-batch-{A,B,C}.md` | 国内赛事检索稿（含每条的依据摘录与检索词） |

---

## 三、回滚（三种粒度，任选）

**① 只回滚版式（最快，改一个词）**

`content/page/honors.md` 里：

```
{{< honors-wall >}}                 →  {{< honors-wall variant="classic" >}}
```

已实测该分支可正常渲染旧版（年份分段 + 全部/冠军筛选）。

**② 连数据一起回滚**

```bash
cp docs/honors-backup/honors.yaml.bak-20261116 data/honors.toml   # 或从 git 取旧版
cp docs/honors-backup/honors-wall.html.bak layouts/shortcodes/honors-wall.html
cp docs/honors-backup/honors-preview.html.bak layouts/shortcodes/honors-preview.html
```

> 注意：回滚到旧的 `honors.yaml` 后要删掉 `data/honors.toml`（两个同名数据文件会撞车）；About 页的 `{{< honors-preview >}}` 也要一并加回 `content/page/about.md`。

**③ 回到改动前的提交**

```bash
git checkout -- data/honors.yaml layouts/shortcodes/ themes/su-theme/assets/css/main.css
```

> 新增的 `.awards*` CSS 是追加的，不与旧规则冲突：即使只回滚模板、不回滚 CSS，也不会串版。

---

## 四、还差 1 条

| 条目 | 已查实 | 还差 |
|---|---|---|
| XCTF SCTF 2019（亚军） | 是第五届 XCTF 国际联赛成都分站赛，Syclover 主办；SU 自己的 wp 发在先知 [xz.aliyun.com/t/5478](https://xz.aliyun.com/t/5478)，**2019-06-25 09:24** 发布；同赛季第五届总决赛 2019-10-29（合川） | 官方起止日：`sctf2019.xctf.org.cn` 已下线、Wayback 对本机 429 限流、i春秋只有 SCTF 2018 的赛事页。有截图/公告的话给我，我补两行就完事 |

填法：在这一条的 `event:` 下面补四行即可，模板会自动接住：

```yaml
        date: "2019.06.22–23"
        sort: "2019.06.22"
        location: "Online"
        source: "https://…核验链接…"
```

---

## 五、完整来源表（60 条，名次为页面实际渲染的文字）

| 年份 | 赛事 | 名次 | 时间 | 地点 | 来源（页面不显示，备查） |
|---|---|---|---|---|---|
| 2026 | 第十届“强网杯”全国网络安全挑战赛 | 3rd Prize (Online) | 2026.10.31–11.01 | Online | https://qiangwangbei.com/ |
| 2026 | 第四十八届世界技能大赛网络安全项目 | Silver Medal | 2026.09.23–09.26 | 上海 | https://worldskills2026.com/schedule |
| 2026 | AliCTF | 10th | 2026.01.31–02.01 | Online | https://xz.aliyun.com/ctf |
| 2026 | XCTF LilacCTF 2026 | 5th | 2026.01.24–26 | Online | https://ctftime.org/event/3071/ |
| 2025 | CTFTIME TOP 50 | 36th | 2025 | — | https://ctftime.org/stats/2025 |
| 2025 | HKCERTCTF Quals | 4th | 2025.12.19–21 | Online | https://ctftime.org/event/2998/ |
| 2025 | 强网拟态（预赛） | 1st (Quals) | 2025.10.25–26 | Online | https://ctftime.org/event/2952/ |
| 2025 | 强网拟态（决赛） | 3rd (CTF) | 2025.11.26–11.29 | 南京 | https://ctftime.org/event/2999/ |
| 2025 | XCTF RCTF 2025 | 5th | 2025.11.15–17 | Online | https://ctftime.org/event/2992/ |
| 2025 | 第九届 XCTF 联赛积分榜 | 1st | 2025.10 | Online | https://unsafe.sh/go-286072.html |
| 2025 | 第九届 XCTF 国际网络攻防联赛总决赛 | 3rd Prize/3rd (Live Solo) | 2025.10.26–10.28 | 宁波 | https://epaper.blnews.com.cn/html/2025-10/27/content_7102_18990471.htm |
| 2025 | WMCTF | 2nd | 2025.09.20–21 | Online | https://ctftime.org/event/2910/ |
| 2025 | 中华人民共和国第三届职业技能大赛网络安全项目 | 1st | 2025.09.20–09.22 | 郑州 | https://jnjd.mca.gov.cn/n324/n404/c1662004999980004191/content.html |
| 2025 | ImaginaryCTF | 13th | 2025.09.05–07 | Online | https://ctftime.org/event/2799/ |
| 2025 | TFCCTF | 6th | 2025.08.29–31 | Online | https://ctftime.org/event/2822/ |
| 2025 | DeadSec CTF | 13th | 2025.07.25–27 | Online | https://ctftime.org/event/2631/ |
| 2025 | XCTF L3HCTF | 1st | 2025.07.12–14 | Online | https://ctftime.org/event/2823/ |
| 2025 | DASCTF 上半年赛 | 1st | 2025.06.21 | Online | https://buuoj.cn/plugins/ctfd-matches/matches/215 |
| 2025 | 数字中国创新大赛数据安全产业积分争夺赛 | Bronze Award/10th | 2025.04.20 | 福州 | https://cstc.org.cn/info/1754/254128.htm |
| 2025 | WolvCTF | 13th | 2025.03.21–23 | Online | https://ctftime.org/event/2579/ |
| 2024 | 第四届网鼎杯线下总决赛 | 2nd | 2024.11.23–11.25 | 贵阳 | http://news.sohu.com/a/828673303_362042 |
| 2024 | 第四届网鼎杯 | 金长城奖 | 2024.10.29–11.04 | Online | http://www.gz.chinanews.com.cn/szfc/guiyang/2024-10-29/doc-iheinuzm7526047.shtml |
| 2024 | 羊城杯网络安全大赛 | 1st | 2024.09.11 | 广州 | http://gd.people.com.cn/n2/2024/0912/c123932-40974725.html |
| 2024 | 矩阵杯网络安全大赛 | 1st Prize (A/D)/Honorable Mention (AI) | 2024.06.26–06.28 | 青岛 | https://topics.gmw.cn/2024-06/24/content_37396925.htm |
| 2024 | 国产 OS 漏洞挖掘赛 | 1st Prize | 2024.01.17 | 武汉 | https://mp.weixin.qq.com/s/NKLLBek2zFENJjo901TJdA |
| 2024 | 熊猫杯网络安全大赛 | 1st | 2024.06.22–06.23 | 成都 | https://slcyxy.cuit.edu.cn/info/1021/1200.htm |
| 2024 | XCTF RCTF 2024 | 2nd | 2024.05.25–27 | Online | https://ctftime.org/event/2374/ |
| 2024 | 第四十七届世界技能大赛网络安全项目中国国家队选拔赛 | 1st | 2024.03.21–03.25 | 广州 | https://rgzn.cquet.edu.cn/info/1050/14430.htm |
| 2023 | XCTF TPCTF 2023 | 7th | 2023.11.25–27 | Online | https://ctftime.org/event/2161/ |
| 2023 | XCTF ACTF 2023 | 2nd | 2023.10.28–30 | Online | https://ctftime.org/event/2104/ |
| 2023 | 中华人民共和国第二届职业技能大赛网络安全项目 | 1st | 2023.09.16–09.19 | 天津 | https://www.cquet.edu.cn/info/1037/11066.htm |
| 2023 | 陇剑杯决赛 | 6th | 2023.09.15 | 兰州新区 | http://gs.people.com.cn/BIG5/n2/2023/0917/c183348-40573803.html |
| 2023 | 祥云杯线下决赛 | 2nd | 2023.09.09–09.10 | 长春 | https://news.cnjiwang.com/jwyc/202309/3769805.html |
| 2023 | 巅峰极客线下决赛 | 2nd | 2023.08.23 | 成都 | https://news.chengdu.cn/2023/0824/2368783.shtml |
| 2023 | WMCTF | 10th | 2023.08.19–21 | Online | https://ctftime.org/event/2061/ |
| 2023 | 巅峰极客线上赛 | 2nd | 2023.07.22 | Online | https://www.cnblogs.com/120211P/p/17573801.html |
| 2023 | XCTF SCTF 2023 | 8th | 2023.06.17–19 | Online | https://ctftime.org/event/2021/ |
| 2023 | 贵阳大数据网络安全精英对抗赛 | 4th | 2023.05.20–05.25 | 贵阳 | https://www.gywb.cn/system/2023/05/25/071379889.shtml |
| 2023 | 网鼎杯决赛 | 11th | 2023.04.14–04.15 | 杭州 | https://cernet.edu.cn/info/ji_shu_ju_le_bu/wlaq/202304/t20230420_2380539.shtml |
| 2023 | 第七届 XCTF 国际网络攻防联赛总决赛 | 7th | 2023.03.28–03.29 | 南京 | http://note.f5.pm/go-158022.html |
| 2023 | RWCTF 2023 体验赛 | 2nd | 2023.01.06–08 | Online | https://ctftime.org/event/1797/ |
| 2022 | XCTF ACTF 2022 | 5th | 2022.06.25–27 | Online | https://ctftime.org/event/1682/ |
| 2022 | XCTF SUSCTF 2022 | 1st | 2022.02.26–28 | Online | https://ctftime.org/event/1566/ |
| 2022 | RWCTF 2022 体验赛 | 1st | 2022.01.21–23 | Online | https://ctftime.org/event/1507/ |
| 2021 | XCTF SCTF 2021 | 2nd | 2021.12.25–27 | Online | https://ctftime.org/event/1539/ |
| 2021 | 强网拟态（预赛） | 2nd | 2021.10.23–10.25 | Online | https://www.163.com/dy/article/GLRVNQCI05388O9J.html |
| 2021 | BYTECTF | 10th | 2021.10.16–17 | Online | https://www.anquan419.com/comp/10/58.html |
| 2021 | XCTF RCTF 2021 | 7th | 2021.09.11–13 | Online | https://ctftime.org/event/1413/ |
| 2021 | 美团 CTF（个人 / 团队） | 1st (Solo)/2nd (Team) | 2021.12.19 | Online | https://www.ichunqiu.com/competition/detail/266 |
| 2020 | 强网杯线上赛 | 12th | 2020.08.22–08.23 | Online | http://news.hnr.cn/202009/14/147764.html |
| 2020 | XCTF WMCTF 2020 | 2nd | 2020.08.01–03 | Online | https://ctftime.org/event/1094/ |
| 2019 | CyBRICS CTF 中国区 | 5th | 2019.07.20–21 | Online | https://ctftime.org/event/836/ |
| 2019 | XCTF SCTF 2019 | 2nd | — | — | — |
| 2019 | KCTF 2019 Q2 | 2nd | 2019.06.10–06.24 | Online | https://www.4hou.com/posts/LY0p |
| 2018 | InCTF | 6th | 2018.10.06–07 | Online | https://ctftime.org/event/662/ |
| 2018 | XCTF SCTF 2018 | 8th | 2018.06.19–20 | Online | https://www.ichunqiu.com/competition/detail/151 |
| 2017 | XCTF WHCTF 2017 | 4th | 2017.09.16–09.17 | Online | https://www.anquanke.com/post/id/86858 |
| 2016 | 华山杯（决赛 / 初赛） | 7th (Finals)/10th (Quals) | 2016.09.24 | 西安 | https://sn.cri.cn/20160826/63fe9c20-7a69-102a-c691-d77df5aad94d.html |
| 2016 | XMAN 夏令营 | 3rd (Overall)/5th (A/D)/3rd (Graduation)/1st (Practice) | 2016.08.06–08.26 | Online | https://www.ichunqiu.com/xman/index/2016-8-18 |
| 2016 | XCTF AliCTF 2016 | 10th | 2016.06.04–06.06 | Online | https://ctftime.org/event/322/ |

---

## 六、交叉校验

研究稿和战队自己的博客目录名互相印证（博客 `content/post/<日期>-<赛事>` 是第二来源）：

| 赛事 | 研究/CTFtime 结论 | 博客目录 |
|---|---|---|
| WMCTF 2020 | 2020.08.01–03 | `2020-08-01-WMCTF` |
| 强网杯 2020 | 2020.08.22–23 | `2020-08-22-QWB` |
| SCTF 2021 | 2021.12.25–27 | `2021-12-25-SCTF` |
| SUSCTF 2022 | 2022.02.26–28 | `2022-2-28-SUSCTF` |
| 第七届 XCTF 总决赛 | 2023.03.28–29 | `2023-03-29-XCTFfinals` |
| 巅峰极客决赛 | 2023.08.23 | `2023-08-24-DFJKfinal` |
| ACTF 2023 | 2023.10.28–30 | `2023-10-28-ACTF` |
| RCTF 2024 | 2024.05.25–27 | `2024-05-27-RCTF` |
| 熊猫杯 2024 | 2024.06.22–23 | `2024-06-23-PDCTF` |

---

## 七、几处口径要你知道

1. **一个条目有预赛 + 决赛时，时间列取决赛**（强网拟态、数字中国、华山杯、网鼎杯）。两个阶段的名次都还在徽章里，没丢。
2. **强网拟态 2025 是第八届**（第九届预赛在 2026.11.06 收官、决赛拟 2026.12 南京）。如果要标届次，文案可以补「第八届」。
3. **第九届 XCTF 联赛积分榜不是单场比赛**，是 2025 赛季累计积分排名，所以地点写 Online、时间取赛季收官月 `2025.10`。
4. **网鼎杯「金长城奖」是个人奖**（组委会奖项设置：金鼎/银鼎/铜鼎/金键盘/金长城）。按你原记录保留，若想更严谨可改写成「金长城奖（个人）」。
5. **RWCTF 体验赛**用的是 CTFtime 的 UTC 日期；C 组用中文报道核到的是北京时间，两者差一天属正常口径差，不影响阅读。
6. **CTFTIME TOP 50 不是比赛**，`date: "2025"`、无地点，来源是年度榜页。
7. **矩阵杯拆成两个名次**：战队攻防对抗赛一等奖 + 人工智能挑战赛优秀奖（原来笼统写的「冠军」）。同一场赛事、同一时间地点。
8. **国产 OS 漏洞挖掘赛**按你的要求保留原名，只在备注里记了官方名「全国首届开源软件网络安全攻防大赛」（麒麟/欧拉赛道）。这条是你队友代表山石打的，署名仍挂在 SU 下。
9. **SCTF 2018 是后来补的**：原记录写在 2017，已按你的更正移到 2018，并补上「XCTF」前缀。

---

## 八、改动可审计

```
git diff --numstat themes/su-theme/assets/css/main.css   →  172  0   （纯新增，旧 .honors-* 一行没删）
data/honors.toml   →  顶层只剩 hosted / years；entries 60 条、badges 68 个
```

59 条赛事、67 个名次标签在新页面里逐条比对，**没有一条丢失**。
