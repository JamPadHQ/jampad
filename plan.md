# Frontend Refactoring Plan: Multi-Package Architecture & Plugin System

## Progress Status
✅ **Phase 0 Completed**: UI components successfully moved to `@jampad/ui` package

## Overview
This plan outlines the refactoring of the Jampad frontend codebase into multiple **logic packages** for improved scalability, maintainability, and extensibility. The approach separates business logic from UI presentation: logic goes into packages, UI components remain in the web app.

**Architecture Strategy**: 
- **Core Packages**: Pure logic (hooks, utilities, services, state management)
- **Web App**: Core UI components and presentation layer
- **Plugin Packages**: Self-contained with both UI and logic (complete features)
- **Benefits**: Core logic reusability + plugin self-containment

**Current Progress**: The UI primitives have already been extracted into a separate `@jampad/ui` package.

## Current State Analysis

### File Structure
```
packages/
├── ui/                  # ✅ COMPLETED - UI primitives package
│   └── src/components/ui/  # 12 UI components (button, dialog, etc.)
└── (future packages...)

apps/web/src/
├── components/           # Mixed flat structure (14 files)
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

### Key Areas Identified
1. **Core UI Components** (Stay in apps/web): Canvas, toolbar, selection, collaboration components
2. **Core Logic to Extract**:
   - **Canvas**: useCanvasEvents, useCanvasNavigation, canvasUtils
   - **Drawing**: useDrawing, useShapes, drawing utilities
   - **Selection**: useSelection, useElementTransform
   - **Collaboration**: useYJS, streamManager, YJS integration
   - **Core State**: Shared state management (user, elements, tools)
   - **Plugin System**: Plugin interfaces, manager, context
3. **Plugin Features** (Self-contained packages): StickyNote, ScreenShare - complete features with UI + logic

## Phase 1: Component Organization (Week 1)  ✅ COMPLETED

### 1.1 Reorganize Components into Functional Folders
**Goal**: Organize UI components by functionality while keeping them in the web app

**Note**: ✅ UI primitives already moved to `@jampad/ui` package

```
apps/web/src/
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx
│   │   ├── CanvasElements.tsx
│   │   ├── CanvasGrid.tsx
│   │   ├── CanvasOverlay.tsx
│   │   └── index.ts
│   ├── drawing/
│   │   ├── CurrentDrawing.tsx
│   │   ├── CurrentShape.tsx
│   │   └── index.ts
│   ├── selection/
│   │   ├── SelectionBox.tsx
│   │   ├── SelectionHandles.tsx
│   │   └── index.ts
│   ├── collaboration/
│   │   ├── MembersList.tsx
│   │   ├── MemberCursors.tsx
│   │   └── index.ts
│   ├── toolbar/
│   │   ├── Toolbar.tsx
│   │   ├── ToolButton.tsx (extract from Toolbar)
│   │   └── index.ts
│   ├── dialogs/
│   │   ├── SettingsDialog.tsx
│   │   └── index.ts
│   ├── shared/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── index.ts
│   └── shared/
│       ├── (future shared components)
│       └── index.ts
├── hooks/               # Temporary - will move to packages
├── lib/                 # Temporary - will move to packages
└── pages/
```

### 1.2 Component Organization Tasks
- Move components into functional folders
- Extract ToolButton from Toolbar.tsx
- Create index.ts files for clean exports
- Update all component imports to use new folder structure
- Keep all **core** components in web app (no package moves yet)
- **Note**: Plugin components (StickyNote, ScreenShare) will be moved to self-contained plugin packages in Phase 4

## Phase 2: Package Architecture (Week 2-3)

### 2.1 Create Logic Packages
**Goal**: Extract business logic, hooks, utilities, and services into reusable packages

#### @jampad/ui ✅ COMPLETED
```
packages/ui/src/
├── components/ui/
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── menubar.tsx
│   ├── separator.tsx
│   ├── sonner.tsx
│   └── tabs.tsx
├── lib/
│   └── utils.ts
└── index.ts
```

#### @jampad/canvas
```
packages/canvas/src/
├── hooks/
│   ├── useCanvasEvents.ts
│   ├── useCanvasNavigation.ts
│   └── index.ts
├── store/
│   ├── canvasStore.ts        # Canvas state (position, zoom, viewport)
│   └── index.ts
├── utils/
│   ├── canvasUtils.ts
│   ├── constants.ts
│   └── index.ts
├── types/
│   ├── canvas.ts
│   └── index.ts
└── index.ts
```

#### @jampad/drawing
```
packages/drawing/src/
├── hooks/
│   ├── useDrawing.ts
│   ├── useShapes.ts
│   └── index.ts
├── store/
│   ├── drawingStore.ts       # Drawing state (current path, shape)
│   └── index.ts
├── utils/
│   └── drawingUtils.ts
├── types/
│   └── drawing.ts
└── index.ts
```

#### @jampad/selection
```
packages/selection/src/
├── hooks/
│   ├── useSelection.ts
│   ├── useElementTransform.ts
│   └── index.ts
├── store/
│   ├── selectionStore.ts     # Selection state (selected elements, transforms)
│   └── index.ts
├── utils/
│   └── selectionUtils.ts
├── types/
│   └── selection.ts
└── index.ts
```

#### @jampad/collaboration
```
packages/collaboration/src/
├── hooks/
│   ├── useYJS.ts
│   └── index.ts
├── store/
│   ├── collaborationStore.ts # Members, connection status, streams
│   └── index.ts
├── services/
│   └── streamManager.ts
├── types/
│   └── collaboration.ts
└── index.ts
```

#### @jampad/core-state
```
packages/core-state/src/
├── slices/
│   ├── userSlice.ts          # Global user state
│   ├── elementsSlice.ts      # Canvas elements registry
│   └── toolSlice.ts          # Current active tool
├── store/
│   ├── index.ts
│   └── types.ts
├── hooks/
│   └── useCoreStore.ts
└── index.ts
```

**Note**: Each package will have its own Zustand store for package-specific state. Core state only handles shared/global state.

### 2.2 Distributed State Management Architecture

Each package manages its own Zustand store for better encapsulation:

#### **Core Shared State** (`@jampad/core-state`)
```typescript
// Global state that needs to be shared across packages
interface CoreState {
  user: User;              // Current user info
  elements: Element[];     // Canvas elements registry  
  currentTool: Tool;       // Active tool
}
```

#### **Package-Specific Stores**
```typescript
// @jampad/canvas - Canvas positioning and viewport
interface CanvasState {
  position: { x: number; y: number };
  zoom: number;
  viewport: { width: number; height: number };
}

// @jampad/drawing - Current drawing state
interface DrawingState {
  currentPath: Point[] | null;
  currentShape: Shape | null;
}

// @jampad/selection - Selection and transforms
interface SelectionState {
  selectedElements: string[];
  selectionBox: SelectionBox | null;
  isTransforming: boolean;
}

// @jampad/collaboration - Members and connections
interface CollaborationState {
  members: Member[];
  isConnected: boolean;
  streams: Record<string, MediaStream>;
}
```

#### **Plugin Stores**
```typescript
// Each plugin has its own store for internal state
// @jampad/plugin-sticky-notes
interface StickyNoteState {
  editingNoteId: string | null;
  textCache: Record<string, string>;
}

// @jampad/plugin-screenshare  
interface ScreenShareState {
  isSharing: boolean;
  localStream: MediaStream | null;
  peerConnections: Record<string, RTCPeerConnection>;
}
```

#### **Store Communication**
- **Core State**: Accessed by all packages for shared data
- **Package Communication**: Use events or core state for cross-package coordination
- **Plugin Isolation**: Plugins manage their own state independently

### 2.3 Package Configuration
Each package will include:
- `package.json` with proper exports and dependencies
- `vite.config.ts` for building
- `tsconfig.json` for TypeScript configuration
- `index.ts` as main entry point
- **Own Zustand store** for package-specific state

## Phase 3: Plugin System Architecture (Week 4-5)

### 3.1 Hybrid Plugin System

#### @jampad/plugin-system (Core Infrastructure - Logic Only)
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
├── providers/
│   └── PluginProvider.ts  # Logic only, no React components
├── types/
│   └── plugin.ts
└── index.ts
```

**Plugin System Strategy**: 
- **Core Plugin Infrastructure**: Logic only (registration, management, context)
- **Individual Plugins**: Self-contained packages with both UI components and logic
- **Benefits**: Core infrastructure is reusable, plugins are complete and distributable

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
  // Self-contained: includes both logic and React components
  createElement?(data: any): PluginElement;
  getElementBounds?(element: PluginElement): Bounds;
  getElementData?(element: PluginElement): any;
  
  // React component for rendering on canvas
  renderElement(element: PluginElement, context: CanvasRenderContext): React.ReactNode;
}

interface IToolbarPlugin extends IPlugin {
  getToolbarItems(): ToolbarItem[];  // Includes React components
  onToolSelect?(tool: string): void;
}

interface IOverlayPlugin extends IPlugin {
  getOverlayButtons(): OverlayButton[];  // Includes React components
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface PluginContext {
  store: CanvasStore;
  yjs: YJSProvider;
  canvas: CanvasAPI;
  events: EventEmitter;
}

// Plugin-provided UI components
interface ToolbarItem {
  id: string;
  tool: string;
  component: React.ComponentType<ToolbarItemProps>;
  tooltip?: string;
}

interface OverlayButton {
  id: string;
  component: React.ComponentType<OverlayButtonProps>;
  tooltip?: string;
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

## Phase 4: Convert Features to Self-Contained Plugins (Week 6-7)

### 4.1 StickyNote Plugin (@jampad/plugin-sticky-notes)

```
packages/plugin-sticky-notes/src/
├── components/
│   ├── StickyNote.tsx        # React component for canvas rendering
│   ├── StickyNoteToolbar.tsx # Toolbar button component
│   └── index.ts
├── hooks/
│   ├── useStickyNote.ts      # Business logic for sticky note behavior
│   ├── useStickyNoteEdit.ts  # Editing state and text management
│   └── index.ts
├── store/
│   ├── stickyNoteStore.ts    # Plugin-specific state (editing, text cache)
│   └── index.ts
├── services/
│   └── stickyNoteService.ts  # CRUD operations
├── types/
│   └── stickyNote.ts
├── plugin.ts                 # Main plugin implementation
└── index.ts
```

**Complete Self-Contained Plugin:**
- ✅ React components for UI rendering
- ✅ Custom hooks for business logic
- ✅ Element creation/update functions
- ✅ YJS synchronization logic
- ✅ Toolbar button integration
- ✅ Canvas element rendering

### 4.2 ScreenShare Plugin (@jampad/plugin-screenshare)

```
packages/plugin-screenshare/src/
├── components/
│   ├── ScreenShareDisplay.tsx    # React component for canvas rendering
│   ├── ScreenShareToolbar.tsx    # Toolbar button component
│   └── index.ts
├── hooks/
│   ├── useScreenShare.ts         # Screen sharing logic
│   ├── useWebRTC.ts              # WebRTC connection management
│   └── index.ts
├── store/
│   ├── screenShareStore.ts       # Plugin state (sharing status, streams)
│   └── index.ts
├── services/
│   ├── peerService.ts            # Peer connection handling
│   └── streamService.ts          # Stream management
├── types/
│   └── screenShare.ts
├── plugin.ts
└── index.ts
```

**Complete Self-Contained Plugin:**
- ✅ React components for UI rendering
- ✅ Custom hooks for business logic
- ✅ WebRTC and stream management
- ✅ Toolbar button integration (with toggle state)
- ✅ YJS stream metadata synchronization
- ✅ Canvas element rendering

### 4.3 Plugin Integration Pattern

**Self-Contained Plugin** (`@jampad/plugin-sticky-notes`):
```typescript
// plugin.ts
import { StickyNoteComponent } from './components/StickyNote';
import { StickyNoteToolbarButton } from './components/StickyNoteToolbar';
import { useStickyNote } from './hooks/useStickyNote';

export const StickyNotePlugin: ICanvasPlugin = {
  id: 'sticky-notes',
  name: 'Sticky Notes',
  version: '1.0.0',
  
  // Plugin provides its own React components
  renderElement: (element, context) => (
    <StickyNoteComponent 
      stickyNote={element.data} 
      isSelected={context.isSelected}
      canvasState={context.canvasState}
    />
  ),
  
  getToolbarItems: () => [{
    id: 'sticky-note',
    tool: 'sticky-note',
    component: StickyNoteToolbarButton,
    tooltip: 'Add sticky note'
  }],
  
  createElement: (data) => createStickyNoteElement(data),
  getElementBounds: (element) => getStickyNoteBounds(element),
};
```

**Plugin Component** (inside the plugin package):
```typescript
// components/StickyNote.tsx
import { useStickyNote } from '../hooks/useStickyNote';

export const StickyNoteComponent = ({ stickyNote, isSelected, canvasState }) => {
  const { 
    text, 
    setText, 
    isEditing, 
    startEditing, 
    stopEditing 
  } = useStickyNote(stickyNote.id);
  
  return (
    <g transform={`translate(${stickyNote.position.x}, ${stickyNote.position.y})`}>
      {/* Plugin owns its UI implementation */}
    </g>
  );
};
```

**Web App Integration**:
```typescript
// Web app just renders plugin-provided components
const pluginManager = new PluginManager();
pluginManager.register(StickyNotePlugin);

// Canvas renders plugin elements
{elements.map(element => {
  const plugin = pluginManager.getPluginForElement(element);
  return plugin?.renderElement(element, context);
})}
```

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
# UI package - ✅ ALREADY COMPLETED
# @jampad/ui is already created and configured

# Core packages (no React components)
nx g @nx/js:lib canvas --directory=packages/canvas --bundler vite --unitTestRunner none
nx g @nx/js:lib drawing --directory=packages/drawing --bundler vite --unitTestRunner none
nx g @nx/js:lib selection --directory=packages/selection --bundler vite --unitTestRunner none
nx g @nx/js:lib collaboration --directory=packages/collaboration --bundler vite --unitTestRunner none
nx g @nx/js:lib core-state --directory=packages/core-state --bundler vite --unitTestRunner none

# Plugin system (logic only)
nx g @nx/js:lib plugin-system --directory=packages/plugin-system --bundler vite --unitTestRunner none

# Self-contained plugin packages (include React components)
nx g @nx/react:lib plugin-sticky-notes --directory=packages/plugin-sticky-notes --bundler vite --unitTestRunner none
nx g @nx/react:lib plugin-screenshare --directory=packages/plugin-screenshare --bundler vite --unitTestRunner none
```

**Note**: Using `@nx/js:lib` instead of `@nx/react:lib` since these are logic-only packages without React components.

## Benefits

### Architecture Advantages
- **Hybrid Approach**: Core packages (framework-agnostic) + self-contained plugins (complete features)
- **Distributed State Management**: Each package manages its own state with Zustand stores
- **Plugin Self-Containment**: Plugins include both UI, logic, and state management
- **Core Reusability**: Core packages can be used across different UI frameworks
- **Plugin Autonomy**: Plugin developers control logic, UI, and state of their features
- **Better Isolation**: Package-specific stores prevent state coupling and conflicts

### Scalability
- Modular architecture allows independent development
- Plugin system enables feature extensibility through logic hooks
- Clear separation of concerns between business logic and presentation

### Maintainability
- Smaller, focused packages are easier to maintain
- Core packages are framework-agnostic
- Clear boundaries between data/logic and UI rendering
- Isolated testing and deployment

### Developer Experience
- **Plugin Developers**: Create complete, self-contained features with full UI/logic control
- **Core Developers**: Work with reusable core packages and core UI components
- **Plugin Distribution**: Plugins are complete packages that can be easily installed/uninstalled
- **Hot-swappable plugin development**: Complete features can be added/removed independently
- **Clear interfaces**: Both core packages and plugin packages have well-defined APIs

### Performance
- Tree-shaking at package level
- Core packages are smaller (no React components)
- Lazy loading of plugin features
- Reduced bundle size for unused features
- Better code splitting between logic and UI

## Timeline Summary
- **Phase 0**: ✅ **COMPLETED** - UI primitives package (`@jampad/ui`)
- **Week 1**: Component organization (folders only, no package moves)
- **Week 2-3**: Package extraction (5 core packages with distributed stores)
- **Week 4-5**: Plugin system development (logic-focused)
- **Week 6-7**: Self-contained plugin conversion (StickyNote & ScreenShare with UI + logic)
- **Week 8**: Integration and testing
- **Week 9**: Documentation

Total estimated time: 9 weeks with 1-2 developers.
**Revised estimate**: 7-8 weeks remaining (faster due to core package extraction, UI stays in place) 