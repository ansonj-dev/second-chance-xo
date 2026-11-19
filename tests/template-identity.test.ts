import assert from 'node:assert/strict';
import test from 'node:test';
import { generateTemplateIdentifier,parseTemplate,serializeTemplate } from '@xo-cash/utils';
import { expectedTemplateIdentifier,normalizedTemplate } from '../template-identity.js';
test('inspector identity matches the normalized template round-trip used by the engine',()=>assert.equal(expectedTemplateIdentifier,generateTemplateIdentifier(parseTemplate(serializeTemplate(normalizedTemplate)))));
