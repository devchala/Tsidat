import client from '../axiosClient';

// Fetch assigned incidents for the logged-in worker
export const getAssignedTasks = async () => {
  const response = await client.get('/incidents/assigned');
  return response.data;
};

// Update task status (En Route -> In Progress -> Completed)
export const updateTaskStatus = async (taskId, statusData) => {
  const response = await client.patch(`/incidents/${taskId}/status`, statusData);
  return response.data;
};

// Toggle worker operational availability (Online / Offline)
export const toggleAvailability = async (isAvailable) => {
  const response = await client.patch('/workers/availability', { isAvailable });
  return response.data;
};