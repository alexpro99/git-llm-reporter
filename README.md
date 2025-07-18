# Git LLM Reporter

Una herramienta de línea de comandos para generar reportes de trabajo automáticos a partir de los logs de commits de Git, utilizando la potencia de la IA de Gemini.

## Descripción

Este script analiza un rango de commits de un repositorio Git, extrae la información relevante (autor, fecha y mensaje) y utiliza un modelo de lenguaje generativo para crear un reporte estructurado y profesional. Es ideal para Tech Leads, Project Managers o desarrolladores que necesiten resumir el trabajo realizado en un periodo de tiempo.

## Requerimientos

Antes de empezar, asegúrate de tener lo siguiente:

1.  **Node.js y npm:** Necesarios para ejecutar el script y gestionar las dependencias. Puedes descargarlos desde [nodejs.org](https://nodejs.org/).
2.  **Git:** El script interactúa con un repositorio Git, por lo que Git debe estar instalado.
3.  **API Key de Gemini:**
    *   Ve a [Google AI Studio](https://aistudio.google.com/app/apikey) y obtén una clave de API.
    *   Crea un archivo `.env` en la raíz del proyecto.
    *   Añade tu clave al archivo de la siguiente manera:
        ```
        GEMINI_API_KEY=tu_api_key_aqui
        ```

## Instalación

Para poder usar la herramienta desde cualquier ubicación en tu terminal, se recomienda instalarla de forma global.

```bash
    npm i -g git-llm-reporter
```
    

## Uso

El script se ejecuta desde la línea de comandos, proporcionando un rango de commits o una rama.

### Tipos de Reporte

Puedes generar diferentes tipos de reportes según tus necesidades:

*   **Reporte Resumido (`summary`):** (Por defecto)
    *   **Visión:** Global y orientada a la gestión.
    *   **Ideal para:** Tech Leads y Project Managers.
    *   **Contenido:** Ofrece un resumen de alto nivel del trabajo realizado, agrupando las contribuciones por desarrollador y destacando los objetivos alcanzados.

*   **Reporte Personal (`personal`):**
    *   **Visión:** Enfocada en las contribuciones individuales.
    *   **Ideal para:** Desarrolladores que necesitan documentar su trabajo.
    *   **Contenido:** Genera un listado de tareas específicas realizadas por cada desarrollador, perfecto para reportes de actividad o "daily stand-ups".
    *   **Uso:** `gitreport <rango> --report-type personal`

*   **Análisis Profundo (`--deep-dive`):**
    *   **Visión:** Técnica y detallada.
    *   **Ideal para:** Arquitectos de Software y revisiones de código.
    *   **Contenido:** No solo analiza los mensajes de commit, sino también los cambios en el código (`diffs`). El proceso divide los commits en fragmentos (`chunks`), analiza cada uno para entender los cambios técnicos y funcionales, y finalmente consolida todo en un reporte de "Análisis Profundo".
    *   **Uso:** `gitreport <rango> --deep-dive`

### Exportar Reportes

Puedes exportar cualquier reporte a un archivo Markdown utilizando la opción `-o` o `--out`.

```bash
# Exporta un reporte resumido a un archivo llamado 'reporte.md'
gitreport -b main -d 7 -o reporte.md

# Exporta un análisis profundo a una ruta específica
gitreport main..develop --deep-dive -o C:/Users/Pepe/Desktop/analisis_tecnico.md
```

### Comando Principal

Para generar un reporte, utiliza el siguiente formato:

```bash
gitreport <rango_de_commits> [opciones]
gitreport -b <rama> [opciones]
```

El `<rango_de_commits>` sigue la notación estándar de Git: `rama_base..rama_a_comparar`.

### Argumentos

*   `<rango_de_commits>`: Especifica los commits que se deben analizar.
    *   Ejemplo: `main..develop` analizará los commits que están en `develop` pero no en `main`.
    *   Ejemplo: `HEAD~5..HEAD` analizará los últimos 5 commits.
*   `-b, --branch`: Especifica la rama para obtener los commits.
*   `-d, --days`: Número de días hacia atrás (por defecto: 7).
*   `--report-type`: `summary` o `personal`.
*   `--deep-dive`: Activa el análisis profundo.
*   `-o, --out`: Ruta para exportar el reporte en formato Markdown.

## Ejemplo de Uso

Supongamos que quieres generar un reporte del trabajo realizado en la rama `feature/new-auth` que aún no se ha fusionado a `main`.

1.  Asegúrate de estar en el directorio de tu repositorio Git.
2.  Ejecuta el siguiente comando:

    ```bash
    gitreport main..feature/new-auth
    ```

3.  El script comenzará a procesar los logs y, después de unos segundos, imprimirá el reporte generado por la IA directamente en tu consola.

    ```
    Obteniendo logs para el rango: main..feature/new-auth...
    Logs obtenidos. Enviando a Gemini para generar el reporte...

    --- INICIO DEL REPORTE ---

    **Reporte de Trabajo Semanal: Implementación de Autenticación**

    **Introducción:**
    El trabajo de esta semana se centró en el desarrollo e integración de un nuevo sistema de autenticación de usuarios. Las tareas incluyeron la creación de endpoints, validaciones y la conexión con la base de datos.

    **Análisis de Contribuciones por Desarrollador:**

    *   **Desarrollador: Ana**
        *   Implementó el endpoint de login (`/login`).
        *   Añadió validación de contraseñas seguras.
        *   Creó tests unitarios para el flujo de autenticación.

    *   **Desarrollador: Juan**
        *   Configuró el modelo de usuario en la base de datos.
        *   Creó el endpoint de registro (`/register`).

    **Observaciones:**
    *   Ana mostró un buen dominio de las prácticas de seguridad.
    *   Juan estableció una base sólida para la gestión de usuarios.

    **Estimación de Tiempo de Desarrollo:**
    *   Ana: 12 horas
    *   Juan: 8 horas

    --- FIN DEL REPORTE ---
    ```
## Aviso Legal y Estado del Proyecto

**Este proyecto es un prototipo en desarrollo.**

La herramienta se encuentra en una fase experimental y está en constante mejora. Su objetivo es demostrar el potencial de la IA para automatizar tareas de gestión de proyectos.

**Limitación de Responsabilidad:**
El autor no se hace responsable de los posibles errores, omisiones o inconvenientes que puedan surgir del uso de este script. Úselo bajo su propio riesgo y considere que los reportes generados pueden requerir supervisión y validación manual.
