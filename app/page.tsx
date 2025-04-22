// app/page.tsx
'use client'; // This directive is necessary for using React Hooks (useState, useEffect)

import { useState, useEffect, useCallback } from 'react';
import TaskForm from '@/components/TaskForm';     // Component for adding new tasks
import TaskList from '@/components/TaskList';     // Component for displaying tasks
import FilterBar, { FilterOptions } from '@/components/FilterBar'; // Component for filtering tasks
import ImportCSVModal from '@/components/ImportCSVModal'; // Component for importing CSV
import type { Task } from '@prisma/client';      // Import Task type from generated Prisma Client
import { exportTasksToCSV } from '@/lib/csvExport'; // Import CSV export function

export default function HomePage() {
  // --- State Management ---
  const [tasks, setTasks] = useState<Task[]>([]); // Holds the list of tasks
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]); // Holds filtered tasks
  const [isLoading, setIsLoading] = useState<boolean>(true); // Tracks loading state for fetching
  const [error, setError] = useState<string | null>(null); // Holds potential error messages
  const [filters, setFilters] = useState<FilterOptions>({
    portfolio: '',
    project: '',
    section: '',
    priority: '',
    status: '',
  });
  const [exportAllFields, setExportAllFields] = useState<boolean>(false); // Whether to export all fields or just common ones
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false); // Controls visibility of import modal

  // --- Data Fetching ---
  // useCallback ensures fetchTasks function identity is stable across renders
  // unless its dependencies change (which are none here).
  const fetchTasks = useCallback(async () => {
    console.log("Fetching tasks...");
    setIsLoading(true);
    setError(null); // Reset error before fetching
    try {
      const response = await fetch('/api/tasks'); // Call the GET endpoint

      if (!response.ok) {
        // Attempt to read error message from response body, otherwise use status text
        let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (jsonError) {
            // Ignore if response body is not JSON or empty
            console.warn("Could not parse error response as JSON:", jsonError);
        }
        throw new Error(errorMsg);
      }

      const data: Task[] = await response.json();
      console.log("Tasks fetched:", data);
      setTasks(data); // Update state with fetched tasks
      setFilteredTasks(data); // Initialize filtered tasks with all tasks

    } catch (e: any) {
      console.error("Error fetching tasks:", e);
      setError(`Failed to load tasks. ${e.message || 'Please try again later.'}`);
      setTasks([]); // Clear tasks on error to avoid showing stale data
      setFilteredTasks([]);
    } finally {
      setIsLoading(false); // Ensure loading is set to false in all cases
    }
  }, []); // Empty dependency array means this function is created once

  // --- Initial Data Load ---
  useEffect(() => {
    fetchTasks(); // Fetch tasks when the component mounts
  }, [fetchTasks]); // Depend on the memoized fetchTasks function

  // --- Apply Filters ---
  useEffect(() => {
    if (tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }

    // Apply filters to tasks
    let result = [...tasks];
    
    console.log("Applying filters:", filters);

    // Filter by portfolio
    if (filters.portfolio) {
      result = result.filter(task => 
        task.portfolio && task.portfolio.includes(filters.portfolio)
      );
    }

    // Filter by project
    if (filters.project) {
      result = result.filter(task => 
        task.project && task.project.includes(filters.project)
      );
    }

    // Filter by section
    if (filters.section) {
      result = result.filter(task => 
        task.section && task.section.includes(filters.section)
      );
    }

    // Filter by priority
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(task => task.ai_workflow_status === filters.status);
    }

    setFilteredTasks(result);
    console.log("Filtered tasks:", result);
  }, [tasks, filters]);

  // --- Handle Filter Changes ---
  const handleFilterChange = (newFilters: FilterOptions) => {
    console.log("Filter changed:", newFilters);
    setFilters(newFilters);
  };

  // --- Handle Task Export ---
  const handleExportTasks = () => {
    // Export either filtered tasks (if filters are applied) or all tasks
    const tasksToExport = filteredTasks.length > 0 ? filteredTasks : tasks;
    
    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `ai-todo-tasks-${dateStr}.csv`;
    
    // Export tasks to CSV and trigger download
    exportTasksToCSV(tasksToExport, exportAllFields, fileName);
  };

  // --- Import Modal Controls ---
  const openImportModal = () => {
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };

  // Handler for when import is completed
  const handleImportComplete = () => {
    // Refresh the task list after import
    fetchTasks();
  };

  // --- Callback for TaskForm ---
  // This function will be passed to TaskForm and called when a new task is created
  const handleTaskCreated = (newTask: Task) => {
    console.log("New task created, updating list:", newTask);
    // Add the new task to the beginning of the list for immediate feedback
    setTasks((prevTasks) => [newTask, ...prevTasks]);

    // Optional: You could also trigger a full refetch instead:
    // fetchTasks();
    // Adding optimistically is generally a better UX unless ordering is critical.
  };

  // --- Rendering ---
  return (
    // Using Tailwind CSS for basic layout and styling
    <main className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI To Do List</h1>
        <p className="text-gray-600">Focus on your tasks, let AI help with organization and execution.</p>
      </header>

      {/* Task Creation Form Section */}
      <section aria-labelledby="add-task-heading" className="mb-8">
         <h2 id="add-task-heading" className="text-xl font-semibold text-gray-700 mb-3">Add New Task</h2>
        {/* Pass the callback function as a prop */}
        <TaskForm onTaskCreated={handleTaskCreated} />
      </section>

      {/* Filter Bar Section */}
      <section aria-labelledby="filter-tasks-heading" className="mb-4">
        <h2 id="filter-tasks-heading" className="text-xl font-semibold text-gray-700 mb-3">Manage Tasks</h2>
        <FilterBar onFilterChange={handleFilterChange} />
      </section>

      {/* Task List Section */}
      <section aria-labelledby="task-list-heading">
        <div className="flex justify-between items-center mb-3">
          <h2 id="task-list-heading" className="text-xl font-semibold text-gray-700">Your Tasks</h2>
          
          {/* Import/Export controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={openImportModal}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition duration-200"
            >
              Import CSV
            </button>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={exportAllFields}
                onChange={() => setExportAllFields(!exportAllFields)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Export all fields</span>
            </label>
            
            <button
              onClick={handleExportTasks}
              disabled={tasks.length === 0}
              className={`px-4 py-2 rounded-md text-sm ${
                tasks.length > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 transition duration-200'
                  : 'bg-gray-400 text-gray-100 cursor-not-allowed'
              }`}
            >
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Conditional Rendering based on state */}
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading tasks...</p>
            {/* Optional: Add a simple spinner */}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {!isLoading && !error && (
          // Render the TaskList component only when not loading and no error
          <>
            <div className="mb-2 text-sm text-gray-500">
              Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {(filters.portfolio || filters.project || filters.section || filters.priority || filters.status) 
                ? ' (filtered)' 
                : ''}
            </div>
            <TaskList tasks={filteredTasks} />
          </>
        )}
        {!isLoading && !error && filteredTasks.length === 0 && (
          <p className="text-gray-500 italic mt-4">
            {tasks.length === 0 
              ? 'No tasks found. Add one above!' 
              : 'No tasks match the current filters.'}
          </p>
        )}
      </section>

      {/* CSV Import Modal */}
      <ImportCSVModal 
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImportComplete={handleImportComplete}
      />
    </main>
  );
}