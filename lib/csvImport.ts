import type { Task } from '@prisma/client';
import { TASK_FIELD_CONFIG } from '@/config/TASK_FIELD_CONFIG';
import Papa from 'papaparse';

interface ParsedTaskData {
  [key: string]: any;
}

interface ParsingResult {
  parsedTasks: Partial<Task>[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse CSV content into task data using robust papaparse parser
 * 
 * @param csvContent The CSV content to parse
 * @returns Object containing parsed tasks and any errors/warnings that occurred during parsing
 */
export const parseCSV = (csvContent: string): ParsingResult => {
  const result: ParsingResult = {
    parsedTasks: [],
    errors: [],
    warnings: []
  };

  try {
    // Check if content is valid
    if (!csvContent || csvContent.trim() === '') {
      result.errors.push('CSV content is empty.');
      return result;
    }

    // Use PapaParse to parse the CSV robustly
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
    });

    if (parsed.errors && parsed.errors.length > 0) {
      parsed.errors.forEach((err) => {
        result.errors.push(`CSV Parse Error: ${err.message} (row ${err.row ?? 'n/a'})`);
      });
      // If critical parse error, abort
      if (parsed.data.length === 0) {
        return result;
      }
    }

    // Map CSV headers to our database fields
    const csvHeaders = parsed.meta.fields || [];
    if (csvHeaders.length < 1) {
      result.errors.push('CSV header is malformed or missing.');
      return result;
    }

    const fieldMap = mapCsvHeadersToDbFields(csvHeaders);

    parsed.data.forEach((row: any, rowIndex: number) => {
      const rowData: Record<string, any> = {};
      let hasData = false;
      Object.entries(fieldMap).forEach(([csvHeader, dbField]) => {
        if (dbField && row[csvHeader] !== undefined) {
          rowData[dbField] = row[csvHeader];
          hasData = true;
        }
      });
      // Ignore empty rows
      if (!hasData) return;
      // Ignore Task ID for import (always create new)
      delete rowData['task_id'];
      result.parsedTasks.push(rowData);
    });
  } catch (e: any) {
    result.errors.push(`Unexpected error during CSV parsing: ${e.message}`);
  }
  return result;
};

// Dummy for compatibility (not needed with papaparse, but keep for API)
const parseCSVRow = (line: string): string[] => {
  // Use PapaParse to parse a single line
  const parsed = Papa.parse(line, { delimiter: ',', skipEmptyLines: true });
  return parsed.data[0] || [];
};

/**
 * Map CSV headers to database fields
 */
const mapCsvHeadersToDbFields = (headers: string[]): Record<string, string> => {
  const result: Record<string, string> = {};
  
  // Define mappings from CSV headers to database fields
  const knownMappings: Record<string, string> = {
    // ID and basic fields
    'Task ID': 'task_id', // Changed to task_id to match schema
    'ID': 'task_id',
    'Id': 'task_id',
    'Name': 'name',
    'Description': 'description',
    'Notes': 'notes',
    'Task Comments': 'task_comments',
    
    // Organization
    'Portfolio': 'portfolio',
    'Project': 'project',
    'Sections': 'section', 
    'Parent Task': 'parent_task',
    'Parent Task ID': 'parent_task_id',
    
    // Subtasks
    'Subtasks (for user)': 'subtasks_for_user',
    'Subtasks (for AI)': 'subtasks_for_ai',
    'Subtasks (in System)': 'subtasks_in_system',
    'Subtasks ID (in System)': 'subtasks_id_in_system',
    
    // AI related fields
    'AI Brainstorm Ideas on How It Can Help Me:': 'ai_brainstorm_ideas_on_how_it_can_help_me',
    'Task Goal': 'task_goal',
    'Input Data & Context': 'input_data_context',
    'Desired Output Format': 'desired_output_format',
    'AI Action / Process (Free Text)': 'ai_action_process_free_text',
    'AI Action / Process (Dropdown)': 'ai_action_process_dropdown',
    'Allow Autonomous Execution (for AI)': 'allow_autonomous_execution',
    'Number of Variations (If Applicable)': 'number_of_variations',
    'Desired Style / Tone': 'desired_style_tone',
    'Specific Constraints / Instructions (for AI)': 'specific_constraints_instructions',
    'AI Behavior on Uncertainty': 'ai_behavior_on_uncertainty',
    'AI Creativity Level': 'ai_creativity_level',
    'AI Processing Priority': 'ai_processing_priority',
    'AI Agent Status Log': 'ai_agent_status_log',
    'AI Output / Result Link': 'ai_output_result_link',
    'AI Output Rating': 'ai_output_rating',
    'Feedback for AI': 'feedback_for_ai',
    'AI Workflow Status': 'ai_workflow_status',
    
    // Dependencies
    'Dependents': 'dependents',
    'Dependents ID': 'dependents_id',
    'Outgoing Dependents': 'outgoing_dependents',
    'Outgoing Dependents ID': 'outgoing_dependents_id',
    
    // Task properties
    'Tags': 'tags',
    'Priority': 'priority',
    'Due Date': 'due_date',
    'Start Date': 'start_date',
    'Deadline Type': 'deadline_type',
    'Recurrence / Frequency': 'recurrence_frequency',
    'Created At': 'created_at',
    'Completed At': 'completed_at',
    'Last Modified At': 'last_modified_at', // Changed from updated_at
    
    // Responsible parties
    'Action Required From User': 'action_required_from_user', 
    'Assignee': 'assignee',
    'Collaborators': 'collaborators',
    'Related Entity': 'related_entities', // Changed to match schema
    'Waiting For': 'waiting_for',
    
    // Related items
    'Related Portfolios': 'related_portfolios',
    'Related Projects': 'related_projects',
    'Related Sections': 'related_sections',
    'Related Tasks': 'related_tasks',
    'Related Tasks ID': 'related_tasks_id',
    'Related Entities': 'related_entities',
    
    // User context
    'Target Audience': 'target_audience',
    'Task Purpose (Why)': 'task_purpose', 
    'Type': 'type',
    'Task Type': 'task_type',
    'Estimated User Time': 'estimated_user_time',
    'Cognitive Load (For User)': 'cognitive_load',
    'Energy Level Required (For User)': 'energy_level_required',
    'Required Tools / Software': 'required_tools_software',
    'Required Hardware': 'required_hardware',
    'Required Skills': 'required_skills',
    'Estimated Cost / Budget': 'estimated_cost_budget',
    'Expected Impact / Success Metric': 'expected_impact_success_metric',
    'Location': 'location',
    'Execution Location': 'execution_location',
    'Required Device(s)': 'required_devices',
    'Internet Requirement': 'internet_requirement',
    'Focus Requirement': 'focus_requirement',
    'Optimal Time of Day': 'optimal_time_of_day',
    'Financial Return (Value & Speed)': 'financial_return_value_speed',
    
    // Additional mapping for data in your CSV
    'Suggested Initial Steps / Subtasks': 'suggested_initial_steps_subtasks',
    'Relatated Areas for AI to Consider': 'related_areas_for_ai_to_consider',
    'Potential Dependencies / Related Tasks': 'potential_dependencies_related_tasks'
  };
  
  // Map each header to its database field if known
  headers.forEach(header => {
    if (knownMappings[header]) {
      result[header] = knownMappings[header];
    } else {
      // For unknown headers, use a cleaned version of the header
      // This is a fallback - ideally all headers should be mapped
      const cleaned = header
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_') // Replace non-alphanumeric with underscores
        .replace(/__+/g, '_')        // Replace multiple underscores with single
        .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
      
      result[header] = cleaned;
    }
  });
  
  return result;
};

/**
 * Parse a field value according to its type
 */
const parseFieldValue = (
  fieldName: string, 
  value: string, 
  fieldConfig: any, 
  result: ParsingResult, 
  rowIndex: number
): any => {
  try {
    switch (fieldConfig.type) {
      case 'multi-select':
        // Handle arrays for multi-select fields
        if (Array.isArray(fieldConfig.options)) {
          // Handle possible array serialization formats
          if (value.startsWith('[') && value.endsWith(']')) {
            // Looks like JSON array
            try {
              return JSON.parse(value);
            } catch {
              // If parsing fails, fall back to comma splitting
              return value.slice(1, -1).split(',').map(item => item.trim());
            }
          } else {
            // Assume comma-separated list
            return value.split(',').map(item => item.trim()).filter(Boolean);
          }
        }
        return [value]; // Default to single-item array
        
      case 'date':
        // Try to parse dates
        if (value.toLowerCase() === 'nan' || value === '') {
          return null; // Handle 'nan' as null for dates
        }
        
        try {
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime())) {
            return dateValue;
          } else {
            result.warnings.push(`Row ${rowIndex + 1}, field "${fieldName}": Invalid date format "${value}"`);
            return null; // Return null for invalid dates
          }
        } catch (e) {
          result.warnings.push(`Row ${rowIndex + 1}, field "${fieldName}": Failed to parse date "${value}"`);
          return null;
        }
        
      case 'number':
        // Parse numbers
        if (value.toLowerCase() === 'nan' || value === '') {
          return null; // Handle 'nan' as null for numbers
        }
        
        const num = Number(value);
        if (!isNaN(num)) {
          return num;
        } else {
          result.warnings.push(`Row ${rowIndex + 1}, field "${fieldName}": Invalid number format "${value}"`);
          return null; // Return null for invalid numbers
        }
      
      case 'text':
      case 'textarea':
        // For text fields, handle special values
        if (value.toLowerCase() === 'nan') {
          return null; // Replace 'nan' with null for text fields
        }
        return value;
        
      case 'dropdown':
        // For dropdown fields, ensure value is in options if provided
        if (value.toLowerCase() === 'nan' || value === '') {
          return null; // Handle 'nan' as null for dropdowns
        }
        
        if (Array.isArray(fieldConfig.options) && !fieldConfig.options.includes(value)) {
          result.warnings.push(`Row ${rowIndex + 1}, field "${fieldName}": Value "${value}" is not in allowed options`);
        }
        return value;
        
      default:
        // For any other fields, use as is
        if (value.toLowerCase() === 'nan') {
          return null; // Replace 'nan' with null for all other fields
        }
        return value;
    }
  } catch (error) {
    result.warnings.push(`Row ${rowIndex + 1}, field "${fieldName}": Error parsing value: ${(error as Error).message}`);
    return value; // Return original value on error
  }
};

/**
 * Import tasks from CSV content
 * 
 * @param csvContent The CSV content to import
 * @returns Promise resolving to the parsing result with added API responses
 */
export const importTasksFromCSV = async (csvContent: string): Promise<ParsingResult> => {
  console.log('Starting CSV import with content length:', csvContent.length);
  
  // Parse the CSV content
  const result = parseCSV(csvContent);
  console.log('Parsed tasks:', result.parsedTasks.length, 'Warnings:', result.warnings.length, 'Errors:', result.errors.length);
  
  // If there are critical errors, don't attempt to import
  if (result.errors.length > 0) {
    console.error('Critical errors found during parsing:', result.errors);
    return result;
  }
  
  if (result.parsedTasks.length === 0) {
    result.errors.push('No valid tasks found to import.');
    return result;
  }
  
  console.log('First task example:', JSON.stringify(result.parsedTasks[0], null, 2));
  
  // Import each task
  let successCount = 0;
  for (let i = 0; i < result.parsedTasks.length; i++) {
    const taskData = result.parsedTasks[i];
    try {
      console.log(`Importing task ${i+1}/${result.parsedTasks.length}:`, taskData.name || 'Unnamed task');
      
      // Make sure we have required fields
      if (!taskData.name) {
        result.errors.push(`Task at index ${i} is missing required 'name' field.`);
        continue;
      }
      
      if (!taskData.task_goal) {
        // Add a default task goal if it's missing
        taskData.task_goal = `Successfully complete: ${taskData.name}`;
      }
      
      if (!taskData.input_data_context) {
        // Add a default input context if it's missing
        taskData.input_data_context = 'No additional context provided.';
      }
      
      // Ensure required arrays are initialized
      if (!taskData.portfolio) taskData.portfolio = [];
      if (!taskData.project) taskData.project = [];
      if (!taskData.section) taskData.section = [];
      if (!taskData.tags) taskData.tags = [];
      
      // Always create new task - Remove update logic
      console.log('Creating new task:', taskData.name);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create new task';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += `: ${errorData.error || response.statusText}`;
        } catch {
          errorMessage += `: ${errorText || response.statusText}`;
        }
        result.errors.push(errorMessage);
      } else {
        successCount++;
      }
      
    } catch (error) {
      result.errors.push(`API error for task ${i+1} ('new'): ${(error as Error).message}`);
    }
  }
  
  console.log(`Import completed: ${successCount} tasks imported successfully out of ${result.parsedTasks.length}`);
  
  return result;
};
