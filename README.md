# 简历大冒险 · Resume Quest

贴一份招聘 JD，生成这个岗位的专属简历。8-bit 横版闯关风格。

## 怎么打开

| 版本 | 电脑 | 手机 |
|---|---|---|
| 本地离线 | `dist/简历大冒险.html` | `dist/简历大冒险-手机版.html` |
| 在线（带 Claude） | claude.ai Artifact 链接 | claude.ai Artifact 链接（手机版） |

- **本地离线版**：双击 HTML 文件即可。经历地图、JD 分析（中文 / 英文）、本地生成、导出、打印成 PDF 都能用。
- **在线版**：多两个功能：「Claude 精修措辞」和「导入旧简历」，档案还会存到你的私有云存档。
- **手机版**：关卡切换在屏幕底部，地图下面有 ◀ ▶ + A 的手柄，编辑框从底部弹出。电脑版在触屏设备上也会自动显示手柄。

## 三个关卡

| 关卡 | 做什么 |
|---|---|
| 1-1 经历地图 | 时间线 + 思维导图：每段经历是一根藤蔓，叶子是成就要点，金币是技能标签 |
| 1-2 JD 管道 | 粘贴 JD → 关键词金币（有 / 缺）+ 逐条需求对照表 |
| 1-3 专属简历 | 一键生成、纸面直接改、两种模板、导出 txt / md / html / PDF |

## 目录

```
resume-quest/
├─ src/index.html          源码（改这里）
├─ build.mjs               node build.mjs → 生成 dist/
├─ dist/简历大冒险.html            电脑版离线单文件（字体已内嵌）
├─ dist/简历大冒险-手机版.html     手机版离线单文件
├─ dist/artifact*.html            发布到 claude.ai 用的版本（电脑 / 手机）
├─ assets/fonts/           Fusion Pixel 像素字体（SIL OFL）
└─ docs/
   ├─ PRD.md               产品需求文档
   └─ 视觉规范.md           视觉规范
```

## 修改后重新构建

```bash
node build.mjs
```
