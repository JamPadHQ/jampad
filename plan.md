# Frontend Refactoring Plan: Multi-Package Architecture & Plugin System

## Overview
This plan outlines the refactoring of the Jampad frontend codebase into multiple packages for improved scalability, maintainability, and extensibility. The plan includes component reorganization, multi-package architecture, and a comprehensive plugin system.

## Current State Analysis

### File Structure
```
apps/web/src/
├── components/           # Mixed flat structure (26 files)
│   ├── ui/              # UI primitives (12 files) - KEEP AS IS
│   ├── toolbar/         # Empty
│   ├── canvas/          # Empty
│   ├── elements/        # Empty
│   ├── dialogs/         # Empty
│   ├── collaboration/   # Empty
│   ├── shared/          # Empty
│   └── *.tsx            # Core components in root
├── hooks/               # Business logic hooks (8 files)
├── lib/                 # Utilities and store
│   └── store/           # Zustand store slices (9 files)
├── pages/               # Single Editor page
└── styles.css           # Global styles
```

### Key Components Identified
1. **Core Canvas**: Canvas.tsx, CanvasElements.tsx, CanvasGrid.tsx, CanvasOverlay.tsx
2. **Plugin Candidates**: StickyNote.tsx, ScreenShareDisplay.tsx
3. **Tool System**: Toolbar.tsx, CurrentDrawing.tsx, CurrentShape.tsx
4. **Collaboration**: MembersList.tsx, MemberCursors.tsx
5. **Selection System**: SelectionBox.tsx, SelectionHandles.tsx

## Phase 1: Component Organization (Week 1)

### 1.1 Reorganize Components into Functional Folders

```
apps/web/src/components/
├── ui/                  # Keep existing UI components
├── canvas/
│   ├── Canvas.tsx
│   ├── CanvasElements.tsx
│   ├── CanvasGrid.tsx
│   ├── CanvasOverlay.tsx
│   └── index.ts
├── drawing/
│   ├── CurrentDrawing.tsx
│   ├── CurrentShape.tsx
│   └── index.ts
├── selection/
│   ├── SelectionBox.tsx
│   ├── SelectionHandles.tsx
│   └── index.ts
├── collaboration/
│   ├── MembersList.tsx
│   ├── MemberCursors.tsx
│   └── index.ts
├── toolbar/
│   ├── Toolbar.tsx
│   ├── ToolButton.tsx (extract from Toolbar)
│   └── index.ts
├── dialogs/
│   ├── SettingsDialog.tsx
│   └── index.ts
├── shared/
│   ├── LoadingSpinner.tsx
│   ├── ThemeProvider.tsx
│   └── index.ts
└── plugins/             # Future plugin components
    ├── StickyNote.tsx   # Move here temporarily
    └── ScreenShareDisplay.tsx
```

### 1.2 Create Index Files
- Add proper exports for each component folder
- Update all imports across the codebase
- Ensure no circular dependencies

## Phase 2: Multi-Package Architecture (Week 2-3)

### 2.1 Create Core Packages

#### @jampad/canvas-core
```
packages/canvas-core/src/
├── components/
│   ├── Canvas.tsx
│   ├── CanvasElements.tsx
│   ├── CanvasGrid.tsx
│   └── index.ts
├── hooks/
│   ├── useCanvasEvents.ts
│   ├── useCanvasNavigation.ts
│   └── index.ts
├── utils/
│   ├── canvasUtils.ts
│   ├── constants.ts
│   └── index.ts
└── types/
    ├── canvas.ts
    └── index.ts
```

#### @jampad/drawing-tools
```
packages/drawing-tools/src/
├── components/
│   ├── CurrentDrawing.tsx
│   ├── CurrentShape.tsx
│   └── index.ts
├── hooks/
│   ├── useDrawing.ts
│   ├── useShapes.ts
│   └── index.ts
├── utils/
│   └── drawingUtils.ts
└── types/
    └── drawing.ts
```

#### @jampad/selection-system
```
packages/selection-system/src/
├── components/
│   ├── SelectionBox.tsx
│   ├── SelectionHandles.tsx
│   └── index.ts
├── hooks/
│   ├── useSelection.ts
│   ├── useElementTransform.ts
│   └── index.ts
└── types/
    └── selection.ts
```

#### @jampad/collaboration
```
packages/collaboration/src/
├── components/
│   ├── MembersList.tsx
│   ├── MemberCursors.tsx
│   └── index.ts
├── hooks/
│   ├── useYJS.ts
│   └── index.ts
├── services/
│   └── streamManager.ts
└── types/
    └── collaboration.ts
```

#### @jampad/toolbar-system
```
packages/toolbar-system/src/
├── components/
│   ├── Toolbar.tsx
│   ├── ToolButton.tsx
│   └── index.ts
├── hooks/
│   └── useToolbar.ts
├── registry/
│   └── ToolRegistry.ts
└── types/
    └── toolbar.ts
```

#### @jampad/state-management
```
packages/state-management/src/
├── slices/
│   ├── userSlice.ts
│   ├── toolSlice.ts
│   ├── elementsSlice.ts
│   ├── drawingSlice.ts
│   ├── membersSlice.ts
│   ├── shapeSlice.ts
│   └── streamsSlice.ts
├── store/
│   ├── index.ts
│   └── types.ts
└── hooks/
    └── useStore.ts
```

### 2.2 Package Configuration
Each package will include:
- `package.json` with proper exports and dependencies
- `vite.config.ts` for building
- `tsconfig.json` for TypeScript configuration
- `index.ts` as main entry point

## Phase 3: Plugin System Architecture (Week 4-5)

### 3.1 Core Plugin System

#### @jampad/plugin-system
```
packages/plugin-system/src/
├── core/
│   ├── PluginManager.ts
│   ├── PluginRegistry.ts
│   └── PluginContext.ts
├── interfaces/
│   ├── IPlugin.ts
│   ├── ICanvasPlugin.ts
│   ├── IToolbarPlugin.ts
│   └── IOverlayPlugin.ts
├── hooks/
│   ├── usePlugins.ts
│   ├── usePluginContext.ts
│   └── index.ts
├── components/
│   ├── PluginProvider.tsx
│   ├── PluginRenderer.tsx
│   └── index.ts
└── types/
    └── plugin.ts
```

### 3.2 Plugin Interface Definition

```typescript
interface IPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
}

interface ICanvasPlugin extends IPlugin {
  renderElement(element: PluginElement, context: CanvasRenderContext): React.ReactNode;
  createElement?(data: any): PluginElement;
  getElementBounds?(element: PluginElement): Bounds;
}

interface IToolbarPlugin extends IPlugin {
  getToolbarItems(): ToolbarItem[];
  onToolSelect?(tool: string): void;
}

interface IOverlayPlugin extends IPlugin {
  getOverlayButtons(): OverlayButton[];
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface PluginContext {
  store: CanvasStore;
  yjs: YJSProvider;
  canvas: CanvasAPI;
  events: EventEmitter;
}
```

### 3.3 Plugin Registration System

```typescript
class PluginManager {
  private plugins = new Map<string, IPlugin>();
  private context: PluginContext;

  register(plugin: IPlugin): Promise<void>;
  unregister(pluginId: string): Promise<void>;
  getPlugin(pluginId: string): IPlugin | undefined;
  getAllPlugins(): IPlugin[];
  initializePlugins(): Promise<void>;
}
```

## Phase 4: Convert Features to Plugins (Week 6-7)

### 4.1 StickyNote Plugin (@jampad/plugin-sticky-notes)

```
packages/plugin-sticky-notes/src/
├── components/
│   ├── StickyNote.tsx
│   └── index.ts
├── hooks/
│   └── useStickyNote.ts
├── plugin.ts            # Main plugin implementation
├── types.ts
└── index.ts
```

**Plugin Features:**
- Custom element type: 'sticky-note'
- Toolbar integration: StickyNote tool button
- Double-click to edit functionality
- Canvas element rendering
- YJS synchronization

**Required Plugin API:**
- Element creation and updates
- Store access for editing state
- Canvas event handling
- YJS integration for collaboration

### 4.2 ScreenShare Plugin (@jampad/plugin-screenshare)

```
packages/plugin-screenshare/src/
├── components/
│   ├── ScreenShareDisplay.tsx
│   └── index.ts
├── hooks/
│   ├── useScreenShare.ts
│   └── index.ts
├── services/
│   └── peerService.ts
├── plugin.ts
├── types.ts
└── index.ts
```

**Plugin Features:**
- Custom element type: 'screenshare'
- Toolbar integration: ScreenShare button with toggle state
- WebRTC stream management
- Peer-to-peer connection handling
- Stream synchronization via YJS

**Required Plugin API:**
- Media stream management
- Peer connection handling
- Store access for stream state
- YJS integration for stream metadata
- Event system for connection status

### 4.3 Plugin API Requirements

Based on analysis of StickyNote and ScreenShare implementations:

```typescript
interface PluginAPI {
  // Element Management
  createElement(type: string, data: any): string;
  updateElement(id: string, data: Partial<any>): void;
  removeElement(id: string): void;
  getElement(id: string): Element | undefined;

  // Store Access
  getStore(): CanvasStore;
  subscribeToStore(selector: (state: any) => any, callback: (value: any) => void): () => void;

  // YJS Integration
  getYJS(): YJSProvider;
  addElementToYJS(element: Element): void;
  updateElementInYJS(id: string, data: any): void;
  removeElementFromYJS(id: string): void;

  // Canvas Integration
  getCanvasState(): CanvasState;
  screenToCanvas(point: Point): Point;
  canvasToScreen(point: Point): Point;

  // Event System
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): void;

  // Toolbar Integration
  addToolbarButton(button: ToolbarButton): void;
  removeToolbarButton(id: string): void;
  setToolbarButtonState(id: string, state: any): void;

  // Overlay Integration
  addOverlayButton(button: OverlayButton): void;
  removeOverlayButton(id: string): void;

  // Stream Management (for screenshare)
  addStream(streamId: string, stream: MediaStream): void;
  removeStream(streamId: string): void;
  getStream(streamId: string): MediaStream | undefined;
}
```

## Phase 5: Integration and Testing (Week 8)

### 5.1 Update Main Application
- Integrate PluginManager into main app
- Load plugins during app initialization
- Update Canvas component to render plugin elements
- Update Toolbar to include plugin buttons
- Update CanvasOverlay for plugin overlay buttons

### 5.2 Plugin Loading System
```typescript
// In main app
const pluginManager = new PluginManager(pluginContext);

// Load core plugins
await pluginManager.register(new StickyNotePlugin());
await pluginManager.register(new ScreenSharePlugin());

// Initialize all plugins
await pluginManager.initializePlugins();
```

### 5.3 Testing Strategy
- Unit tests for each package
- Integration tests for plugin system
- E2E tests for plugin functionality
- Performance testing with multiple plugins

## Phase 6: Documentation and Examples (Week 9)

### 6.1 Plugin Development Documentation
- Plugin development guide
- API reference documentation
- Example plugin implementations
- Best practices guide

### 6.2 Migration Guide
- Component migration guide
- Breaking changes documentation
- Upgrade path for existing code

## Package Generation Commands

Use the following Nx commands to generate packages:

```bash
# Core packages
nx g @nx/react:lib canvas-core --directory=packages/canvas-core --bundler vite --unitTestRunner none
nx g @nx/react:lib drawing-tools --directory=packages/drawing-tools --bundler vite --unitTestRunner none
nx g @nx/react:lib selection-system --directory=packages/selection-system --bundler vite --unitTestRunner none
nx g @nx/react:lib collaboration --directory=packages/collaboration --bundler vite --unitTestRunner none
nx g @nx/react:lib toolbar-system --directory=packages/toolbar-system --bundler vite --unitTestRunner none
nx g @nx/react:lib state-management --directory=packages/state-management --bundler vite --unitTestRunner none

# Plugin system
nx g @nx/react:lib plugin-system --directory=packages/plugin-system --bundler vite --unitTestRunner none

# Plugin packages
nx g @nx/react:lib plugin-sticky-notes --directory=packages/plugin-sticky-notes --bundler vite --unitTestRunner none
nx g @nx/react:lib plugin-screenshare --directory=packages/plugin-screenshare --bundler vite --unitTestRunner none
```

## Benefits

### Scalability
- Modular architecture allows independent development
- Plugin system enables feature extensibility
- Clear separation of concerns

### Maintainability
- Smaller, focused packages are easier to maintain
- Clear dependencies between packages
- Isolated testing and deployment

### Developer Experience
- Plugin API enables third-party extensions
- Clear interfaces for contributing new features
- Hot-swappable plugin development

### Performance
- Tree-shaking at package level
- Lazy loading of plugin features
- Reduced bundle size for unused features

## Timeline Summary
- **Week 1**: Component organization
- **Week 2-3**: Multi-package architecture
- **Week 4-5**: Plugin system development
- **Week 6-7**: Plugin conversion (StickyNote & ScreenShare)
- **Week 8**: Integration and testing
- **Week 9**: Documentation

Total estimated time: 9 weeks with 1-2 developers. 