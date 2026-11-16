#!/usr/bin/env python3
"""把「时间 / 地点 / 参考来源」合并进 data/honors.yaml。

数据来源：
  1. docs/honors-backup/ctftime-mapping.json  —— 我逐条在 CTFtime 赛事页核过的事件
  2. docs/honors-backup/research-batch-*.md   —— 子任务检索的国内赛事（带官方来源 URL）

原则：
  * 只新增字段（date / sort / location / source），不改动 event、badges 等既有内容；
  * 重复执行安全（已存在这四个字段的行会被替换，不会叠加）；
  * 同一赛事有预赛/决赛两行时，默认取最晚的阶段，可用 OVERRIDES 指定；
  * 查不到的行保持原样，最后打印缺口清单。
"""
import json
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
YAML = ROOT / "data/honors.yaml"
BACKUP = ROOT / "docs/honors-backup"

# 需要人工指定阶段的条目：key -> 关键词（匹配该行时间/地点里的片段）
OVERRIDES = {
    ("2026", "AliCTF"): "Online",   # 按地点匹配：取线上赛那一行（决赛另计）
}

MONTH_RE = re.compile(r"^(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?")


def norm_time(raw: str):
    """返回 (display, sort) ；无法解析返回 (None, None)。"""
    t = raw.strip().replace("－", "–").replace("—", "–").replace("~", "–")
    t = re.sub(r"\s+", "", t)
    if not t:
        return None, None
    parts = re.split(r"[–]", t)
    start = parts[0]
    m = MONTH_RE.match(start)
    if not m:
        return None, None
    y, mo, d = m.group(1), m.group(2).zfill(2), m.group(3)
    sort = f"{y}.{mo}.{d.zfill(2) if d else '00'}"
    # 显示：统一成 2025.06.21 或 2025.06.21–23
    disp = f"{y}.{mo}" + (f".{d.zfill(2)}" if d else "")
    if len(parts) > 1:
        tail = parts[1].strip().lstrip(".")
        if not tail:
            pass
        elif re.fullmatch(r"\d{1,2}", tail):
            disp += f"–{tail.zfill(2)}"
        elif MONTH_RE.match(tail):
            mm = MONTH_RE.match(tail)
            ty, tmo, td = mm.group(1), mm.group(2).zfill(2), mm.group(3)
            if ty == y and tmo == mo and td:
                disp += f"–{td.zfill(2)}"
            elif ty == y and td:
                disp += f"–{tmo}.{td.zfill(2)}"
            else:
                disp += f"–{ty}.{tmo}" + (f".{td.zfill(2)}" if td else "")
        else:
            disp += f"–{tail}"
    return disp, sort


def norm_place(raw: str) -> str:
    s = raw.strip()
    if not s:
        return ""
    if re.search(r"在线|线上|网络|internet|online", s, re.I):
        return "Online"
    s = re.sub(r"[（(].*?[)）]", "", s).strip()      # 去掉括号补充说明
    for sep in ("，", ",", "·"):
        if sep in s:
            s = s.split(sep)[0].strip()
    stripped = re.sub(r"^(浙江省?|江苏省?|广东省?|河南省?|福建省?|北京市?|上海市?)", "", s).strip()
    return stripped if len(stripped) >= 2 else s


def norm_key(name: str) -> str:
    n = re.sub(r"[（(][^）)]*[）)]", "", name)      # 去掉括号补充（阶段/届次说明）
    n = re.sub(r"\s+", "", n)
    return n.strip()


def first_url(cell: str) -> str:
    m = re.search(r"https?://[^\s；;|，,）)]+", cell)
    return m.group(0) if m else ""


def parse_research():
    """解析 research-batch-*.md 的表格，返回 {(year, event): [rows...]}"""
    out = {}
    for f in sorted(BACKUP.glob("research-batch-*.md")):
        for line in f.read_text().splitlines():
            if not line.strip().startswith("|"):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 5:
                continue
            if cells[0] in ("条目名",) or set(cells[0]) <= set("-: "):
                continue
            name, year, when, place, url = cells[0], cells[1], cells[2], cells[3], cells[4]
            if not re.fullmatch(r"\d{4}", year):
                continue
            if "UNKNOWN" in when.upper() or "UNKNOWN" in place.upper():
                continue
            disp, sort = norm_time(when)
            if not disp:
                continue
            out.setdefault((year, norm_key(name)), []).append(
                {
                    "date": disp,
                    "sort": sort,
                    "location": norm_place(place),
                    "source": first_url(url),
                    "raw": f"{when} / {place}",
                }
            )
    return out


ALIASES = {
    # 研究稿用了「第47届世赛」的缩写，yaml 用的是「第四十七届世界技能大赛…」
    ("2024", "第四十七届世界技能大赛网络安全项目中国国家队选拔赛"): ("2024", "第47届世赛网络安全项目中国国家队选拔赛"),
}


def lookup(by_key, year, name):
    key = (year, norm_key(name))
    alias = ALIASES.get((year, name))
    if alias:
        rows = by_key.get((alias[0], norm_key(alias[1])))
        if rows:
            return rows
    if key in by_key:
        return by_key[key]
    acc = []
    for (y, k), rows in by_key.items():
        if y != year:
            continue
        if k.startswith(key[1]) or key[1].startswith(k):
            acc.extend(rows)
    return acc


def pick(rows, key):
    """同一赛事多阶段：默认取最晚的阶段。"""
    if not rows:
        return None
    want = OVERRIDES.get(key)
    if want:
        for r in rows:
            if r["location"] == want:
                return r
    return sorted(rows, key=lambda r: r["sort"])[-1]


def main():
    mapping = json.loads((BACKUP / "ctftime-mapping.json").read_text())["entries"]
    research = parse_research()          # {(year, norm_name): [rows]}

    manual = {
        # 研究稿口径无法机械解析的（年度榜不是比赛）
        # 第四届美团网络安全高校挑战赛：初赛（团队赛）2021-12-11、决赛（个人赛）2021-12-19，
        # 两条都线上；赛事页在 i春秋（265=初赛 / 266=决赛），这里取决赛日
        "2021|美团 CTF（个人 / 团队）": {
            "date": "2021.12.19", "sort": "2021.12.19", "location": "Online",
            "source": "https://www.ichunqiu.com/competition/detail/266",
        },
        # 研究稿里首个 URL 是战队官网自身，属于自证，换成联赛分站赛公告镜像
        "2025|第九届 XCTF 联赛积分榜": {
            "date": "2025.10", "sort": "2025.10.00", "location": "Online",
            "source": "https://unsafe.sh/go-286072.html",
        },
        "2025|CTFTIME TOP 50": {
            "date": "2025", "sort": "2025.12.31", "location": "",
            "source": "https://ctftime.org/stats/2025",
        },
    }

    text = YAML.read_text()
    lines = text.split("\n")
    out, i = [], 0
    filled, missing = [], []
    cur_year = None
    while i < len(lines):
        line = lines[i]
        ym = re.match(r"^  - year:\s*(\d{4})", line)
        if ym:
            cur_year = ym.group(1)
        em = re.match(r"^      - event:\s*(.+?)\s*$", line)
        if not em:
            out.append(line)
            i += 1
            continue
        name = em.group(1).strip().strip('"').strip("'")
        out.append(line)
        i += 1
        # 跳过紧随其后的旧 meta 行（幂等，重复执行不会叠加）
        while i < len(lines) and re.match(r"^\s{8}(date|sort|location|source):", lines[i]):
            i += 1

        key = f"{cur_year}|{name}"
        m = None
        if key in manual:
            m = manual[key]
        elif key in mapping:
            m = mapping[key]
        else:
            rows = lookup(research, cur_year, name)
            r = pick(rows, (cur_year, name))
            if r:
                m = {kk: r[kk] for kk in ("date", "sort", "location", "source")}

        if m:
            filled.append((key, m))
            out.append(f'        date: "{m["date"]}"')
            out.append(f'        sort: "{m["sort"]}"')
            if m.get("location"):
                out.append(f'        location: "{m["location"]}"')
            if m.get("source"):
                out.append(f'        source: "{m["source"]}"')
        else:
            missing.append(key)

    YAML.write_text("\n".join(out))

    print(f"已填充 {len(filled)} 条，缺口 {len(missing)} 条")
    print("\n缺口清单：")
    for k in missing:
        print("  -", k)


if __name__ == "__main__":
    main()
