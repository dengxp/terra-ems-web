import { generateUUID } from "@/utils/uuid";

/**
 * 升级版头像生成逻辑
 * 采用 DiceBear 的 Notionists 系列（手绘人像风），更具专业感与亲和力
 * @param id 种子值（通常使用用户名或用户ID）
 */
export function generateAvatar(id?: string) {
  const seed = id || 'default-avatar-seed';
  // 使用 Notionists 风格，并添加背景圆角和颜色，提升在 Header 处的视觉效果
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
