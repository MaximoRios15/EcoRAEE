Product Backlog Items (Elementos del Backlog del Producto)

Epic 1: Registro y Gestión de Usuarios
N° Acciones Referencias
1.1 Como ciudadano, quiero registrarme en la
plataforma para donar o intercambiar productos
electrónicos.

- Formulario con validación de datos personales
(nombre, email, dirección)
- Confirmación por email.

1.2 Como técnico registrado, quiero acceder a una
cuenta con perfil profesional para ofrecer
servicios.

- Opción para cargar credenciales y alidarlas.
- Se etiqueta el usuario como “Técnico
certificado”.

1.3 Como docente/alumno, quiero tener un perfil
institucional para solicitar RAEE para fines
educativos.

- Rol especial para instituciones educativas.
- Acceso a sección exclusiva para solicitar
componentes.

Epic 2: Publicación y Gestión de RAEE
N° Acciones Referencias
2.1 Como ciudadano, quiero publicar productos
electrónicos en desuso para que otros puedan
reutilizarlos.

- Formulario con foto, descripción, categoría
(electrodoméstico, PC, celular, etc.)
- Estado inicial: “Disponible”.

2.2 Como usuario, quiero consultar un catálogo
público para ver productos disponibles.

- Catálogo con filtros por categoría, estado, y
ubicación.
- Opción para ver puntos necesarios para canje.

2.3 Como técnico, quiero reservar RAEE desde la
plataforma para usar piezas en reparaciones.

- Botón “Reservar” en cada publicación.
- Notificación al publicador sobre la reserva.

Epic 3: Sistema de Incentivos y Puntos
N° Acciones Referencias
3.1 Como ciudadano, quiero recibir puntos por
donar RAEE para canjearlos por productos o
servicios.

- Cada publicación donada genera puntos (según
peso o tipo de RAEE)
- Los puntos se reflejan en el perfil del usuario.

3.2 Como usuario, quiero usar mis puntos para
obtener productos sin costo.

- En el catálogo, opción “Canjear con puntos”.
- Validación: puntos ≥ valor del producto.

3.3 Como ciudadano, quiero canjear puntos por
servicios técnicos registrados para reparar
equipos.

- Catálogo de servicios con costo en puntos.
- Confirmación del canje vía plataforma.

Epic 4: Trazabilidad y Logística
N° Acciones Referencias
4.1 Como usuario, quiero ver el estado del RAEE
que doné para saber cuándo fue recolectado y
reutilizado.

- Estados: “Publicado”, “Reservado”,
“Retirado”, “Reutilizado”.

4.2 Como sistema, quiero asignar automáticamente
el punto de recolección más cercano para
facilitar la logística.

- Algoritmo basado en ubicación del donante.
- Visualización en mapa del centro más
próximo.

4.3 Como técnico, quiero generar un comprobante
digital de retiro para garantizar trazabilidad.

- PDF con QR, datos del donante, fecha y
detalles del RAEE.
- Firma digital o confirmación en la app.

Epic 5: Comunicación y Educación
N° Acciones Referencias
5.1 Como usuario, quiero recibir notificaciones
(email) para conocer actualizaciones de mis
RAEE.

- Notificación al publicar, reservar o entregar
un producto.
- Configuración para activar/desactivar alertas.

5.2 Como institución educativa, quiero acceder a
contenido educativo sobre reciclaje para enseñar
buenas prácticas.

- Sección “Educación Ambiental” en el portal.
- Descarga de guías, tutoriales y normativa
vigente.

Epic 6: Seguridad y Cumplimiento
N° Acciones Referencias
6.1 Como sistema, quiero autenticar usuarios
mediante Token para asegurar las transacciones.

- Cada request debe llevar un token válido.
- Expiración configurable y ruta para renovar
token.
6.2 Como administrador, quiero controlar permisos
según roles para evitar accesos no autorizados.

- Roles: Ciudadano, Técnico, Institución,
Admin.
- Diferenciación clara en funcionalidades y
vistas.
6.3 Como sistema, quiero registrar logs de actividad
para auditoría y trazabilidad.

- Base de datos con acciones críticas
(publicación, canje, retiro)
- Panel para consultas por fecha y usuario.

Epic 7: Requerimientos No Funcionales
❖ Escalabilidad: Arquitectura preparada para crecimiento en usuarios y transacciones.
❖ Usabilidad: Diseño responsive para móviles y tablets.
❖ Disponibilidad: SLA mínimo del 99% para la plataforma web.
❖ Seguridad: Cifrado de datos en tránsito (HTTPS) y en reposo.