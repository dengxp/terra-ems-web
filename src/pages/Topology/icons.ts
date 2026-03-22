/**
 * 拓扑图自定义 SVG 图标
 *
 * 科技感线条风格，深色背景适配，带微光效果
 * 使用 data URI 格式，可直接作为 G6 节点的 iconSrc
 */

const svgToDataUri = (svg: string) =>
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** 工厂/企业图标 — 用能单元根节点 */
export const ICON_FACTORY = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">
    <path d="M6 40V22l10-8v8l10-8v8l10-8v18H6z" stroke="#13C2C2" stroke-width="1.8" fill="rgba(19,194,194,0.1)"/>
    <rect x="10" y="28" width="5" height="6" rx="0.5" stroke="#13C2C2" stroke-width="1" fill="rgba(19,194,194,0.15)"/>
    <rect x="20" y="26" width="5" height="8" rx="0.5" stroke="#13C2C2" stroke-width="1" fill="rgba(19,194,194,0.15)"/>
    <rect x="30" y="30" width="5" height="4" rx="0.5" stroke="#13C2C2" stroke-width="1" fill="rgba(19,194,194,0.15)"/>
    <path d="M42 12V8h-4v4" stroke="#13C2C2" stroke-width="1.2"/>
    <line x1="40" y1="8" x2="40" y2="18" stroke="#13C2C2" stroke-width="1"/>
  </g>
</svg>`);

/** 建筑/车间图标 — 用能单元子节点 */
export const ICON_BUILDING = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">
    <rect x="8" y="12" width="20" height="28" rx="1.5" stroke="#1890FF" stroke-width="1.5" fill="rgba(24,144,255,0.08)"/>
    <rect x="12" y="16" width="4" height="3" rx="0.5" stroke="#1890FF" stroke-width="0.8" fill="rgba(24,144,255,0.15)"/>
    <rect x="20" y="16" width="4" height="3" rx="0.5" stroke="#1890FF" stroke-width="0.8" fill="rgba(24,144,255,0.15)"/>
    <rect x="12" y="22" width="4" height="3" rx="0.5" stroke="#1890FF" stroke-width="0.8" fill="rgba(24,144,255,0.15)"/>
    <rect x="20" y="22" width="4" height="3" rx="0.5" stroke="#1890FF" stroke-width="0.8" fill="rgba(24,144,255,0.15)"/>
    <rect x="12" y="28" width="4" height="3" rx="0.5" stroke="#1890FF" stroke-width="0.8" fill="rgba(24,144,255,0.15)"/>
    <rect x="20" y="28" width="4" height="3" rx="0.5" stroke="#1890FF" stroke-width="0.8" fill="rgba(24,144,255,0.15)"/>
    <rect x="15" y="34" width="6" height="6" rx="0.5" stroke="#1890FF" stroke-width="1" fill="rgba(24,144,255,0.2)"/>
    <path d="M32 24l8-6v22h-8" stroke="#1890FF" stroke-width="1.2" fill="rgba(24,144,255,0.05)"/>
  </g>
</svg>`);

/** 网关/天线图标 */
export const ICON_GATEWAY = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">
    <rect x="14" y="26" width="20" height="14" rx="2" stroke="#52C41A" stroke-width="1.5" fill="rgba(82,196,26,0.08)"/>
    <circle cx="20" cy="33" r="1.5" fill="#52C41A" opacity="0.8"/>
    <circle cx="24" cy="33" r="1.5" fill="#52C41A" opacity="0.5"/>
    <circle cx="28" cy="33" r="1.5" fill="#52C41A" opacity="0.3"/>
    <line x1="24" y1="26" x2="24" y2="16" stroke="#52C41A" stroke-width="1.5"/>
    <circle cx="24" cy="14" r="2" stroke="#52C41A" stroke-width="1.2" fill="rgba(82,196,26,0.2)"/>
    <path d="M16 18a10 10 0 0 1 16 0" stroke="#52C41A" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M13 15a14 14 0 0 1 22 0" stroke="#52C41A" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M10 12a18 18 0 0 1 28 0" stroke="#52C41A" stroke-width="0.6" fill="none" opacity="0.15"/>
  </g>
</svg>`);

/** 齿轮/设备图标 — 用能设备 */
export const ICON_EQUIPMENT = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">
    <path d="M24 8l2.5 4.2a12 12 0 0 1 4.3 1.8l4.7-1.5 2 3.5-3.2 3.5a12 12 0 0 1 0 4.6l3.2 3.5-2 3.5-4.7-1.5a12 12 0 0 1-4.3 1.8L24 36l-2.5-4.2a12 12 0 0 1-4.3-1.8l-4.7 1.5-2-3.5 3.2-3.5a12 12 0 0 1 0-4.6l-3.2-3.5 2-3.5 4.7 1.5a12 12 0 0 1 4.3-1.8L24 8z"
      stroke="#FA8C16" stroke-width="1.5" fill="rgba(250,140,22,0.08)"/>
    <circle cx="24" cy="22" r="5" stroke="#FA8C16" stroke-width="1.2" fill="rgba(250,140,22,0.15)"/>
    <circle cx="24" cy="22" r="2" fill="#FA8C16" opacity="0.4"/>
  </g>
</svg>`);

/** 仪表/表盘图标 — 计量器具 */
export const ICON_METER = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">
    <rect x="8" y="10" width="32" height="24" rx="3" stroke="#722ED1" stroke-width="1.5" fill="rgba(114,46,209,0.08)"/>
    <path d="M14 28a10 10 0 0 1 20 0" stroke="#722ED1" stroke-width="1.2" fill="none"/>
    <line x1="24" y1="28" x2="30" y2="20" stroke="#722ED1" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="24" cy="28" r="2" fill="#722ED1" opacity="0.6"/>
    <text x="24" y="38" text-anchor="middle" fill="#722ED1" font-size="6" opacity="0.6">kWh</text>
    <circle cx="16" cy="20" r="1" fill="#722ED1" opacity="0.3"/>
    <circle cx="20" cy="17" r="1" fill="#722ED1" opacity="0.3"/>
    <circle cx="28" cy="17" r="1" fill="#722ED1" opacity="0.3"/>
    <circle cx="32" cy="20" r="1" fill="#722ED1" opacity="0.3"/>
  </g>
</svg>`);
