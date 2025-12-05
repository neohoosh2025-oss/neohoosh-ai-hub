import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen,
  Plus,
  Trash2,
  FileCode2,
  FileJson,
  FileType,
  File as FileIcon
} from 'lucide-react';
import { useFilesStore, VirtualFile } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
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
    case 'js':
    case 'jsx':
      return <FileCode2 className="w-4 h-4 text-yellow-400" />;
    case 'ts':
    case 'tsx':
      return <FileCode2 className="w-4 h-4 text-blue-400" />;
    case 'css':
    case 'scss':
      return <FileCode2 className="w-4 h-4 text-pink-400" />;
    case 'html':
      return <FileCode2 className="w-4 h-4 text-orange-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-300" />;
    case 'md':
      return <FileType className="w-4 h-4 text-[#A1A1AA]" />;
    default:
      return <FileIcon className="w-4 h-4 text-[#71717A]" />;
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
              "group flex items-center gap-2 px-2 py-1.5 mx-2 rounded-md cursor-pointer transition-all duration-150",
              "hover:bg-[#2A2A2A]",
              isActive && "bg-[#7C3AED]/20 text-[#F5F5F5]"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={handleClick}
          >
            {file.type === 'folder' ? (
              <>
                <span className="text-[#71717A]">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-[#38BDF8]" />
                ) : (
                  <Folder className="w-4 h-4 text-[#38BDF8]" />
                )}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                {getFileIcon(file.name)}
              </>
            )}
            <span className={cn(
              "text-[13px] truncate",
              isActive ? "text-[#F5F5F5]" : "text-[#A1A1AA] group-hover:text-[#F5F5F5]"
            )}>
              {file.name}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#111111] border-[#27272A] min-w-[160px]">
          {file.type === 'folder' && (
            <>
              <ContextMenuItem 
                onClick={() => setShowNewDialog('file')}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#2A2A2A] text-[13px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => setShowNewDialog('folder')}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#2A2A2A] text-[13px]"
              >
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </ContextMenuItem>
            </>
          )}
          {file.id !== 'root' && file.id !== 'src' && file.id !== 'public' && (
            <ContextMenuItem 
              onClick={() => deleteFile(file.id)}
              className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] text-[13px]"
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
        <DialogContent className="bg-[#111111] border-[#27272A]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">
              Create {showNewDialog === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={showNewDialog === 'file' ? 'filename.js' : 'folder-name'}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="neoforge-input w-full"
            autoFocus
          />
          <DialogFooter>
            <button 
              onClick={() => setShowNewDialog(null)}
              className="neoforge-btn neoforge-btn-ghost"
            >
              Cancel
            </button>
            <button onClick={handleCreate} className="neoforge-btn neoforge-btn-primary">
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const Sidebar = () => {
  const { files, createFile, createFolder } = useFilesStore();
  const [showNewDialog, setShowNewDialog] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');
  
  const rootFile = files['root'];

  const handleCreate = () => {
    if (!newName.trim()) return;
    
    if (showNewDialog === 'file') {
      createFile(newName, 'src');
    } else {
      createFolder(newName, 'root');
    }
    
    setNewName('');
    setShowNewDialog(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#111111] border-r border-[#27272A]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#27272A]">
        <span className="text-[13px] font-medium text-[#A1A1AA] uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewDialog('file')}
            className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors text-[#71717A] hover:text-[#F5F5F5]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewDialog('folder')}
            className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors text-[#71717A] hover:text-[#F5F5F5]"
          >
            <Folder className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        {rootFile?.children?.map((id) => {
          const file = files[id];
          if (!file) return null;
          return <FileTreeItem key={id} file={file} depth={0} />;
        })}
      </div>

      <Dialog open={showNewDialog !== null} onOpenChange={() => setShowNewDialog(null)}>
        <DialogContent className="bg-[#111111] border-[#27272A]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">
              Create {showNewDialog === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={showNewDialog === 'file' ? 'filename.js' : 'folder-name'}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="neoforge-input w-full"
            autoFocus
          />
          <DialogFooter>
            <button 
              onClick={() => setShowNewDialog(null)}
              className="neoforge-btn neoforge-btn-ghost"
            >
              Cancel
            </button>
            <button onClick={handleCreate} className="neoforge-btn neoforge-btn-primary">
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
