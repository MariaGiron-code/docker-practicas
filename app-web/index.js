const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = 7000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
    host: 'contenedor-v1',
    user: 'root',
    password: 'password',
    database: 'base_empleados',
    charset: 'utf8mb4'
});

// Obtener todos los empleados
app.get('/personal', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM personal');
        res.json(results);
        console.log("Registros Recibidos...");
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error al obtener los datos'});
    }
});

// Obtener un empleado por su ID
app.get('/personal/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const [results] = await pool.query('SELECT * FROM personal WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({mensaje: 'Empleado no encontrado'});
        }
        res.json(results[0]);
        console.log(`Empleado Recibido con id ${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error al obtener el empleado'});
    }
});

// Crear un nuevo empleado
app.post('/personal', async (req, res) => {
    try {
        const {nombre, cargo, sueldo} = req.body;
        const sql = 'INSERT INTO personal (nombre, cargo, sueldo) VALUES (?, ?, ?)';

        const [results] = await pool.query(sql, [nombre, cargo, sueldo]);
        res.status(201).json({mensaje: 'Empleado creado', id: results.insertId});
        console.log("Empleado Creado Exitosamente")
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error al crear el empleado'});
    }
});

// Actualizar un empleado
app.put('/personal/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {nombre, cargo, sueldo} = req.body;
        const sql = 'UPDATE personal SET nombre = ?, cargo = ?, sueldo = ? WHERE id = ?';

        const [results] = await pool.query(sql, [nombre, cargo, sueldo, id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({mensaje: 'Empleado no encontrado'});
        }
        res.json({mensaje: 'Empleado actualizado'});
        console.log("Empleado Actualizado")
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error al actualizar'});
    }
});

// (DELETE) - Borrar un empleado
app.delete('/personal/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const [results] = await pool.query('DELETE FROM personal WHERE id = ?', [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({mensaje: 'Empleado no encontrado'});
        }
        res.json({mensaje: 'Empleado eliminado'});
        console.log(`Empleado con id ${id} eliminado`)
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error al borrar'});
    }
});

app.listen(port, () => {
    console.log(`Server Listening: http://localhost:${port}`);
});