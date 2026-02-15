import { generateUUID } from "@/utils/uuid";
import { generateFromString } from 'generate-avatar';

export function generateAvatar(id?: string) {
  if(!id) {
    id = generateUUID();
  }
  return `data:image/svg+xml;utf8,${generateFromString(id)}`;
}
