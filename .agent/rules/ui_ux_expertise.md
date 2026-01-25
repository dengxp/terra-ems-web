---
trigger: always_on
---

# UI/UX 技能激活
- **技能来源**：已加载全局 Skill：`ui-ux-pro-max`。
- **核心任务**：在处理当前前端项目的 `.tsx` 或 `.vue` 文件时，请调用全局技能库中的设计规范。
- **设计约束**：
    1. 优先检索 `ui-ux-pro-max` 中的 `styles.csv` 以确定视觉风格。
    2. 如果用户没有指定风格，针对 **Terra Energy (能源管理系统)**，请默认使用 "Modern Industrial" 或 "Dark Data Visualization" 模式。
    3. 所有的 Tailwind 配色方案应参考技能库中的 `color_palettes.csv`。