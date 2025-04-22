// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET handler to fetch a specific task by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log(`GET /api/tasks/${params.id} called`);
  
  try {
    // Validate task ID
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Fetch the task by ID
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    // Return 404 if task is not found
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Return the task
    return NextResponse.json(task);
  } catch (error: any) {
    console.error(`API Error: Failed to fetch task ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error: Could not fetch task.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update a specific task by ID
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  console.log(`PATCH /api/tasks/${params.id} called`);
  
  try {
    // Validate task ID
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Parse the request body
    const body = await request.json();
    console.log("Update request body:", body);

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Process arrays correctly
    const updateData = { ...body };
    
    // Handle multi-select fields that come as strings but need to be arrays
    // Portfolio, project, section, tags, etc.
    const arrayFields = [
      'portfolio', 'project', 'section', 'tags', 'desired_output_format', 
      'desired_style_tone', 'ai_action_process_dropdown', 'required_tools_software',
      'required_hardware', 'required_skills', 'required_devices',
      'optimal_time_of_day', 'related_portfolios', 'related_projects',
      'related_sections', 'related_entities'
    ];

    // Process array fields
    arrayFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // If it's a string, convert to array (comma-separated values)
        if (typeof updateData[field] === 'string') {
          updateData[field] = updateData[field].split(',').map((item: string) => item.trim()).filter(Boolean);
        }
        // If null or empty array, use empty array
        if (updateData[field] === null || (Array.isArray(updateData[field]) && updateData[field].length === 0)) {
          updateData[field] = [];
        }
      }
    });

    // Handle date fields
    const dateFields = ['due_date', 'start_date', 'created_at', 'completed_at', 'last_modified_at'];
    dateFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== null && typeof updateData[field] === 'string') {
        updateData[field] = new Date(updateData[field]);
      }
    });

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
    });

    // Return the updated task
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error(`API Error: Failed to update task ${params.id}:`, error);
    
    // Handle specific error types
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error: Could not update task.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to delete a specific task by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log(`DELETE /api/tasks/${params.id} called`);
  
  try {
    // Validate task ID
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete the task
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    // Return success
    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error(`API Error: Failed to delete task ${params.id}:`, error);
    
    // Handle specific error types
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error: Could not delete task.' },
      { status: 500 }
    );
  }
}
