/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos (semánticos)
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bug
        'docs', // Documentación
        'style', // Cambios de formato (no afectan lógica)
        'refactor', // Refactorización de código
        'perf', // Mejoras de rendimiento
        'test', // Tests
        'build', // Cambios en build/dependencias
        'ci', // Cambios en CI/CD
        'chore', // Tareas de mantenimiento
        'revert', // Revertir cambios
      ],
    ],
    // El tipo es obligatorio
    'type-empty': [2, 'never'],
    // El scope (módulo/entidad) es obligatorio
    'scope-empty': [2, 'never'],
    // Scopes permitidos (Feature-Sliced Design)
    'scope-enum': [
      2,
      'always',
      [
        // Capas FSD
        'app', // Capa app (layout, providers, pages)
        'widgets', // Widgets (task-board)
        'features', // Features generales
        'entities', // Entities generales
        'shared', // Shared generales

        // Features específicas
        'create-task', // Feature crear tarea
        'delete-task', // Feature eliminar tarea
        'edit-task', // Feature editar tarea
        'filter-tasks', // Feature filtrar tareas
        'reorder-tasks', // Feature reordenar tareas
        'toggle-task', // Feature toggle tarea
        'toggle-theme', // Feature toggle tema

        // Entities específicas
        'task', // Entity tarea

        // Shared específicos
        'api', // Shared API/repositorios
        'hooks', // Shared hooks
        'ui', // Shared UI components
        'lib', // Shared lib/utils
        'config', // Shared config

        // Otros
        'tests', // Tests
        'deps', // Dependencias
        'ci', // CI/CD
      ],
    ],
    // El subject es obligatorio
    'subject-empty': [2, 'never'],
    // Longitud máxima del header (tipo + scope + subject)
    'header-max-length': [2, 'always', 72],
    // Subject debe empezar en minúscula
    'subject-case': [2, 'always', 'lower-case'],
    // Subject no debe terminar en punto
    'subject-full-stop': [2, 'never', '.'],
    // Body debe tener línea en blanco antes
    'body-leading-blank': [1, 'always'],
    // Footer debe tener línea en blanco antes
    'footer-leading-blank': [1, 'always'],
  },
};
