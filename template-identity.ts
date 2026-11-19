import { generateTemplateIdentifier,parseTemplate } from '@xo-cash/utils';
import { giftTemplate } from './template.js';
export const normalizedTemplate=parseTemplate(giftTemplate);
export const expectedTemplateIdentifier=generateTemplateIdentifier(normalizedTemplate);
