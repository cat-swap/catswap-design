# catswap-design 纪律

1. **token 唯一正本 = tokens/tokens.json**。任何颜色/字号/间距/动效变更：改 tokens.json + 新增一条 decisions/ 记录 + 跑 scripts/sync.sh。禁止手改 dist/ 生成物。
2. 例外（品牌渐变/币种色）必须登记在 tokens.json 的 exceptions 节——散落各端的例外一律回收入档。
3. patterns/ 是页面拼装范式：新页面照范式拼；范式缺先补 pattern（一条 md）再写页面。
4. decisions/ 一次拍板一条：日期/决定/背景/为什么/影响面，五要素齐全。
5. 本仓变更需 g1↔K3 双审（同主仓纪律）。
