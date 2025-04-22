import type { Task } from '@prisma/client';
import { TASK_FIELD_CONFIG } from '@/config/TASK_FIELD_CONFIG';

/**
 * Converts a value to a CSV-friendly string.
 * Handles arrays, objects, dates, etc.
 * 
 * @param value The value to convert
 * @returns A string representation suitable for CSV
 */
const formatValueForCsv = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  if (Array.isArray(value)) {
    // Convert arrays to comma-separated lists, with each item in quotes
    return value.map(item => `"${String(item).replace(/"/g, '""')}"`).join(', ');
  } else if (value instanceof Date) {
    // Format dates as ISO strings
    return value.toISOString();
  } else if (typeof value === 'object') {
    // Convert objects to JSON strings, wrapped in quotes
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  } else if (typeof value === 'string') {
    // Escape quotes in strings and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  // Return other types as strings
  return String(value);
};

/**
 * Exports an array of tasks to CSV format
 * 
 * @param tasks Array of tasks to export
 * @param includeAllFields Whether to include all fields (true) or only common fields (false)
 * @returns CSV string with header and data rows
 */
export const tasksToCSV = (tasks: Task[], includeAllFields = false): string => {
  // If no tasks, return empty string or header only
  if (!tasks || tasks.length === 0) {
    return 'No tasks to export';
  }
  
  // Determine which fields to include
  const fieldEntries = Object.entries(TASK_FIELD_CONFIG);
  const fieldsToInclude = includeAllFields 
    ? fieldEntries.map(([fieldName]) => fieldName)
    : [
        'id', 'name', 'portfolio', 'project', 'section', 'priority',
        'due_date', 'task_goal', 'input_data_context', 'ai_workflow_status',
        'completed_at', 'created_at', 'updated_at'
      ];
  
  // Create header row
  const header = fieldsToInclude.map(fieldName => 
    `"${fieldName.replace(/"/g, '""')}"`
  ).join(',');
  
  // Create data rows
  const rows = tasks.map(task => {
    const values = fieldsToInclude.map(fieldName => {
      const value = task[fieldName as keyof Task];
      return formatValueForCsv(value);
    });
    return values.join(',');
  });
  
  // Combine header and rows
  return [header, ...rows].join('\n');
};

/**
 * Creates and downloads a CSV file in the browser
 * 
 * @param csvContent CSV content as a string
 * @param filename Name of the file to download
 */
export const downloadCSV = (csvContent: string, filename = 'tasks.csv'): void => {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Set up the download
  if ('msSaveBlob' in navigator) {
    // For IE
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    // For other browsers
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  }
};

/**
 * Export tasks and trigger download of the CSV file
 * 
 * @param tasks Array of tasks to export
 * @param includeAllFields Whether to include all fields in the export
 * @param filename Name of the CSV file to download
 */
export const exportTasksToCSV = (
  tasks: Task[], 
  includeAllFields = false,
  filename = 'tasks.csv'
): void => {
  const csvContent = tasksToCSV(tasks, includeAllFields);
  downloadCSV(csvContent, filename);
};
