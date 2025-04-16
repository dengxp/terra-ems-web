import { generateFromString } from 'generate-avatar';
import {generateUUID} from "@/utils/uuid";

export function generateAvatar(id?: string) {
  if(!id) {
    id = generateUUID();
  }
  return `data:image/svg+xml;utf8,${generateFromString(id)}`;
}
