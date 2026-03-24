/**
 * Page utility tools (dialogs, history, viewport)
 */

import { successResponse, errorResponse } from '../utils/response-helpers.js';
import type { McpToolResponse } from '../types/common.js';

// Tool definitions - Dialogs
export const acceptDialogTool = {
  name: 'accept_dialog',
  description: 'Accept browser dialog. Provide promptText for prompts.',
  inputSchema: {
    type: 'object',
    properties: {
      pageIdx: {
        type: 'number',
        description: 'Tab index (from list_pages)',
      },
      promptText: {
        type: 'string',
        description: 'Text for prompt dialogs',
      },
    },
    required: ['pageIdx'],
  },
};

export const dismissDialogTool = {
  name: 'dismiss_dialog',
  description: 'Dismiss browser dialog.',
  inputSchema: {
    type: 'object',
    properties: {
      pageIdx: {
        type: 'number',
        description: 'Tab index (from list_pages)',
      },
    },
    required: ['pageIdx'],
  },
};

// Tool definitions - History
export const navigateHistoryTool = {
  name: 'navigate_history',
  description: 'Navigate history back/forward. UIDs become stale.',
  inputSchema: {
    type: 'object',
    properties: {
      pageIdx: {
        type: 'number',
        description: 'Tab index (from list_pages)',
      },
      direction: {
        type: 'string',
        enum: ['back', 'forward'],
        description: 'back or forward',
      },
    },
    required: ['pageIdx', 'direction'],
  },
};

// Tool definitions - Viewport
export const setViewportSizeTool = {
  name: 'set_viewport_size',
  description: 'Set viewport dimensions in pixels.',
  inputSchema: {
    type: 'object',
    properties: {
      pageIdx: {
        type: 'number',
        description: 'Tab index (from list_pages)',
      },
      width: {
        type: 'number',
        description: 'Width in pixels',
      },
      height: {
        type: 'number',
        description: 'Height in pixels',
      },
    },
    required: ['pageIdx', 'width', 'height'],
  },
};

// Handlers - Dialogs
export async function handleAcceptDialog(args: unknown): Promise<McpToolResponse> {
  try {
    const { pageIdx, promptText } = (args as { pageIdx: number; promptText?: string }) || {};

    if (typeof pageIdx !== 'number') {
      throw new Error('pageIdx parameter is required and must be a number');
    }

    const { getFirefox } = await import('../index.js');
    const firefox = await getFirefox();

    await firefox.selectTab(pageIdx);
    try {
      await firefox.acceptDialog(promptText);
      return successResponse(promptText ? `✅ Accepted: "${promptText}"` : '✅ Accepted');
    } catch (error) {
      const errorMsg = (error as Error).message;

      // Concise error for no active dialog
      if (errorMsg.includes('no such alert') || errorMsg.includes('No dialog')) {
        throw new Error('No active dialog');
      }

      throw error;
    }
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleDismissDialog(args: unknown): Promise<McpToolResponse> {
  try {
    const { pageIdx } = (args as { pageIdx: number }) || {};

    if (typeof pageIdx !== 'number') {
      throw new Error('pageIdx parameter is required and must be a number');
    }

    const { getFirefox } = await import('../index.js');
    const firefox = await getFirefox();

    await firefox.selectTab(pageIdx);
    try {
      await firefox.dismissDialog();
      return successResponse('✅ Dismissed');
    } catch (error) {
      const errorMsg = (error as Error).message;

      // Concise error for no active dialog
      if (errorMsg.includes('no such alert') || errorMsg.includes('No dialog')) {
        throw new Error('No active dialog');
      }

      throw error;
    }
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// Handlers - History
export async function handleNavigateHistory(args: unknown): Promise<McpToolResponse> {
  try {
    const { pageIdx, direction } = args as { pageIdx: number; direction: 'back' | 'forward' };

    if (typeof pageIdx !== 'number') {
      throw new Error('pageIdx parameter is required and must be a number');
    }

    if (!direction || (direction !== 'back' && direction !== 'forward')) {
      throw new Error('direction parameter is required and must be "back" or "forward"');
    }

    const { getFirefox } = await import('../index.js');
    const firefox = await getFirefox();

    await firefox.selectTab(pageIdx);
    if (direction === 'back') {
      await firefox.navigateBack();
    } else {
      await firefox.navigateForward();
    }

    return successResponse(`✅ ${direction}`);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// Handlers - Viewport
export async function handleSetViewportSize(args: unknown): Promise<McpToolResponse> {
  try {
    const { pageIdx, width, height } = args as { pageIdx: number; width: number; height: number };

    if (typeof pageIdx !== 'number') {
      throw new Error('pageIdx parameter is required and must be a number');
    }

    if (typeof width !== 'number' || width <= 0) {
      throw new Error('width parameter is required and must be a positive number');
    }

    if (typeof height !== 'number' || height <= 0) {
      throw new Error('height parameter is required and must be a positive number');
    }

    const { getFirefox } = await import('../index.js');
    const firefox = await getFirefox();

    await firefox.selectTab(pageIdx);
    await firefox.setViewportSize(width, height);

    return successResponse(`✅ ${width}x${height}`);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
