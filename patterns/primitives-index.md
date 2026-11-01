# 正本组件清单（Primitives Index）

**用途**：移动端移植/docs 复用照此单进行——组件的稳定 API 以本清单+web 实现为正本，禁止从页面截图反推规范。
**来源**：盘点自 catswap-solana-web/src/components/ui/*（2026-11-01）。

| 组件 | 正本路径 | API 摘要 | 变体 | 状态 |
|---|---|---|---|---|
| Button | ui/button | isLoading | primary | stable |
| Card | ui/card |  | — | stable |
| Input | ui/input | error, helperText, label | — | stable |
| Modal | ui/modal | children, className, description, isOpen, lg, md, onClose, showCloseButton | — | stable |
| Select | ui/select | className, disabled, label, onChange, options, placeholder, size, value | — | stable |
| Tabs | ui/tabs | children, className, disabled, onValueChange, value | — | stable |

> 盘点规则：每条=路径+props 契约+token 引用；web 侧组件 API 变更需同步此表（decisions 记录）。
