import { FunctionDeclaration } from '@google/genai';

export const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'generateFitnessReport',
    description: 'Generate comprehensive fitness reports including workout plans, nutrition guidance, supplement recommendations, or health assessments. Use this for all fitness-related report generation.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the fitness report'
        },
        content: {
          type: 'string',
          description: 'The full report content in markdown format with proper headings, sections, and formatting'
        },
        category: {
          type: 'string',
          description: 'Category of the fitness report',
          enum: ['fitness', 'workout', 'supplement', 'health', 'nutrition']
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relevant tags for the report (e.g., beginner, strength, weight-loss)'
        },
        userInfo: {
          type: 'object',
          description: 'User information collected for personalization',
          properties: {
            fitnessLevel: { type: 'string' },
            goals: { type: 'string' },
            equipment: { type: 'string' },
            timeAvailable: { type: 'string' },
            healthConditions: { type: 'string' }
          }
        }
      },
      required: ['title', 'content', 'category']
    }
  },
  {
    name: 'scrollToSection',
    description: 'Scroll to a specific section on the page to show relevant content to the user.',
    parameters: {
      type: 'object',
      properties: {
        sectionId: {
          type: 'string',
          description: 'The ID of the section to scroll to',
          enum: ['fitness-consultation', 'workout-plans', 'supplement-guidance', 'health-calculators']
        }
      },
      required: ['sectionId']
    }
  },
  {
    name: 'switchSectionMode',
    description: 'Switch a section between info mode and AI generation mode.',
    parameters: {
      type: 'object',
      properties: {
        sectionId: {
          type: 'string',
          description: 'The ID of the section to switch',
          enum: ['fitness-consultation', 'workout-plans', 'supplement-guidance', 'health-calculators']
        },
        mode: {
          type: 'string',
          description: 'The mode to switch to',
          enum: ['info', 'ai-generation']
        }
      },
      required: ['sectionId', 'mode']
    }
  },
  {
    name: 'collectUserInfo',
    description: 'Collect specific information from the user for fitness report generation.',
    parameters: {
      type: 'object',
      properties: {
        infoType: {
          type: 'string',
          description: 'Type of information to collect',
          enum: ['fitness-level', 'goals', 'equipment', 'time-available', 'health-conditions', 'diet-preferences']
        },
        question: {
          type: 'string',
          description: 'The question to ask the user'
        }
      },
      required: ['infoType', 'question']
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