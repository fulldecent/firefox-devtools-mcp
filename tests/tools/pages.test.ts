/**
 * Unit tests for pages tools
 */

import { describe, it, expect } from 'vitest';
import {
  listPagesTool,
  navigatePageTool,
  newPageTool,
  closePageTool,
} from '../../src/tools/pages.js';

describe('Pages Tools', () => {
  describe('Tool Definitions', () => {
    it('should have correct tool names', () => {
      expect(listPagesTool.name).toBe('list_pages');
      expect(navigatePageTool.name).toBe('navigate_page');
      expect(newPageTool.name).toBe('new_page');
      expect(closePageTool.name).toBe('close_page');
    });

    it('should have valid descriptions', () => {
      expect(listPagesTool.description).toContain('tab');
      expect(navigatePageTool.description).toContain('Navigate');
      expect(newPageTool.description).toContain('new');
      expect(closePageTool.description).toContain('Close');
    });

    it('should have valid input schemas', () => {
      expect(listPagesTool.inputSchema.type).toBe('object');
      expect(navigatePageTool.inputSchema.type).toBe('object');
      expect(newPageTool.inputSchema.type).toBe('object');
      expect(closePageTool.inputSchema.type).toBe('object');
    });
  });

  describe('Schema Properties', () => {
    it('navigatePageTool should require pageIdx and url', () => {
      const { properties, required } = navigatePageTool.inputSchema;
      expect(properties).toBeDefined();
      expect(properties?.pageIdx).toBeDefined();
      expect(properties?.pageIdx.type).toBe('number');
      expect(properties?.url).toBeDefined();
      expect(properties?.url.type).toBe('string');
      expect(required).toContain('pageIdx');
      expect(required).toContain('url');
    });

    it('newPageTool should accept url', () => {
      const { properties } = newPageTool.inputSchema;
      expect(properties).toBeDefined();
      expect(properties?.url).toBeDefined();
    });

    it('closePageTool should require pageIdx', () => {
      const { properties, required } = closePageTool.inputSchema;
      expect(properties).toBeDefined();
      expect(properties?.pageIdx).toBeDefined();
      expect(required).toContain('pageIdx');
    });
  });
});
