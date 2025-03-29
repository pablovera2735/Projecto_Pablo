# Projecto_Pablo

## Día 1: [25 de Marzo]
Tarea realizada:

Inicialización de Angular y Laravel:

-Angular: He creado un nuevo proyecto de Angular con el comando ng new frontend --standalone false --routing false, desactivando la opción de standalone y el enrutamiento para este proyecto, ya que no los necesito en esta etapa inicial. Luego, instalé las dependencias básicas necesarias para el proyecto.

-Laravel: He creado un nuevo proyecto de Laravel utilizando el comando composer create-project laravel/laravel backend. Posteriormente, configuré la base de datos en el archivo .env y verifiqué que todo funcionara correctamente al ejecutar php artisan serve.


## Día 2: [29 de Marzo]
Tarea realizada:

-Angular:He configurado las rutas en Angular y creado los componentes necesarios para la funcionalidad de login. He implementado un archivo separado para el servicio de autenticación, gestionando la lógica de login y sesión de usuario. Modifiqué el archivo app.module.ts para importar y configurar automáticamente los módulos necesarios, asegurando que todo funcione correctamente con la configuración de rutas y autenticación.

Laravel: He configurado las rutas en Laravel para las funciones necesarias del backend. Realicé la migración de las tablas necesarias y poblé las tablas con datos de prueba utilizando los seeds correspondientes. Configuré CORS en Laravel para permitir solicitudes desde el frontend en Angular. Actualicé el archivo config/cors.php para permitir acceso desde el dominio adecuado. Modifiqué el archivo RouteServiceProvider.php para ajustar el namespace de las rutas y asegurar que se apliquen correctamente los controladores con el namespace adecuado.