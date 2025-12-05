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

interface FilesState {
  files: Record<string, VirtualFile>;
  activeFileId: string | null;
  projectName: string;
  
  // Actions
  setActiveFile: (id: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  createFile: (name: string, parentId?: string, content?: string) => string;
  createFolder: (name: string, parentId?: string) => string;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  setProjectName: (name: string) => void;
  resetToDefault: () => void;
  getFileByPath: (path: string) => VirtualFile | undefined;
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

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #eee;
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
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #00d9ff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #00d9ff;
  color: #1a1a2e;
  font-weight: 600;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
}

.count {
  font-size: 3rem;
  font-weight: bold;
  min-width: 80px;
  text-align: center;
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

console.log('🚀 App initialized!');`,
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
      <h1>🚀 Welcome to NeoForge</h1>
      <p>Your AI-Powered Code Playground</p>
      
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

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: defaultFiles,
      activeFileId: 'app-jsx',
      projectName: 'my-project',

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

          // Remove from parent's children
          if (file.parentId && newFiles[file.parentId]) {
            newFiles[file.parentId] = {
              ...newFiles[file.parentId],
              children: newFiles[file.parentId].children?.filter((c) => c !== id),
            };
          }

          // Recursively delete children if folder
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

      setProjectName: (name) => set({ projectName: name }),

      resetToDefault: () => set({ files: defaultFiles, activeFileId: 'app-jsx' }),

      getFileByPath: (path) => {
        const files = get().files;
        return Object.values(files).find((f) => f.path === path);
      },
    }),
    {
      name: 'neoforge-files',
    }
  )
);
