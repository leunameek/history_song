# DIAGRAMAS UML - HISTORYSONG

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
    subgraph "Actores del Sistema"
        U[Usuario]
        S[Spotify API]
        A[Administrador]
    end

    subgraph "Funcionalidades del Sistema"
        subgraph "Autenticación y Gestión de Usuario"
            UC1[Iniciar Sesión con Spotify]
            UC2[Cerrar Sesión]
            UC3[Gestionar Perfil]
        end

        subgraph "Análisis Musical"
            UC4[Ver Top Tracks]
            UC5[Analizar Historial de Escucha]
            UC6[Ver Estadísticas de Usuario]
        end

        subgraph "Búsqueda y Exploración"
            UC7[Buscar Música]
            UC8[Filtrar Resultados]
            UC9[Ver Detalles de Álbum]
        end

        subgraph "Creación de Pósters"
            UC10[Crear Póster]
            UC11[Personalizar Colores]
            UC12[Configurar Layout]
            UC13[Exportar Póster]
            UC14[Imprimir Póster]
        end

        subgraph "Gestión de Contenido"
            UC15[Extraer Colores de Imagen]
            UC16[Gestionar Configuraciones]
            UC17[Guardar Preferencias]
        end
    end

    %% Relaciones de Actores con Casos de Uso
    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    U --> UC11
    U --> UC12
    U --> UC13
    U --> UC14
    U --> UC15
    U --> UC16
    U --> UC17

    %% Relaciones con Spotify API
    S --> UC1
    S --> UC4
    S --> UC5
    S --> UC7
    S --> UC9

    %% Relaciones de Administrador
    A --> UC16
    A --> UC17

    %% Incluye y Extiende
    UC10 -.->|incluye| UC11
    UC10 -.->|incluye| UC12
    UC10 -.->|incluye| UC13
    UC11 -.->|extiende| UC15
    UC7 -.->|incluye| UC8
    UC7 -.->|incluye| UC9
```

---

## 2. Diagramas de Secuencia

### 2.1 Flujo de Autenticación y Obtención de Top Tracks

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant S as Spotify API
    participant DB as Base de Datos

    U->>F: Acceder a la aplicación
    F->>B: GET /auth/spotify
    B->>S: Redirigir a OAuth
    S->>U: Solicitar autorización
    U->>S: Autorizar aplicación
    S->>B: Callback con código
    B->>S: Intercambiar código por token
    S->>B: Token de acceso
    B->>DB: Guardar sesión JWT
    B->>F: Redirigir con JWT
    F->>B: GET /api/me (con JWT)
    B->>S: GET /me (con token Spotify)
    S->>B: Perfil de usuario
    B->>F: Datos del perfil
    F->>B: GET /api/top-tracks (con JWT)
    B->>S: GET /top-tracks (con token Spotify)
    S->>B: Lista de top tracks
    B->>F: Top tracks procesados
    F->>U: Mostrar dashboard con datos
```

### 2.2 Flujo de Búsqueda Musical y Creación de Póster

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant S as Spotify API
    participant C as Canvas

    U->>F: Escribir término de búsqueda
    F->>B: GET /api/search?q=query&type=track,album,artist,playlist
    B->>S: GET /search (con token Spotify)
    S->>B: Resultados de búsqueda
    B->>F: Resultados procesados
    F->>U: Mostrar resultados con imágenes

    U->>F: Seleccionar álbum para póster
    F->>B: GET /api/albums/{id} (con JWT)
    B->>S: GET /albums/{id} (con token Spotify)
    S->>B: Detalles completos del álbum
    B->>F: Datos del álbum
    F->>U: Abrir editor de póster

    U->>F: Configurar póster (colores, layout)
    F->>C: Crear canvas con configuración
    C->>F: Renderizar póster
    F->>U: Mostrar preview del póster

    U->>F: Solicitar exportación
    F->>C: Generar PNG
    C->>F: Archivo PNG
    F->>U: Descargar póster
```

---

## 3. Diagrama de Actividades

### 3.1 Flujo Principal de la Aplicación

```mermaid
flowchart TD
    A[Inicio] --> B{¿Usuario autenticado?}
    B -->|No| C[Redirigir a Spotify OAuth]
    B -->|Sí| D[Mostrar Dashboard]
    
    C --> E[Usuario autoriza en Spotify]
    E --> F[Callback con código]
    F --> G[Intercambiar código por token]
    G --> H[Crear sesión JWT]
    H --> D
    
    D --> I{¿Qué acción realizar?}
    
    I -->|Ver Top Tracks| J[Obtener datos de Spotify]
    I -->|Buscar Música| K[Realizar búsqueda]
    I -->|Crear Póster| L[Abrir editor]
    I -->|Ver Perfil| M[Mostrar información]
    
    J --> N[Procesar y mostrar tracks]
    K --> O[Filtrar y mostrar resultados]
    L --> P[Configurar póster]
    M --> Q[Mostrar perfil]
    
    P --> R{¿Personalizar colores?}
    R -->|Sí| S[Extraer colores de imagen]
    R -->|No| T[Usar colores por defecto]
    
    S --> U[Seleccionar colores]
    T --> U
    U --> V[Configurar layout]
    V --> W[Generar preview]
    W --> X{¿Exportar?}
    X -->|Sí| Y[Descargar PNG]
    X -->|No| W
    
    Y --> Z[Fin]
    N --> Z
    O --> Z
    Q --> Z
```

---

## 4. Diseño de Base de Datos

### 4.1 Diagrama Entidad-Relación

```mermaid
erDiagram
    USERS {
        string id PK
        string spotify_id UK
        string email
        string display_name
        string country
        string profile_image_url
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }

    SESSIONS {
        string id PK
        string user_id FK
        string spotify_access_token
        string spotify_refresh_token
        timestamp expires_at
        timestamp created_at
        boolean is_active
    }

    USER_PREFERENCES {
        string id PK
        string user_id FK
        string theme
        string language
        json display_settings
        timestamp created_at
        timestamp updated_at
    }

    SEARCH_HISTORY {
        string id PK
        string user_id FK
        string query
        string search_type
        int result_count
        timestamp searched_at
    }

    POSTER_TEMPLATES {
        string id PK
        string user_id FK
        string album_id
        string title
        json configuration
        string background_color
        string text_color
        string accent_color
        int font_size
        string layout
        boolean show_tracklist
        boolean show_album_info
        boolean show_qr_code
        timestamp created_at
        timestamp updated_at
    }

    ALBUM_CACHE {
        string id PK
        string spotify_album_id UK
        string name
        string album_type
        string release_date
        string label
        int total_tracks
        json images
        json external_urls
        timestamp cached_at
        timestamp expires_at
    }

    TRACK_CACHE {
        string id PK
        string spotify_track_id UK
        string album_id FK
        string name
        int duration_ms
        int track_number
        json external_urls
        timestamp cached_at
        timestamp expires_at
    }

    ARTIST_CACHE {
        string id PK
        string spotify_artist_id UK
        string name
        int popularity
        json genres
        json images
        json external_urls
        timestamp cached_at
        timestamp expires_at
    }

    %% Relaciones
    USERS ||--o{ SESSIONS : "tiene"
    USERS ||--o{ USER_PREFERENCES : "configura"
    USERS ||--o{ SEARCH_HISTORY : "realiza"
    USERS ||--o{ POSTER_TEMPLATES : "crea"
    
    ALBUM_CACHE ||--o{ TRACK_CACHE : "contiene"
    ALBUM_CACHE ||--o{ POSTER_TEMPLATES : "referenciado_en"
    
    SESSIONS }o--|| USERS : "pertenece_a"
    USER_PREFERENCES }o--|| USERS : "configurado_por"
    SEARCH_HISTORY }o--|| USERS : "realizado_por"
    POSTER_TEMPLATES }o--|| USERS : "creado_por"
    TRACK_CACHE }o--|| ALBUM_CACHE : "pertenece_a"
```

### 4.2 Esquema de Base de Datos SQL

```sql
-- Tabla de Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotify_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    country VARCHAR(10),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Tabla de Sesiones
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spotify_access_token TEXT NOT NULL,
    spotify_refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de Preferencias de Usuario
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'es',
    display_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Historial de Búsquedas
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_type VARCHAR(100) NOT NULL,
    result_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Plantillas de Pósters
CREATE TABLE poster_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    album_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    configuration JSONB NOT NULL,
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#000000',
    accent_color VARCHAR(7) DEFAULT '#1DB954',
    font_size INTEGER DEFAULT 16,
    layout VARCHAR(20) DEFAULT 'vertical',
    show_tracklist BOOLEAN DEFAULT true,
    show_album_info BOOLEAN DEFAULT true,
    show_qr_code BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Caché de Álbumes
CREATE TABLE album_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotify_album_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    album_type VARCHAR(50),
    release_date DATE,
    label VARCHAR(255),
    total_tracks INTEGER,
    images JSONB,
    external_urls JSONB,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Tabla de Caché de Tracks
CREATE TABLE track_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotify_track_id VARCHAR(255) UNIQUE NOT NULL,
    album_id UUID NOT NULL REFERENCES album_cache(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    duration_ms INTEGER,
    track_number INTEGER,
    external_urls JSONB,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Tabla de Caché de Artistas
CREATE TABLE artist_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotify_artist_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    popularity INTEGER,
    genres JSONB,
    images JSONB,
    external_urls JSONB,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Índices para optimización
CREATE INDEX idx_users_spotify_id ON users(spotify_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at);
CREATE INDEX idx_poster_templates_user_id ON poster_templates(user_id);
CREATE INDEX idx_album_cache_expires_at ON album_cache(expires_at);
CREATE INDEX idx_track_cache_album_id ON track_cache(album_id);
CREATE INDEX idx_artist_cache_expires_at ON artist_cache(expires_at);
```

---

## 5. Resumen de la Arquitectura UML

### **Actores Identificados:**
1. **Usuario**: Usuario final de la aplicación
2. **Spotify API**: Servicio externo de música
3. **Administrador**: Usuario con privilegios especiales

### **Casos de Uso Principales:**
- **17 Casos de Uso** cubriendo todas las funcionalidades
- **Autenticación OAuth 2.0** con Spotify
- **Análisis musical** y estadísticas
- **Búsqueda avanzada** en catálogo
- **Creación de pósters** personalizados
- **Gestión de contenido** y preferencias

### **Flujos de Secuencia:**
- **Autenticación y obtención de datos**
- **Búsqueda y creación de pósters**

### **Modelo de Datos:**
- **9 Entidades principales** con relaciones bien definidas
- **Sistema de caché** para optimización
- **Historial de búsquedas** y preferencias
- **Plantillas de pósters** personalizables

### **Características Técnicas:**
- **Arquitectura modular** y escalable
- **Separación clara** de responsabilidades
- **Optimización de consultas** con índices
- **Gestión de sesiones** segura con JWT
