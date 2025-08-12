# DOCUMENTO TÉCNICO - HISTORYSONG

## Resumen del Proyecto

**HistorySong** es una aplicación web full-stack que permite a los usuarios explorar y analizar su historial musical de Spotify, crear pósters personalizados de álbumes, y buscar en el catálogo completo de Spotify. La aplicación combina funcionalidades de análisis de datos musicales con herramientas creativas de diseño.

### Tecnologías Utilizadas

- **Backend**: Go (Golang) con Gin framework
- **Frontend**: React con TypeScript y Tailwind CSS
- **Base de Datos**: PostgreSQL
- **Autenticación**: OAuth 2.0 con Spotify + JWT
- **API Externa**: Spotify Web API
- **Herramientas de Desarrollo**: Air (hot reload), Docker

---

## Cliente

### Perfil del Usuario
- **Usuarios de Spotify**: Personas que utilizan regularmente la plataforma de streaming musical
- **Entusiastas de la música**: Usuarios interesados en analizar sus hábitos de escucha
- **Diseñadores creativos**: Usuarios que desean crear contenido visual personalizado basado en música
- **Desarrolladores**: Programadores que buscan una aplicación de ejemplo para integración con APIs de música

### Características Demográficas
- **Edad**: 18-45 años
- **Interés**: Música, tecnología, análisis de datos, diseño creativo
- **Nivel técnico**: Desde básico hasta avanzado

---

## Necesidad Identificada

### Problemas Actuales
1. **Limitaciones de Spotify**: La plataforma nativa no permite análisis detallado del historial de escucha
2. **Falta de Personalización**: No existe una forma fácil de crear contenido visual personalizado basado en música
3. **Análisis Superficial**: Los usuarios no pueden obtener insights profundos sobre sus preferencias musicales
4. **Integración Limitada**: Falta de herramientas que conecten datos musicales con funcionalidades creativas

### Oportunidades Identificadas
1. **Análisis de Datos Musicales**: Proporcionar insights detallados sobre hábitos de escucha
2. **Herramientas Creativas**: Permitir la creación de pósters y contenido visual personalizado
3. **Integración de APIs**: Demostrar el potencial de la Spotify Web API
4. **Experiencia de Usuario**: Crear una interfaz intuitiva para exploración musical

---

## Solución Propuesta

### Arquitectura de la Solución
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Spotify API   │
│   (React)       │◄──►│   (Go/Gin)      │◄──►│   (OAuth 2.0)   │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Autenticación │    │ • Perfil        │
│ • Búsqueda      │    │ • Middleware    │    │ • Top Tracks    │
│ • Pósters       │    │ • Base de datos │    │ • Álbumes       │
│ • Análisis      │    │ • API Routes    │    │ • Búsqueda      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Componentes Principales

#### 1. **Sistema de Autenticación**
- Integración OAuth 2.0 con Spotify
- Gestión de tokens JWT para sesiones
- Middleware de autenticación para rutas protegidas

#### 2. **Dashboard Principal**
- Visualización de perfil de usuario
- Estadísticas de escucha
- Acceso rápido a funcionalidades principales

#### 3. **Análisis de Top Tracks**
- Ranking de canciones más escuchadas
- Filtros por período temporal
- Métricas de popularidad y duración

#### 4. **Sistema de Búsqueda**
- Búsqueda en tiempo real en catálogo de Spotify
- Filtros por tipo (canciones, álbumes, artistas, playlists)
- Resultados con imágenes y metadatos

#### 5. **Editor de Pósters**
- Creación de pósters personalizados de álbumes
- Configuración de colores, fuentes y layout
- Exportación en formato PNG
- Funcionalidad de impresión

#### 6. **Gestión de Álbumes**
- Detalles completos de álbumes
- Información de tracks y artistas
- Metadatos de lanzamiento y etiqueta

---

## Requerimientos del Sistema

### Requerimientos Funcionales

#### **RF-001: Autenticación de Usuario**
- **Descripción**: El sistema debe permitir a los usuarios autenticarse usando su cuenta de Spotify
- **Acciones**:
  - Iniciar sesión con OAuth 2.0
  - Gestionar tokens de acceso
  - Mantener sesiones activas
  - Cerrar sesión de forma segura

#### **RF-002: Gestión de Perfil de Usuario**
- **Descripción**: El sistema debe mostrar y gestionar información del perfil de Spotify del usuario
- **Acciones**:
  - Obtener datos del perfil (nombre, imagen, país)
  - Mostrar estadísticas básicas de usuario
  - Gestionar preferencias de visualización

#### **RF-003: Análisis de Top Tracks**
- **Descripción**: El sistema debe analizar y mostrar las canciones más escuchadas del usuario
- **Acciones**:
  - Obtener top tracks de diferentes períodos (corto, medio, largo plazo)
  - Calcular métricas de popularidad
  - Mostrar información detallada de cada track
  - Permitir filtrado y ordenamiento

#### **RF-004: Sistema de Búsqueda Musical**
- **Descripción**: El sistema debe permitir buscar en el catálogo completo de Spotify
- **Acciones**:
  - Búsqueda por texto en tiempo real
  - Filtrado por tipo de contenido (canciones, álbumes, artistas, playlists)
  - Mostrar resultados con imágenes y metadatos
  - Enlaces directos a Spotify

#### **RF-005: Gestión de Detalles de Álbumes**
- **Descripción**: El sistema debe mostrar información detallada de álbumes específicos
- **Acciones**:
  - Obtener metadatos completos del álbum
  - Mostrar lista de tracks con duración
  - Información de artistas y colaboradores
  - Datos de lanzamiento y etiqueta discográfica

#### **RF-006: Editor de Pósters**
- **Descripción**: El sistema debe permitir crear pósters personalizados de álbumes
- **Acciones**:
  - Seleccionar álbum para póster
  - Configurar colores de fondo, texto y acentos
  - Ajustar tamaño de fuente y layout
  - Incluir/ocultar elementos (tracklist, información del álbum, código QR)
  - Exportar en formato PNG
  - Imprimir póster

#### **RF-007: Gestión de Colores**
- **Descripción**: El sistema debe extraer y gestionar colores dominantes de portadas de álbumes
- **Acciones**:
  - Extraer colores dominantes de imágenes
  - Permitir selección de colores por clic en imagen
  - Aplicar colores a elementos del póster
  - Sugerir combinaciones de colores armónicas

#### **RF-008: Sistema de Exportación**
- **Descripción**: El sistema debe permitir exportar contenido generado
- **Acciones**:
  - Descargar pósters en formato PNG
  - Generar nombres de archivo automáticos
  - Mantener calidad de imagen óptima
  - Preparar archivos para impresión

#### **RF-009: Gestión de Sesiones**
- **Descripción**: El sistema debe gestionar sesiones de usuario de forma segura
- **Acciones**:
  - Validar tokens JWT
  - Renovar tokens expirados
  - Gestionar múltiples sesiones
  - Implementar logout seguro

#### **RF-010: Interfaz Responsiva**
- **Descripción**: El sistema debe funcionar correctamente en diferentes dispositivos
- **Acciones**:
  - Adaptar layout a pantallas móviles
  - Optimizar controles para dispositivos táctiles
  - Mantener funcionalidad en diferentes resoluciones
  - Proporcionar experiencia consistente

### Requerimientos No Funcionales

#### **RNF-001: Rendimiento**
- Tiempo de respuesta de API < 500ms
- Carga inicial de página < 3 segundos
- Soporte para 100+ usuarios concurrentes

#### **RNF-002: Seguridad**
- Autenticación OAuth 2.0 segura
- Encriptación de tokens JWT
- Validación de entrada de usuario
- Protección contra ataques CSRF

#### **RNF-003: Escalabilidad**
- Arquitectura modular para fácil expansión
- Base de datos optimizada para consultas
- Caché de respuestas de API externas
- Separación clara de responsabilidades

#### **RNF-004: Usabilidad**
- Interfaz intuitiva y fácil de usar
- Navegación clara y consistente
- Feedback visual para acciones del usuario
- Accesibilidad para usuarios con discapacidades

#### **RNF-005: Mantenibilidad**
- Código bien documentado
- Estructura de proyecto clara
- Tests automatizados
- Logs detallados para debugging

---

## Arquitectura Técnica

### **Backend (Go)**
```
internal/
├── auth/          # Autenticación y autorización
├── database/      # Capa de acceso a datos
├── middleware/    # Middleware HTTP
├── server/        # Configuración del servidor y rutas
└── spotify/       # Cliente de Spotify API
```

### **Frontend (React)**
```
src/
├── components/    # Componentes reutilizables
├── assets/        # Recursos estáticos
├── App.tsx        # Componente principal
└── main.tsx       # Punto de entrada
```

### **Flujo de Datos**
1. Usuario inicia sesión → OAuth 2.0 con Spotify
2. Backend valida token → Crea sesión JWT
3. Frontend solicita datos → Backend consulta Spotify API
4. Datos se procesan y formatean → Respuesta al frontend
5. Frontend renderiza interfaz → Usuario interactúa
6. Acciones del usuario → Backend procesa y responde

---

## Estado Actual del Proyecto

### ✅ **Funcionalidades Implementadas**
- Sistema de autenticación OAuth 2.0
- Dashboard principal con perfil de usuario
- Análisis de top tracks por período
- Sistema de búsqueda musical completo
- Gestión de detalles de álbumes
- Editor de pósters con personalización
- Sistema de extracción de colores
- Exportación de pósters en PNG
- Interfaz responsiva y moderna

### 🔄 **En Desarrollo**
- Optimizaciones de rendimiento
- Tests automatizados
- Documentación de API
- Mejoras de UX/UI

### 📋 **Próximas Funcionalidades**
- Historial de pósters creados
- Plantillas predefinidas de pósters
- Compartir pósters en redes sociales
- Análisis de tendencias musicales
- Recomendaciones personalizadas

---

## Conclusión

HistorySong representa una solución completa e innovadora para la exploración y análisis musical, combinando funcionalidades técnicas avanzadas con una experiencia de usuario intuitiva. La arquitectura modular y las tecnologías modernas utilizadas proporcionan una base sólida para futuras expansiones y mejoras.

El proyecto demuestra el potencial de la integración de APIs de música con herramientas creativas, ofreciendo valor real a los usuarios de Spotify mientras sirve como ejemplo de desarrollo full-stack moderno.
