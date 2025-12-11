import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'file' | 'folder';
  children?: string[];
  parentId?: string;
}

export interface FileOperation {
  type: 'create_file' | 'create_folder' | 'update_file' | 'delete_file' | 'rename_file' | 'move_file';
  path: string;
  content?: string;
  newPath?: string;
}

interface FilesState {
  files: Record<string, VirtualFile>;
  activeFileId: string | null;
  projectName: string;
  history: { files: Record<string, VirtualFile>; timestamp: number }[];
  historyIndex: number;
  
  // Actions
  setActiveFile: (id: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  createFile: (name: string, parentId?: string, content?: string) => string;
  createFolder: (name: string, parentId?: string) => string;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  moveFile: (id: string, newParentId: string) => void;
  setProjectName: (name: string) => void;
  resetToDefault: () => void;
  getFileByPath: (path: string) => VirtualFile | undefined;
  
  // Bulk operations
  applyOperations: (operations: FileOperation[]) => void;
  createFileAtPath: (path: string, content: string) => string;
  createFolderAtPath: (path: string) => string;
  
  // History
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  
  // Project templates
  loadTemplate: (templateName: string) => void;
  clearProject: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultFiles: Record<string, VirtualFile> = {
  'root': {
    id: 'root',
    name: 'project',
    path: '/',
    content: '',
    type: 'folder',
    children: ['public', 'src'],
  },
  'public': {
    id: 'public',
    name: 'public',
    path: '/public',
    content: '',
    type: 'folder',
    children: ['index-html'],
    parentId: 'root',
  },
  'src': {
    id: 'src',
    name: 'src',
    path: '/src',
    content: '',
    type: 'folder',
    children: ['style-css', 'main-js', 'app-jsx'],
    parentId: 'root',
  },
  'index-html': {
    id: 'index-html',
    name: 'index.html',
    path: '/public/index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="../src/style.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="../src/main.js"></script>
</body>
</html>`,
    type: 'file',
    parentId: 'public',
  },
  'style-css': {
    id: 'style-css',
    name: 'style.css',
    path: '/src/style.css',
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-tertiary: #1a1a24;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --accent: #7c3aed;
  --accent-glow: rgba(124, 58, 237, 0.3);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--accent), #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
}

button {
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 24px var(--accent-glow);
}

button:active {
  transform: scale(0.98);
}

.count {
  font-size: 2.5rem;
  font-weight: 700;
  min-width: 80px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}`,
    type: 'file',
    parentId: 'src',
  },
  'main-js': {
    id: 'main-js',
    name: 'main.js',
    path: '/src/main.js',
    content: `// Main entry point
import { createApp } from './App.jsx';

const app = document.getElementById('app');
if (app) {
  app.innerHTML = createApp();
  
  // Initialize counter
  let count = 0;
  const countEl = document.getElementById('count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  
  if (incrementBtn && decrementBtn && countEl) {
    incrementBtn.addEventListener('click', () => {
      count++;
      countEl.textContent = count;
    });
    
    decrementBtn.addEventListener('click', () => {
      count--;
      countEl.textContent = count;
    });
  }
}

console.log('🚀 NeoForge App initialized!');`,
    type: 'file',
    parentId: 'src',
  },
  'app-jsx': {
    id: 'app-jsx',
    name: 'App.jsx',
    path: '/src/App.jsx',
    content: `// App Component
export function createApp() {
  return \`
    <div class="app-container">
      <h1>⚡ NeoForge</h1>
      <p>AI-Powered Code Playground</p>
      
      <div class="counter">
        <button id="decrement">−</button>
        <span id="count" class="count">0</span>
        <button id="increment">+</button>
      </div>
    </div>
  \`;
}`,
    type: 'file',
    parentId: 'src',
  },
};

// Project templates
const templates: Record<string, Record<string, VirtualFile>> = {
  empty: {
    'root': {
      id: 'root',
      name: 'project',
      path: '/',
      content: '',
      type: 'folder',
      children: ['src'],
    },
    'src': {
      id: 'src',
      name: 'src',
      path: '/src',
      content: '',
      type: 'folder',
      children: [],
      parentId: 'root',
    },
  },
  landing: {
    'root': {
      id: 'root',
      name: 'project',
      path: '/',
      content: '',
      type: 'folder',
      children: ['index-html', 'src'],
    },
    'src': {
      id: 'src',
      name: 'src',
      path: '/src',
      content: '',
      type: 'folder',
      children: ['styles-css', 'main-js'],
      parentId: 'root',
    },
    'index-html': {
      id: 'index-html',
      name: 'index.html',
      path: '/index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <link rel="stylesheet" href="./src/styles.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>`,
      type: 'file',
      parentId: 'root',
    },
    'styles-css': {
      id: 'styles-css',
      name: 'styles.css',
      path: '/src/styles.css',
      content: `/* Landing Page Styles */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }`,
      type: 'file',
      parentId: 'src',
    },
    'main-js': {
      id: 'main-js',
      name: 'main.js',
      path: '/src/main.js',
      content: `// Landing page entry
console.log('Landing page loaded');`,
      type: 'file',
      parentId: 'src',
    },
  },
};

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: defaultFiles,
      activeFileId: 'app-jsx',
      projectName: 'my-project',
      history: [],
      historyIndex: -1,

      setActiveFile: (id) => set({ activeFileId: id }),

      updateFileContent: (id, content) =>
        set((state) => ({
          files: {
            ...state.files,
            [id]: { ...state.files[id], content },
          },
        })),

      createFile: (name, parentId = 'src', content = '') => {
        const id = generateId();
        const parent = get().files[parentId];
        if (!parent) return id;
        const path = `${parent.path}/${name}`;

        set((state) => ({
          files: {
            ...state.files,
            [id]: {
              id,
              name,
              path,
              content,
              type: 'file',
              parentId,
            },
            [parentId]: {
              ...state.files[parentId],
              children: [...(state.files[parentId].children || []), id],
            },
          },
        }));

        return id;
      },

      createFolder: (name, parentId = 'root') => {
        const id = generateId();
        const parent = get().files[parentId];
        if (!parent) return id;
        const path = `${parent.path}/${name}`;

        set((state) => ({
          files: {
            ...state.files,
            [id]: {
              id,
              name,
              path,
              content: '',
              type: 'folder',
              children: [],
              parentId,
            },
            [parentId]: {
              ...state.files[parentId],
              children: [...(state.files[parentId].children || []), id],
            },
          },
        }));

        return id;
      },

      deleteFile: (id) => {
        const file = get().files[id];
        if (!file || id === 'root') return;

        set((state) => {
          const newFiles = { ...state.files };

          if (file.parentId && newFiles[file.parentId]) {
            newFiles[file.parentId] = {
              ...newFiles[file.parentId],
              children: newFiles[file.parentId].children?.filter((c) => c !== id),
            };
          }

          const deleteRecursive = (fileId: string) => {
            const f = newFiles[fileId];
            if (f?.children) {
              f.children.forEach(deleteRecursive);
            }
            delete newFiles[fileId];
          };

          deleteRecursive(id);

          return {
            files: newFiles,
            activeFileId: state.activeFileId === id ? null : state.activeFileId,
          };
        });
      },

      renameFile: (id, newName) =>
        set((state) => {
          const file = state.files[id];
          const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
          return {
            files: {
              ...state.files,
              [id]: {
                ...file,
                name: newName,
                path: `${parentPath}/${newName}`,
              },
            },
          };
        }),

      moveFile: (id, newParentId) => {
        const file = get().files[id];
        const oldParentId = file.parentId;
        const newParent = get().files[newParentId];
        
        if (!file || !newParent || newParent.type !== 'folder') return;

        set((state) => {
          const newFiles = { ...state.files };
          
          // Remove from old parent
          if (oldParentId && newFiles[oldParentId]) {
            newFiles[oldParentId] = {
              ...newFiles[oldParentId],
              children: newFiles[oldParentId].children?.filter((c) => c !== id),
            };
          }
          
          // Add to new parent
          newFiles[newParentId] = {
            ...newFiles[newParentId],
            children: [...(newFiles[newParentId].children || []), id],
          };
          
          // Update file's parent and path
          newFiles[id] = {
            ...newFiles[id],
            parentId: newParentId,
            path: `${newParent.path}/${file.name}`,
          };

          return { files: newFiles };
        });
      },

      setProjectName: (name) => set({ projectName: name }),

      resetToDefault: () => set({ files: defaultFiles, activeFileId: 'app-jsx' }),

      getFileByPath: (path) => {
        const files = get().files;
        // Normalize path for matching
        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        const altPath = normalizedPath.replace(/^\//, '');
        return Object.values(files).find((f) => 
          f.path === path || f.path === normalizedPath || f.path === altPath || f.path === '/' + altPath
        );
      },

      // Create file at specific path, creating parent folders as needed
      createFileAtPath: (path: string, content: string) => {
        // Normalize path - remove ./ and leading slashes, ensure consistent format
        let normalizedPath = path.replace(/^\.?\/+/, '').replace(/\/+/g, '/');
        if (!normalizedPath.startsWith('/')) {
          normalizedPath = '/' + normalizedPath;
        }
        
        const parts = normalizedPath.split('/').filter(Boolean);
        const fileName = parts.pop();
        
        if (!fileName) return 'root';
        
        let currentParentId = 'root';
        let currentPath = '';
        
        // Create parent folders if they don't exist
        for (const part of parts) {
          currentPath += '/' + part;
          const existingFolder = get().getFileByPath(currentPath);
          
          if (existingFolder) {
            currentParentId = existingFolder.id;
          } else {
            currentParentId = get().createFolder(part, currentParentId);
          }
        }
        
        const finalPath = currentPath + '/' + fileName;
        
        // Check if file already exists at this path (also check without leading slash)
        const existingFile = get().getFileByPath(finalPath) || 
                             get().getFileByPath(finalPath.replace(/^\//, ''));
        if (existingFile) {
          // Update existing file instead of creating duplicate
          get().updateFileContent(existingFile.id, content);
          return existingFile.id;
        }
        
        // Create the new file
        return get().createFile(fileName, currentParentId, content);
      },

      createFolderAtPath: (path: string) => {
        const parts = path.split('/').filter(Boolean);
        
        let currentParentId = 'root';
        let currentPath = '';
        
        for (const part of parts) {
          currentPath += '/' + part;
          const existingFolder = get().getFileByPath(currentPath);
          
          if (existingFolder) {
            currentParentId = existingFolder.id;
          } else {
            currentParentId = get().createFolder(part, currentParentId);
          }
        }
        
        return currentParentId;
      },

      applyOperations: (operations: FileOperation[]) => {
        // Save snapshot before applying
        get().saveSnapshot();
        
        for (const op of operations) {
          switch (op.type) {
            case 'create_file':
              get().createFileAtPath(op.path, op.content || '');
              break;
            case 'create_folder':
              get().createFolderAtPath(op.path);
              break;
            case 'update_file':
              const file = get().getFileByPath(op.path);
              if (file) {
                get().updateFileContent(file.id, op.content || '');
              } else {
                // If file doesn't exist, create it
                get().createFileAtPath(op.path, op.content || '');
              }
              break;
            case 'delete_file':
              const fileToDelete = get().getFileByPath(op.path);
              if (fileToDelete) {
                get().deleteFile(fileToDelete.id);
              }
              break;
            case 'rename_file':
              const fileToRename = get().getFileByPath(op.path);
              if (fileToRename && op.newPath) {
                const newName = op.newPath.split('/').pop()!;
                get().renameFile(fileToRename.id, newName);
              }
              break;
          }
        }
      },

      saveSnapshot: () => {
        const currentFiles = JSON.parse(JSON.stringify(get().files));
        set((state) => ({
          history: [...state.history.slice(0, state.historyIndex + 1), { files: currentFiles, timestamp: Date.now() }].slice(-50),
          historyIndex: state.historyIndex + 1,
        }));
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          set({
            files: JSON.parse(JSON.stringify(history[historyIndex - 1].files)),
            historyIndex: historyIndex - 1,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          set({
            files: JSON.parse(JSON.stringify(history[historyIndex + 1].files)),
            historyIndex: historyIndex + 1,
          });
        }
      },

      loadTemplate: (templateName: string) => {
        const template = templates[templateName];
        if (template) {
          set({ files: JSON.parse(JSON.stringify(template)), activeFileId: null });
        }
      },

      clearProject: () => {
        set({ files: templates.empty, activeFileId: null });
      },
    }),
    {
      name: 'neoforge-files',
    }
  )
);
