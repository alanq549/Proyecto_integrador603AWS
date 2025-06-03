import express from 'express';
import { crearTarea, obtenerTareas, actualizarEstado, eliminarTarea } from "../controllers/tasksController";

const router = express.Router();

// Ruta para crear una tarea
router.post('/tasks', (req: express.Request, res: express.Response) => {
    crearTarea(req, res);
});

// Ruta para obtener todas las tareas
router.get('/tasks', (req: express.Request, res: express.Response) => {
    obtenerTareas(req, res);
});

// Ruta para actualizar el estado de una tarea
router.put('/tasks/:id', (req: express.Request, res: express.Response) => {
    actualizarEstado(req, res);
});

// Ruta para eliminar una tarea
router.delete('/tasks/:id', (req: express.Request, res: express.Response) => {
    eliminarTarea(req, res);
});

export default router;
