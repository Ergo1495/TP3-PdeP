const readline = require('readline');
const fs = require('fs');

// ====== Clase Task ======
function Task(id, titulo, descripcion, estado, dificultad, creacion, ultimaEdicion, vencimiento) {
  this.id = id;
  this.titulo = titulo;
  this.descripcion = descripcion;
  this.estado = estado;
  this.dificultad = dificultad;
  this.creacion = creacion;
  this.ultimaEdicion = ultimaEdicion;
  this.vencimiento = vencimiento;
}

Task.prototype.showDetails = function() {
  console.log(`\nID: ${this.id}`);
  console.log(`Título: ${this.titulo}`);
  console.log(`Descripción: ${this.descripcion || 'Sin datos'}`);
  console.log(`Estado: ${this.estado}`);
  console.log(`Dificultad: ${this.dificultad} ${TaskManager.EMOJIS_DIFICULTAD[this.dificultad] || ''}`);
  console.log(`Creación: ${this.creacion}`);
  console.log(`Última Edición: ${this.ultimaEdicion}`);
  console.log(`Vencimiento: ${this.vencimiento || 'Sin datos'}`);
};

// ====== Clase TaskManager ======
function TaskManager() {
  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  this.tasks = [];
  this.TASKS_FILE = 'tasks.json';
}

TaskManager.ESTADOS = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En Curso',
  TERMINADA: 'Terminada',
  CANCELADA: 'Cancelada',
};

TaskManager.DIFICULTADES = {
  FACIL: 'Facil',
  MEDIO: 'Medio',
  DIFICIL: 'Dificil',
};

TaskManager.EMOJIS_DIFICULTAD = {
  [TaskManager.DIFICULTADES.FACIL]: '⭐',
  [TaskManager.DIFICULTADES.MEDIO]: '⭐⭐',
  [TaskManager.DIFICULTADES.DIFICIL]: '⭐⭐⭐',
};

TaskManager.prototype.getCurrentDate = function() {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

TaskManager.prototype.saveTasks = function() {
  try {
    fs.writeFileSync(this.TASKS_FILE, JSON.stringify(this.tasks, null, 2));
  } catch (error) {
    console.log('Error al guardar tareas:', error.message);
  }
};

TaskManager.prototype.loadTasks = function() {
  try {
    if (fs.existsSync(this.TASKS_FILE)) {
      const data = fs.readFileSync(this.TASKS_FILE, 'utf8');
      const loadedTasks = JSON.parse(data);
      this.tasks = loadedTasks.map((taskData, index) => {
        return new Task(
          index + 1,
          taskData.titulo,
          taskData.descripcion,
          taskData.estado,
          taskData.dificultad,
          taskData.creacion,
          taskData.ultimaEdicion,
          taskData.vencimiento
        );
      });
      console.log(`Cargadas ${this.tasks.length} tareas desde ${this.TASKS_FILE}.`);
    } else {
      console.log('Archivo de tareas no encontrado. Iniciando con lista vacía.');
    }
  } catch (error) {
    console.log('Error al cargar tareas. Iniciando con lista vacía:', error.message);
    this.tasks = [];
  }
};

TaskManager.prototype.closeApp = function() {
  this.saveTasks();
  console.log('¡Adiós!');
  this.rl.close();
};

TaskManager.prototype.pressEnterToContinue = function(message = 'Presiona Enter para continuar...') {
  return new Promise((resolve) => {
    console.log(message);
    this.rl.question('', () => resolve());
  });
};

TaskManager.prototype.getValidNumber = function(prompt, min, max) {
  return new Promise((resolve) => {
    this.rl.question(prompt, (input) => {
      const num = parseInt(input);
      if (isNaN(num) || num < min || num > max) {
        console.log('Opción inválida. Intenta de nuevo.');
        resolve(this.getValidNumber(prompt, min, max));
      } else {
        resolve(num);
      }
    });
  });
};

TaskManager.prototype.getValidString = function(prompt, maxLength, allowEmpty = false) {
  return new Promise((resolve) => {
    this.rl.question(`${prompt}: `, (input) => {
      const trimmed = input.trim();
      if (!allowEmpty && trimmed.length === 0) {
        console.log('Este campo no puede estar vacío. Intenta de nuevo.');
        resolve(this.getValidString(prompt, maxLength, allowEmpty));
      } else if (trimmed.length > maxLength) {
        console.log(`Máximo ${maxLength} caracteres. Intenta de nuevo.`);
        resolve(this.getValidString(prompt, maxLength, allowEmpty));
      } else {
        resolve(trimmed);
      }
    });
  });
};

TaskManager.prototype.getValidDate = function(prompt, allowEmpty = true) {
  return new Promise((resolve) => {
    this.rl.question(`${prompt} (YYYY-MM-DD): `, (input) => {
      if (allowEmpty && !input.trim()) {
        resolve(null);
        return;
      }
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        console.log('Fecha inválida. Usa formato YYYY-MM-DD.');
        resolve(this.getValidDate(prompt, allowEmpty));
      } else {
        resolve(date.toISOString().split('T')[0]);
      }
    });
  });
};

TaskManager.prototype.getDificultadSelection = function() {
  return new Promise((resolve) => {
    console.log('\nDificultades disponibles:');
    console.log('1. Facil');
    console.log('2. Medio');
    console.log('3. Dificil');
    this.rl.question('Selecciona la dificultad (1-3): ', (input) => {
      const num = parseInt(input);
      switch (num) {
        case 1: resolve(TaskManager.DIFICULTADES.FACIL); break;
        case 2: resolve(TaskManager.DIFICULTADES.MEDIO); break;
        case 3: resolve(TaskManager.DIFICULTADES.DIFICIL); break;
        default:
          console.log('Opción inválida.');
          resolve(this.getDificultadSelection());
      }
    });
  });
};

TaskManager.prototype.getEstadoSelection = function() {
  return new Promise((resolve) => {
    console.log('\nEstados disponibles:');
    console.log('1. Pendiente');
    console.log('2. En Curso');
    console.log('3. Terminada');
    console.log('4. Cancelada');
    this.rl.question('Selecciona el estado (1-4): ', (input) => {
      const num = parseInt(input);
      switch (num) {
        case 1: resolve(TaskManager.ESTADOS.PENDIENTE); break;
        case 2: resolve(TaskManager.ESTADOS.EN_CURSO); break;
        case 3: resolve(TaskManager.ESTADOS.TERMINADA); break;
        case 4: resolve(TaskManager.ESTADOS.CANCELADA); break;
        default:
          console.log('Opción inválida.');
          resolve(this.getEstadoSelection());
      }
    });
  });
};

// ======= AGREGAR TAREA =======
TaskManager.prototype.addTask = async function() {
  console.log('\n=== AGREGAR NUEVA TAREA ===');
  const titulo = await this.getValidString('Título', 100, false);
  const descripcion = await this.getValidString('Descripción', 500, true);
  const estado = await this.getEstadoSelection();
  const dificultad = await this.getDificultadSelection();
  const vencimiento = await this.getValidDate('Fecha de vencimiento');
  const creacion = this.getCurrentDate();
  const ultimaEdicion = creacion;

  const newTask = new Task(
    this.tasks.length + 1,
    titulo,
    descripcion,
    estado,
    dificultad,
    creacion,
    ultimaEdicion,
    vencimiento || null
  );

  this.tasks.push(newTask);
  this.saveTasks();
  console.log('¡Tarea agregada y guardada correctamente!');
  await this.pressEnterToContinue();
};

// ======= EDITAR TAREA =======
TaskManager.prototype.editTask = async function(task) {
  console.log(`\n=== EDITAR TAREA (${task.titulo}) ===`);

  const nuevoTitulo = await this.getValidString(`Nuevo título (actual: ${task.titulo})`, 100, true);
  if (nuevoTitulo) task.titulo = nuevoTitulo;

  const nuevaDescripcion = await this.getValidString(`Nueva descripción (actual: ${task.descripcion || 'N/A'})`, 500, true);
  if (nuevaDescripcion) task.descripcion = nuevaDescripcion;

  console.log(`Estado actual: ${task.estado}`);
  task.estado = await this.getEstadoSelection();

  console.log(`Dificultad actual: ${task.dificultad}`);
  task.dificultad = await this.getDificultadSelection();

  const nuevaFecha = await this.getValidDate(`Nueva fecha de vencimiento (actual: ${task.vencimiento || 'N/A'})`, true);
  if (nuevaFecha) task.vencimiento = nuevaFecha;

  task.ultimaEdicion = this.getCurrentDate();
  this.saveTasks();

  console.log('✅ Tarea actualizada correctamente.');
  await this.pressEnterToContinue();
};

// ======= ELIMINAR TAREA =======
TaskManager.prototype.deleteTask = async function(task) {
  console.log(`\n¿Estás seguro de eliminar la tarea "${task.titulo}"?`);
  this.rl.question('Escribe "SI" para confirmar: ', (input) => {
    if (input.trim().toUpperCase() === 'SI') {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
      this.tasks.forEach((t, i) => t.id = i + 1); // Reasignar IDs
      this.saveTasks();
      console.log('🗑️ Tarea eliminada correctamente.');
    } else {
      console.log('Cancelado.');
    }
    this.pressEnterToContinue().then(() => this.showMainMenu());
  });
};

// ======= LISTAR TAREAS =======
TaskManager.prototype.listTasks = async function(filteredTasks, fromSearch = false) {
  if (filteredTasks.length === 0) {
    console.log('\nNo hay tareas que cumplan con los criterios.');
    await this.pressEnterToContinue();
    if (fromSearch) this.showMainMenu();
    else this.showViewTasksMenu();
    return;
  }

  console.log('\n=== LISTA DE TAREAS ===');
  filteredTasks.forEach((t, i) => {
    console.log(`${i + 1}. ${t.titulo} (${t.estado})`);
  });
  console.log('0. Volver');

  const num = await this.getValidNumber('Selecciona una tarea o 0 para volver: ', 0, filteredTasks.length);
  if (num === 0) {
    if (fromSearch) this.showMainMenu();
    else this.showViewTasksMenu();
  } else {
    const selectedTask = filteredTasks[num - 1];
    selectedTask.showDetails();
    console.log('\n1. Editar');
    console.log('2. Eliminar');
    console.log('0. Volver');
    const opt = await this.getValidNumber('Selecciona una opción: ', 0, 2);
    if (opt === 1) await this.editTask(selectedTask);
    else if (opt === 2) await this.deleteTask(selectedTask);
    else await this.listTasks(filteredTasks, fromSearch);
  }
};

// ======= VER MENÚ DE TAREAS =======
TaskManager.prototype.showViewTasksMenu = async function() {
  console.log('\n=== VER MIS TAREAS ===');
  console.log('1. Ver todas las tareas');
  console.log('2. Ver pendientes');
  console.log('3. Ver en curso');
  console.log('4. Ver terminadas');
  console.log('0. Volver al menú principal');
  const option = await this.getValidNumber('Selecciona una opción: ', 0, 4);
  let filteredTasks = [];
  switch (option) {
    case 1:
      filteredTasks = [...this.tasks];
      break;
    case 2:
      filteredTasks = this.tasks.filter(t => t.estado === TaskManager.ESTADOS.PENDIENTE);
      break;
    case 3:
      filteredTasks = this.tasks.filter(t => t.estado === TaskManager.ESTADOS.EN_CURSO);
      break;
    case 4:
      filteredTasks = this.tasks.filter(t => t.estado === TaskManager.ESTADOS.TERMINADA);
      break;
    case 0:
      return this.showMainMenu();
  }
  await this.listTasks(filteredTasks);
};

// ======= BUSCAR TAREA =======
TaskManager.prototype.searchTask = async function() {
  console.log('\n=== BUSCAR TAREA ===');
  const query = await this.getValidString('Ingresa una palabra o frase para buscar en títulos', 100, false);
  const searchQuery = query.toLowerCase().trim();
  const filteredTasks = this.tasks.filter(task =>
    task.titulo.toLowerCase().includes(searchQuery)
  );

  if (filteredTasks.length === 0) {
    console.log('No se encontraron tareas que coincidan con la búsqueda.');
    await this.pressEnterToContinue();
    this.showMainMenu();
  } else {
    await this.listTasks(filteredTasks, true);
  }
};

// ======= MENÚ PRINCIPAL =======
TaskManager.prototype.showMainMenu = async function() {
  console.log('\n=== MENÚ PRINCIPAL ===');
  console.log('1. Ver mis tareas');
  console.log('2. Buscar una tarea');
  console.log('3. Agregar una tarea');
  console.log('0. Salir');

  const option = await this.getValidNumber('Selecciona una opción: ', 0, 3);

  switch (option) {
    case 1:
      await this.showViewTasksMenu();
      break;
    case 2:
      await this.searchTask();
      break;
    case 3:
      await this.addTask();
      break;
    case 0:
      return this.closeApp();
  }

  this.showMainMenu();
};

// ======= Iniciar aplicación =======
const taskManager = new TaskManager();
taskManager.loadTasks();
taskManager.showMainMenu();
