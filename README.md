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



## Día 3: [31 de Marzo]

Tarea realizada:

Laravel:He configurado la API para el registro de usuarios, permitiendo que los nuevos usuarios puedan crear una cuenta en la aplicación.También he implementado la funcionalidad de "Olvidar Contraseña", creando el endpoint que permite enviar un correo con el código de recuperación para restablecer la contraseña. Se ha integrado la generación de un token aleatorio para el restablecimiento de contraseña y su almacenamiento en la base de datos para verificar su validez.
Además, he configurado el envío de correos utilizando la API de Gmail, permitiendo que los mensajes de recuperación de contraseña se envíen directamente desde una cuenta de Gmail. Se implementó el uso del sistema de notificaciones de Laravel para enviar el correo con el token de recuperación.

Angular:He diseñado el formulario de registro y el de recuperación de contraseña utilizando HTML y CSS, asegurándome de que tengan una apariencia moderna y clara. En el componente de registro, configuré el archivo TypeScript para manejar el envío del formulario y la conexión con la API del backend. En el componente de "Olvidar Contraseña", también se implementó la lógica para enviar el correo de recuperación al backend, mostrando mensajes de éxito o error según corresponda. Los mensajes de respuesta se muestran de manera clara para que el usuario sepa si el proceso se completó correctamente o si hubo algún problema.



## Día 4: [2 de abril]

Tarea no realizada:

Me falta añadir la barra de búsqueda, mejorar algunos detalles del diseño para que sea más atractivo y configurar la API privada para que, después de iniciar sesión, los usuarios puedan comentar y valorar las películas.

Tarea realizada:

He integrado la API de TMDB en el backend de Laravel, configurando el controlador y los géneros de las películas. Esto me permite obtener datos sobre las películas populares y sus respectivas categorías desde TMDB, lo cual facilita la visualización y filtrado de películas en la aplicación.



## Día 5: [3 de abril]

tarea realizada:

Acabo de hacer seccion por categoria de cada pelicula


tarea no realizad:

Me fataria diseña poco mas el diseño y adaptar en cada dispositivos


## Día 6: [7 de abril]

tarea realizada:

Acabo de terminar la api de los foro y he hecho el postman y me funciona y solamente me faltaria acabar lo de angular que ya me queda poco

## Día 7: [11 de abril]

tarea realizada:

He terminado la api de cuando tu le da me gusta al catalogo de pelicula y se guaerde estos datos en el perfil