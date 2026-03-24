/**
 * Unit tests for screenshot tools
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screenshotPageTool, screenshotByUidTool } from '../../src/tools/screenshot.js';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Screenshot Tools', () => {
  describe('Tool Definitions', () => {
    it('should have correct tool names', () => {
      expect(screenshotPageTool.name).toBe('screenshot_page');
      expect(screenshotByUidTool.name).toBe('screenshot_by_uid');
    });

    it('should have valid descriptions', () => {
      expect(screenshotPageTool.description).toContain('screenshot');
      expect(screenshotByUidTool.description).toContain('screenshot');
      expect(screenshotByUidTool.description).toContain('element');
    });

    it('should have valid input schemas', () => {
      expect(screenshotPageTool.inputSchema.type).toBe('object');
      expect(screenshotByUidTool.inputSchema.type).toBe('object');
    });
  });

  describe('Schema Properties', () => {
    it('screenshotPageTool should require pageIdx and have saveTo property', () => {
      const { properties, required } = screenshotPageTool.inputSchema;
      expect(properties).toBeDefined();
      expect(properties?.pageIdx).toBeDefined();
      expect(properties?.pageIdx?.type).toBe('number');
      expect(properties?.saveTo).toBeDefined();
      expect(properties?.saveTo?.type).toBe('string');
      expect(required).toContain('pageIdx');
      expect(required).not.toContain('saveTo');
    });

    it('screenshotByUidTool should require pageIdx and uid, have optional saveTo', () => {
      const { properties, required } = screenshotByUidTool.inputSchema;
      expect(properties).toBeDefined();
      expect(properties?.pageIdx).toBeDefined();
      expect(properties?.uid).toBeDefined();
      expect(properties?.saveTo).toBeDefined();
      expect(properties?.saveTo?.type).toBe('string');
      expect(required).toContain('pageIdx');
      expect(required).toContain('uid');
      expect(required).not.toContain('saveTo');
    });
  });

  describe('Handler: saveTo behavior', () => {
    const FAKE_BASE64 = Buffer.from('fake-png-data').toString('base64');
    let tempDir: string;

    beforeEach(() => {
      tempDir = join(tmpdir(), `screenshot-test-${Date.now()}`);

      vi.doMock('../../src/index.js', () => ({
        getFirefox: vi.fn().mockResolvedValue({
          takeScreenshotPage: vi.fn().mockResolvedValue(FAKE_BASE64),
          takeScreenshotByUid: vi.fn().mockResolvedValue(FAKE_BASE64),
          refreshTabs: vi.fn().mockResolvedValue(undefined),
          getTabs: vi.fn().mockReturnValue([{ actor: 'tab0', title: 'Tab 0', url: 'about:blank' }]),
          selectTab: vi.fn().mockResolvedValue(undefined),
        }),
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should save screenshot to file when saveTo is provided (page)', async () => {
      const { handleScreenshotPage } = await import('../../src/tools/screenshot.js');
      const filePath = join(tempDir, 'page.png');
      const result = await handleScreenshotPage({ pageIdx: 0, saveTo: filePath });

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain(
        'Screenshot saved to:'
      );
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('KB)');
      expect(existsSync(filePath)).toBe(true);

      const written = readFileSync(filePath);
      expect(written).toEqual(Buffer.from(FAKE_BASE64, 'base64'));
    });

    it('should save screenshot to file when saveTo is provided (by uid)', async () => {
      const { handleScreenshotByUid } = await import('../../src/tools/screenshot.js');
      const filePath = join(tempDir, 'element.png');
      const result = await handleScreenshotByUid({ pageIdx: 0, uid: 'test-uid', saveTo: filePath });

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain(
        'Screenshot saved to:'
      );
      expect(existsSync(filePath)).toBe(true);
    });

    it('should create parent directories when they do not exist', async () => {
      const { handleScreenshotPage } = await import('../../src/tools/screenshot.js');
      const filePath = join(tempDir, 'nested', 'deep', 'screenshot.png');
      const result = await handleScreenshotPage({ pageIdx: 0, saveTo: filePath });

      expect(result.isError).toBeUndefined();
      expect(existsSync(filePath)).toBe(true);
    });

    it('should return image content when saveTo is not provided (page)', async () => {
      const { handleScreenshotPage } = await import('../../src/tools/screenshot.js');
      const result = await handleScreenshotPage({ pageIdx: 0 });

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'image');
      expect(result.content[0]).toHaveProperty('data', FAKE_BASE64);
      expect(result.content[0]).toHaveProperty('mimeType', 'image/png');
    });

    it('should return image content when saveTo is not provided (by uid)', async () => {
      const { handleScreenshotByUid } = await import('../../src/tools/screenshot.js');
      const result = await handleScreenshotByUid({ pageIdx: 0, uid: 'test-uid' });

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'image');
      expect(result.content[0]).toHaveProperty('data', FAKE_BASE64);
      expect(result.content[0]).toHaveProperty('mimeType', 'image/png');
    });

    it('should resolve relative saveTo path', async () => {
      const { handleScreenshotPage } = await import('../../src/tools/screenshot.js');
      const relativePath = join(tempDir, 'relative.png');
      const result = await handleScreenshotPage({ pageIdx: 0, saveTo: relativePath });

      expect(result.isError).toBeUndefined();
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain(relativePath);
      expect(existsSync(relativePath)).toBe(true);
    });
  });
});
