# 🎮 Squar3 Game

Juego minimalista de números con grid 4x4 interactivo.

## 🌟 Características

- **Grid 4x4**: 16 botones con números aleatorios del 1 al 9
- **Números objetivo**: 4 números (13-19) debajo de cada columna
- **Pull-to-refresh**: Desliza hacia abajo en móvil para regenerar
- **Diseño minimalista**: Blanco, negro y verde neón
- **Responsive**: Perfectamente adaptado para móviles
- **Parámetros URL**: Personaliza los números del juego
- **Suma garantizada**: Los números generados suman más de 68
- **Botón reiniciar**: Restaura el tablero inicial
- **Responsive**: Funciona en dispositivos móviles
- **Control por teclado**: Navega con las flechas del teclado

## 🎯 Cómo Jugar

1. **Seleccionar celdas**: Haz clic en cualquier celda para cambiar su color
2. **Cambiar colores**: Cada clic avanza al siguiente color en la secuencia
3. **Completar**: Pulsa el botón "Completar" para eliminar las celdas seleccionadas
4. **Gravedad**: Las celdas restantes caen automáticamente hacia abajo
5. **Reiniciar**: Usa el botón "Reiniciar" para volver al tablero original

## 🎨 Colores Disponibles

- Gris (estado inicial)
- Rojo coral (#ff6b6b)
- Verde azulado (#4ecdc4)
- Azul cielo (#45b7d1)
- Amarillo dorado (#f9ca24)
- Púrpura (#6c5ce7)
- Lavanda (#a29bfe)

## ⚡ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con gradientes y animaciones
- **JavaScript ES6**: Lógica del juego y efectos interactivos

## 🚀 Instalación Local

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/squar3-game.git
   ```

2. Abre `index.html` en tu navegador

¡No se requiere instalación adicional!

## 🎮 Controles

### Ratón/Touch:
- **Clic**: Cambiar color de celda
- **Botón Completar**: Eliminar celdas seleccionadas
- **Botón Reiniciar**: Restaurar tablero inicial

### Teclado:
- **Flechas**: Navegar entre celdas
- **Espacio/Enter**: Cambiar color de celda seleccionada
- **R**: Reiniciar tablero

## 📱 Características Técnicas

- **Responsive Design**: Se adapta a pantallas móviles
- **Animaciones CSS**: Transiciones suaves y efectos visuales
- **Algoritmo de gravedad**: Simulación física realista
- **Generación aleatoria controlada**: Suma garantizada superior a 68
- **Estado persistente**: Conserva el tablero inicial para reiniciar

## 🔧 Desarrollo

### 🆕 Actualizar versión (cache busting)
Cada vez que hagas cambios en CSS o JS, ejecuta:

```powershell
.\update-version.ps1
```

Esto incrementará automáticamente la versión en `index.html` (ej: `?v=1.2` → `?v=1.3`) para forzar la recarga en navegadores y evitar problemas de caché.

### 📤 Subir cambios
```bash
git add .
git commit -m "Descripción de cambios"
git push
```

## 🎯 Uso de parámetros URL

Personaliza el juego pasando números en la URL:

```
# Grid personalizado (16 números del 1-9)
?grid=1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7

# Objetivos personalizados (4 números del 13-19)
?target=13,14,15,16

# Ambos combinados
?grid=1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4&target=13,14,15,16
```

## 🔧 Estructura del Proyecto

```
squar3-game/
├── index.html      # Estructura HTML
├── styles.css      # Estilos y animaciones
├── script.js       # Lógica del juego
└── README.md       # Documentación
```

## 🎉 Demo en Vivo

[**🎮 Jugar Ahora**](https://tu-usuario.github.io/squar3-game/)

---

Desarrollado con ❤️ usando tecnologías web modernas.