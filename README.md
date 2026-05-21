# 🐳 Docker Prácticas - Gestión de Empleados

Un proyecto educativo para aprender y practicar los fundamentos de **Docker**, incluyendo contenedorización, volúmenes compartidos, redes entre contenedores y desarrollo de APIs REST con Node.js y bases de datos.

## Objetivo de la Práctica

Este proyecto proporciona una experiencia práctica con:

- **Contenedorización con Docker:** Empaquetar una aplicación Node.js y una base de datos MySQL en contenedores independientes
- **Volúmenes de Docker:** Compartir datos y configuraciones entre el host y los contenedores
- **Redes en Docker:** Comunicación entre contenedores (aplicación ↔ base de datos)
- **APIs REST:** Desarrollo de endpoints simples con Express.js
- **Gestión de bases de datos:** Uso de MySQL desde Node.js con mysql2

## 📁 Estructura del Proyecto

```
docker-practicas/
├── app-web/                    # Aplicación Node.js + Express
│   ├── index.js               # Servidor principal
│   ├── package.json           # Dependencias del proyecto
│   └── node_modules/          # Módulos instalados
│
├── volumen/                    # Volumen compartido (datos persistentes)
│   ├── empleados.sql          # Script SQL con datos iniciales
│   └── my.cnf                 # Configuración de MySQL
│
└── README.md                   # Este archivo
```

## 🔍 Descripción de Componentes

### 1. **app-web/** - Aplicación Node.js

La aplicación backend es un servidor Express simple que proporciona una API REST para consultar empleados.

#### `package.json`
Define las dependencias del proyecto:
- **express** (v5.2.1): Framework web para Node.js
- **mysql2** (v3.22.3): Cliente MySQL para Node.js

#### `index.js`
Servidor principal que:
- Crea una aplicación Express que escucha en **puerto 7000**
- Se conecta a MySQL usando las credenciales configuradas
- Expone un endpoint GET que devuelve todos los empleados

**Configuración de conexión:**
```javascript
{
  host: 'localhost',      // Host de MySQL
  port: 3307,             // Puerto de MySQL
  user: 'root',           // Usuario
  password: 'password',   // Contraseña
  database: 'base_empleados'
}
```

### 2. **volumen/** - Datos Persistentes

Directorio compartido entre el host y los contenedores para almacenar datos que persisten aunque se destruyan los contenedores.

#### `empleados.sql`
Script SQL que:
- Crea la base de datos `base_empleados` con codificación UTF-8
- Define la tabla `personal` con campos: `id`, `nombre`, `cargo`, `sueldo`
- Inserta 30 registros de empleados de ejemplo con diferentes cargos

**Estructura de tabla:**
```sql
CREATE TABLE personal (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    cargo  VARCHAR(30),
    sueldo DECIMAL(10, 2)
);
```

**Datos incluidos:**
- 30 empleados con información realista
- Cargos variados: Gerente, Analista, Desarrollador, Tester, etc.
- Sueldos entre 1400 y 2550

#### `my.cnf`
Archivo de configuración de MySQL para personalizar el comportamiento del servidor de base de datos.

## Cómo Ejecutar la Práctica?

### Requisitos Previos
- Docker instalado en tu sistema
- Docker Compose (opcional, pero recomendado)
- Acceso a línea de comandos

### Opción 1: Con Docker Compose (Recomendado)

1. Crea un archivo `docker-compose.yml` en la raíz del proyecto:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql-empleados
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: base_empleados
    ports:
      - "3307:3306"
    volumes:
      - ./volumen:/docker-entrypoint-initdb.d
      - mysql-data:/var/lib/mysql
    networks:
      - app-network

  app:
    build: ./app-web
    container_name: app-express
    ports:
      - "7000:7000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: password
    networks:
      - app-network
    command: node index.js

volumes:
  mysql-data:

networks:
  app-network:
    driver: bridge
```

2. Ejecuta los contenedores:
```bash
docker-compose up -d
```

3. Verifica que todo esté funcionando:
```bash
docker-compose logs -f
```

### Opción 2: Contenedores Individuales

#### Contenedor MySQL:
```bash
docker run -d \
  --name mysql-empleados \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=base_empleados \
  -p 3307:3306 \
  -v $(pwd)/volumen:/docker-entrypoint-initdb.d \
  mysql:8.0
```

#### Contenedor Node.js:
```bash
cd app-web
docker build -t app-express .
docker run -d \
  --name app-express \
  -p 7000:7000 \
  --link mysql-empleados:mysql \
  app-express
```

## 📡 API REST

### Endpoint Disponible

#### GET `/`
Devuelve la lista completa de empleados en formato JSON.

**URL:**
```
http://localhost:7000/
```

**Respuesta (Ejemplo):**
```json
[
  {
    "id": 1,
    "nombre": "Juan Perez",
    "cargo": "Gerente",
    "sueldo": 2500.00
  },
  {
    "id": 2,
    "nombre": "Maria Garcia",
    "cargo": "Analista",
    "sueldo": 1800.50
  },
  ...
]
```

**Prueba con curl:**
```bash
curl http://localhost:7000/
```

**Códigos de respuesta:**
- `200 OK`: Consulta exitosa
- `500 Error en consulta SQL`: Error en la base de datos

## 🏗️ Conceptos Clave de Docker Aplicados

### Volúmenes
- **Persistencia de datos:** Los datos de MySQL se almacenan en un volumen que sobrevive aunque se elimine el contenedor
- **Inicialización:** El script SQL en `volumen/` se ejecuta automáticamente al crear el contenedor MySQL
- **Configuración:** El archivo `my.cnf` se copia al contenedor para personalizar MySQL

### Redes
- **Bridge network:** Los contenedores se comunican a través de una red interna
- **Service discovery:** Los contenedores pueden comunicarse por nombre de servicio (mysql, app)

### Contenedores
- **MySQL:** Imagen oficial de MySQL 8.0, servidor de base de datos
- **Node.js + Express:** Aplicación custom que se ejecuta en el contenedor

## 🔧 Configuración y Personalización

### Cambiar Puerto de la Aplicación
En `app-web/index.js`:
```javascript
const port = 7000; // Cambiar a otro puerto
```

### Cambiar Credenciales de Base de Datos
En `app-web/index.js`:
```javascript
const connection = mysql.createConnection({
    user: 'nuevo_usuario',
    password: 'nueva_contraseña',
    // ...
});
```

### Agregar Más Empleados
Edita `volumen/empleados.sql` y agrega más registros INSERT:
```sql
INSERT INTO personal (nombre, cargo, sueldo)
VALUES ('Nuevo Empleado', 'Cargo', 1500.00);
```

## 📊 Casos de Uso

Este proyecto es ideal para:

1. **Aprender Docker:** Entender cómo contenedorizar aplicaciones
2. **Practicar redes:** Aprender cómo se comunican contenedores
3. **Volúmenes:** Entender persistencia de datos
4. **APIs REST:** Desarrollo básico de endpoints
5. **Node.js + MySQL:** Integración de tecnologías backend
6. **CI/CD:** Base para pipelines de integración continua
7. **Microservicios:** Ejemplo simple de arquitectura con múltiples contenedores

## Errores comunes durante la práctica

### Error: "Connection refused"
**Solución:** Asegúrate de que MySQL está ejecutándose y disponible en el puerto 3307

### Error: "Unknown database 'base_empleados'"
**Solución:** Verifica que el script `empleados.sql` en `volumen/` se ejecutó correctamente al iniciar el contenedor

### Error: "Cannot connect to the Docker daemon"
**Solución:** Inicia el servicio de Docker en tu sistema

### Error de codificación UTF-8
**Solución:** La base de datos ya está configurada con UTF-8, pero si hay problemas, verifica que `my.cnf` tenga la configuración correcta

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo licencia ISC.

---

**Última actualización:** 2026-05-21  
**Autor:** María Girón -- Tecnología Superior en Desarrollo de Software -- EPN
**Repositorio:** [docker-practicas](https://github.com/MariaGiron-code/docker-practicas)
