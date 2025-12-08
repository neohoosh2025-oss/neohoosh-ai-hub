import { useState } from 'react';
import { 
  ChevronRight, 
  Folder, 
  FolderOpen,
  Plus,
  Trash2,
  FileCode2,
  FileJson,
  FileType,
  File as FileIcon,
  Code2,
  Search,
  FolderPlus
} from 'lucide-react';
import { useFilesStore, VirtualFile } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return <FileCode2 className="w-4 h-4 text-[#fbbf24]" />;
    case 'jsx': return <Code2 className="w-4 h-4 text-[#22d3ee]" />;
    case 'ts':
    case 'tsx': return <Code2 className="w-4 h-4 text-[#3b82f6]" />;
    case 'css':
    case 'scss': return <FileType className="w-4 h-4 text-[#f472b6]" />;
    case 'html': return <FileCode2 className="w-4 h-4 text-[#f97316]" />;
    case 'json': return <FileJson className="w-4 h-4 text-[#a3e635]" />;
    default: return <FileIcon className="w-4 h-4 text-[#71717a]" />;
  }
};

interface FileTreeItemProps {
  file: VirtualFile;
  depth: number;
}

const FileTreeItem = ({ file, depth }: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { files, activeFileId, setActiveFile, deleteFile, createFile, createFolder } = useFilesStore();
  const [showNewDialog, setShowNewDialog] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');

  const handleClick = () => {
    if (file.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      setActiveFile(file.id);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    
    if (showNewDialog === 'file') {
      createFile(newName, file.type === 'folder' ? file.id : file.parentId);
    } else {
      createFolder(newName, file.type === 'folder' ? file.id : file.parentId);
    }
    
    setNewName('');
    setShowNewDialog(null);
  };

  const isActive = activeFileId === file.id;
  const children = file.children?.map((id) => files[id]).filter(Boolean) || [];

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "group flex items-center gap-2 py-1.5 px-2 mx-1 rounded-md cursor-pointer",
              "transition-all duration-150",
              "hover:bg-[rgba(255,255,255,0.04)]",
              isActive && "bg-[rgba(139,92,246,0.15)] text-[#fafafa]"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={handleClick}
          >
            {file.type === 'folder' ? (
              <>
                <span className={cn(
                  "text-[#71717a] transition-transform duration-150",
                  isExpanded && "rotate-90"
                )}>
                  <ChevronRight className="w-3 h-3" />
                </span>
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-[#fbbf24]" />
                ) : (
                  <Folder className="w-4 h-4 text-[#fbbf24]" />
                )}
              </>
            ) : (
              <>
                <span className="w-3" />
                {getFileIcon(file.name)}
              </>
            )}
            <span className={cn(
              "text-[13px] truncate flex-1 transition-colors duration-150",
              isActive ? "text-[#fafafa]" : "text-[#a1a1aa]"
            )}>
              {file.name}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#18181b] border-[rgba(255,255,255,0.08)] min-w-[160px]">
          {file.type === 'folder' && (
            <>
              <ContextMenuItem 
                onClick={() => setShowNewDialog('file')}
                className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)] text-[13px]"
              >
                <Plus className="w-4 h-4 mr-2 text-[#34d399]" />
                New File
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => setShowNewDialog('folder')}
                className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)] text-[13px]"
              >
                <FolderPlus className="w-4 h-4 mr-2 text-[#fbbf24]" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
            </>
          )}
          {file.id !== 'root' && file.id !== 'src' && file.id !== 'public' && (
            <ContextMenuItem 
              onClick={() => deleteFile(file.id)}
              className="text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] text-[13px]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {file.type === 'folder' && isExpanded && children.length > 0 && (
        <div>
          {children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'folder' ? -1 : 1;
            })
            .map((child) => (
              <FileTreeItem key={child.id} file={child} depth={depth + 1} />
            ))}
        </div>
      )}

      <Dialog open={showNewDialog !== null} onOpenChange={() => setShowNewDialog(null)}>
        <DialogContent className="bg-[#18181b] border-[rgba(255,255,255,0.08)]">
          <DialogHeader>
            <DialogTitle className="text-[#fafafa] flex items-center gap-2">
              {showNewDialog === 'file' ? (
                <Plus className="w-5 h-5 text-[#34d399]" />
              ) : (
                <FolderPlus className="w-5 h-5 text-[#fbbf24]" />
              )}
              Create {showNewDialog === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={showNewDialog === 'file' ? 'filename.js' : 'folder-name'}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[rgba(139,92,246,0.4)]"
            autoFocus
          />
          <DialogFooter className="gap-2">
            <button 
              onClick={() => setShowNewDialog(null)} 
              className="px-4 py-2 rounded-lg text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate} 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const Sidebar = () => {
  const { files, createFile } = useFilesStore();
  const [showNewDialog, setShowNewDialog] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const rootFile = files['root'];

  const handleCreate = () => {
    if (!newName.trim()) return;
    createFile(newName, 'src');
    setNewName('');
    setShowNewDialog(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0d] border-r border-[rgba(255,255,255,0.06)]" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider">Explorer</span>
        <button
          onClick={() => setShowNewDialog('file')}
          className="p-1 rounded text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-8 pr-3 py-1.5 text-xs rounded-md",
              "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]",
              "text-[#fafafa] placeholder:text-[#52525b]",
              "focus:outline-none focus:border-[rgba(139,92,246,0.3)]",
              "transition-colors duration-150"
            )}
          />
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-auto py-1">
        {rootFile?.children?.map((id) => {
          const file = files[id];
          if (!file) return null;
          return <FileTreeItem key={id} file={file} depth={0} />;
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between text-[10px] text-[#52525b]">
          <span>{Object.values(files).filter(f => f.type === 'file').length} files</span>
        </div>
      </div>

      <Dialog open={showNewDialog !== null} onOpenChange={() => setShowNewDialog(null)}>
        <DialogContent className="bg-[#18181b] border-[rgba(255,255,255,0.08)]">
          <DialogHeader>
            <DialogTitle className="text-[#fafafa] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#34d399]" />
              Create File
            </DialogTitle>
          </DialogHeader>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="filename.js"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[rgba(139,92,246,0.4)]"
            autoFocus
          />
          <DialogFooter className="gap-2">
            <button 
              onClick={() => setShowNewDialog(null)} 
              className="px-4 py-2 rounded-lg text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate} 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
