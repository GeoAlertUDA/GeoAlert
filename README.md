# GeoAlert 📍🔔
> Nunca más te pasás de parada.
<img width="506" height="631" alt="image" src="https://github.com/user-attachments/assets/2341f94d-68d3-4006-acdb-ef37b60ff1dd" />

GeoAlert es una aplicación móvil que configura alertas sonoras basadas en ubicación geográfica en tiempo real, pensada para usuarios de transporte público.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Expo + React Native |
| Lenguaje | TypeScript |
| Estilos | NativeWind (Tailwind para RN) |
| Estado global | Zustand |
| Componentes | Nativos del SO (sin librerías UI externas) |
| Navegación | React Navigation |

---

## Equipo

| Nombre | GitHub | Plataforma de testeo |
|---|---|---|
| Pablo | @pabloosoor | IOS |
| Ambar | @ambargorgon | iOS |
| Isabella | @isabellaromo | iOS |
| Candela | @candelabp | Android |
| Diego | — | Android |
| Juan | — | Android |

---

## Arquitectura

El proyecto sigue una **arquitectura por features**. Cada funcionalidad vive en su propia carpeta con todo lo que necesita: pantallas, componentes, store y servicios.

```
src/
├── features/
│   ├── alerts/          # Crear, editar y gestionar alertas
│   ├── map/             # Mapa y visualización de ubicación
│   ├── location/        # Servicio de GPS y geofencing
│   └── onboarding/      # Permisos y primer uso
├── components/          # Componentes compartidos entre features
├── navigation/          # Configuración de rutas
├── store/               # Stores globales de Zustand
├── constants/           # Colores, tamaños, textos
├── types/               # Interfaces y tipos globales
└── utils/               # Funciones puras reutilizables
```

---

## Convenciones

### Componentes nativos
Usamos componentes nativos del sistema operativo. Si un componente se comporta diferente entre iOS y Android, el fix se aplica con un comentario explicando el problema y para qué plataforma aplica:

```tsx
{/* FIX Android: ScrollView no respeta el paddingBottom en Android < 12.
    Referencia: components/common/ScreenWrapper.tsx */}
```

### Ramas

| Rama | Propósito |
|---|---|
| `main` | Producción. Requiere 2 aprobaciones. |
| `develop` | Integración. Requiere 1 aprobación. |
| `feature/<nombre>` | Sale de `develop`, vuelve a `develop`. |

```bash
# Iniciar una feature
git checkout develop
git pull origin develop
git checkout -b feature/nombre-de-la-feature
```

### Commits

```
feat: agregar radio configurable en mapa
fix: corregir crash al denegar permisos GPS
refactor: separar lógica de geofencing en hook
docs: actualizar DOCUMENTACION.md con feature de alertas
chore: actualizar dependencias de expo
```

### Pull Requests
- Título claro que describa el cambio
- Descripción con qué hace la feature y cómo probarla
- Mínimo **2 aprobaciones** para mergear a `main`
- Mínimo **1 aprobación** para mergear a `develop`
- Todos los comentarios del review deben estar resueltos antes de mergear

---

## Instalación

```bash
# Clonar el repo
git clone https://github.com/GeoAlertUDA/GeoAlert.git
cd GeoAlert

# Instalar dependencias
npm install

# Iniciar en iOS
npx expo start --ios

# Iniciar en Android
npx expo start --android
```

---

## Documentación

Ver https://docs.google.com/document/d/1kRK9Bq-zHsbzfDOeFmqHY7taNy15VEIX6R7IiKpPpik/edit?usp=sharing
para el detalle de cada feature implementada y aprobada.

---

## Metodología

El equipo trabaja con **Jira** para la gestión de tareas. Cada rama de feature corresponde a un ticket de Jira.
