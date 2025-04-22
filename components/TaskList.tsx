// components/TaskList.tsx
import type { Task } from '@prisma/client'; // Import the Task type from Prisma
import Link from 'next/link'; // Import Link for navigation

// Define the props this component expects
interface TaskListProps {
  tasks: Task[]; // An array of Task objects
}

export default function TaskList({ tasks }: TaskListProps) {

  // If there are no tasks, don't render anything (the parent page handles the "No tasks" message)
  if (!tasks || tasks.length === 0) {
    return null;
  }

  // Render an unordered list of tasks
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Portfolio
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr 
              key={task.id} 
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  {task.name || '(Untitled Task)'}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.portfolio && task.portfolio.length > 0 ? task.portfolio[0] : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.project && task.project.length > 0 ? task.project[0] : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.priority ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.priority.startsWith('P0') ? 'bg-red-100 text-red-800' :
                    task.priority.startsWith('P1') ? 'bg-orange-100 text-orange-800' :
                    task.priority.startsWith('P2') ? 'bg-yellow-100 text-yellow-800' :
                    task.priority.startsWith('P3') ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800' // Default for P4 or unknown
                  }`}>
                    {task.priority}
                  </span>
                ) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.ai_workflow_status ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.ai_workflow_status.startsWith('1') ? 'bg-gray-100 text-gray-700' :
                    task.ai_workflow_status.startsWith('2') ? 'bg-yellow-100 text-yellow-700' :
                    task.ai_workflow_status.startsWith('3') ? 'bg-blue-100 text-blue-700' :
                    task.ai_workflow_status.startsWith('4') ? 'bg-purple-100 text-purple-700' :
                    task.ai_workflow_status.startsWith('5') ? 'bg-pink-100 text-pink-700 font-bold' :
                    task.ai_workflow_status.startsWith('6') ? 'bg-green-100 text-green-700' :
                    task.ai_workflow_status.startsWith('7') ? 'bg-gray-300 text-gray-600 line-through' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.ai_workflow_status.substring(task.ai_workflow_status.indexOf('-') + 2)}
                  </span>
                ) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}