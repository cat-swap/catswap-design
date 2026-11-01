# catswap-design

CatSwap 的设计语言正本仓——**多端单源**：前端（web）、文档站（docs）、未来的移动端全部从同一份 token 消费。

## 为什么独立
1. 多消费者要单源（web/docs/mobile 全吃同一套）
2. 设计知识 ≠ 代码（decisions/patterns 是知识库，代码仓装不下）
3. 版本化解耦（远期：token/组件发版，app 自决升级时机）
4. agent 纪律全覆盖（本仓同样有 AGENTS.md）

## 结构
- `tokens/tokens.json` —— **唯一正本**。改 token 只改这里，跑 `scripts/sync.sh` 分发到各端
- `decisions/` —— 设计决策档案：一次拍板一条 md（为什么这个色、为什么这个范式）
- `patterns/` —— 页面范式（表单/空态/列表/交易面板该长什么样），升格自评论区 UI 规则集

## 分发
```bash
./scripts/sync.sh   # 生成 web 的 CSS 变量段 + docs 的 CSS 变量段；各仓 build 前跑或 CI hook
```
分发只生成"各端格式"（CSS 变量/KMP 主题/…），不复制语义——语义只在 tokens.json 一处。

## 铁律
1. **改色/字号/间距 = 改 tokens.json + 一条 decision 记录**，禁止直接改各端生成物
2. 新页面照 patterns 拼，不重议范式；范式不足先补 pattern 再写页面
3. 例外色（品牌渐变/币种色）必须记在 exceptions 节，不允许散落

## 致谢

本仓的组织模式与工程实践参考了业界开源设计系统的成熟经验，感谢相关开源社区与项目的公开实践分享。
