/**
 * Estados posibles de una tarea. Se centralizan aquí para no repetir el
 * mismo arreglo de literales en el DTO, la entidad y los casos de uso.
 */
export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
