import { FunctionDeclaration } from '@google/genai';

export const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'generateReport',
    description: 'Generate, analyze, or create comprehensive reports in markdown format. Use this for any report generation, data analysis, summaries, or documentation requests.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the report'
        },
        content: {
          type: 'string',
          description: 'The full report content in markdown format with proper headings, sections, and formatting'
        },
        category: {
          type: 'string',
          description: 'Category of the report (e.g., analysis, summary, technical, business)',
          enum: ['analysis', 'summary', 'technical', 'business', 'fitness', 'project', 'other']
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relevant tags for the report'
        }
      },
      required: ['title', 'content', 'category']
    }
  },
  {
    name: 'listReports',
    description: 'Get a list of all previously generated reports with their titles, categories, and creation dates.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional: Filter reports by category',
          enum: ['analysis', 'summary', 'technical', 'business', 'fitness', 'project', 'other']
        }
      }
    }
  },
  {
    name: 'getReport',
    description: 'Retrieve the full content of a specific report by its ID or title.',
    parameters: {
      type: 'object',
      properties: {
        reportId: {
          type: 'string',
          description: 'The ID of the report to retrieve'
        },
        title: {
          type: 'string',
          description: 'Alternative: The title of the report to retrieve'
        }
      }
    }
  },
  {
    name: 'updateReport',
    description: 'Update or modify an existing report with new content, changes, or improvements.',
    parameters: {
      type: 'object',
      properties: {
        reportId: {
          type: 'string',
          description: 'The ID of the report to update'
        },
        title: {
          type: 'string',
          description: 'New title for the report (optional)'
        },
        content: {
          type: 'string',
          description: 'Updated content in markdown format'
        },
        category: {
          type: 'string',
          description: 'Updated category (optional)',
          enum: ['analysis', 'summary', 'technical', 'business', 'fitness', 'project', 'other']
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated tags (optional)'
        }
      },
      required: ['reportId', 'content']
    }
  }
];

export const DEFAULT_TOOLS = [
  {
    functionDeclarations: FUNCTION_DECLARATIONS
  }
];