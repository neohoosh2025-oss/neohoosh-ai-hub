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
  File as FileIcon,
  Code2,
  MoreHorizontal
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
    case 'js':
      return <FileCode2 className="w-4 h-4 text-[#F7DF1E]" />;
    case 'jsx':
      return <Code2 className="w-4 h-4 text-[#61DAFB]" />;
    case 'ts':
    case 'tsx':
      return <Code2 className="w-4 h-4 text-[#3178C6]" />;
    case 'css':
    case 'scss':
      return <FileType className="w-4 h-4 text-[#38BDF8]" />;
    case 'html':
      return <FileCode2 className="w-4 h-4 text-[#E34F26]" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-[#F59E0B]" />;
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
              "group flex items-center gap-2 py-1.5 px-2 mx-1 rounded-md cursor-pointer transition-all",
              "hover:bg-[#27272A]",
              isActive && "bg-[#7C3AED]/15 text-[#F5F5F5]"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={handleClick}
          >
            {file.type === 'folder' ? (
              <>
                <span className="text-[#71717A]">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </span>
                {isExpanded ? <FolderOpen className="w-4 h-4 text-[#F59E0B]" /> : <Folder className="w-4 h-4 text-[#F59E0B]" />}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                {getFileIcon(file.name)}
              </>
            )}
            <span className={cn(
              "text-[13px] truncate flex-1",
              isActive ? "text-[#F5F5F5]" : "text-[#A1A1AA] group-hover:text-[#F5F5F5]"
            )}>
              {file.name}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#18181A] border-[#27272A] min-w-[160px]">
          {file.type === 'folder' && (
            <>
              <ContextMenuItem 
                onClick={() => setShowNewDialog('file')}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A] text-[13px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => setShowNewDialog('folder')}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A] text-[13px]"
              >
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-[#27272A]" />
            </>
          )}
          {file.id !== 'root' && file.id !== 'src' && file.id !== 'public' && (
            <ContextMenuItem 
              onClick={() => deleteFile(file.id)}
              className="text-[#EF4444] hover:bg-[#27272A] text-[13px]"
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
        <DialogContent className="bg-[#18181A] border-[#27272A]">
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
            className="nf-input w-full"
            autoFocus
          />
          <DialogFooter>
            <button onClick={() => setShowNewDialog(null)} className="nf-btn nf-btn-ghost">
              Cancel
            </button>
            <button onClick={handleCreate} className="nf-btn nf-btn-primary">
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
    <div className="h-full flex flex-col bg-[#111113] border-l border-[#1E1E1E]">
      {/* Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#1E1E1E]">
        <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Explorer</span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setShowNewDialog('file')}
            className="p-1.5 rounded-md hover:bg-[#27272A] transition-colors text-[#71717A] hover:text-[#A1A1AA]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-[#27272A] transition-colors text-[#71717A] hover:text-[#A1A1AA]">
            <MoreHorizontal className="w-4 h-4" />
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
        <DialogContent className="bg-[#18181A] border-[#27272A]">
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
            className="nf-input w-full"
            autoFocus
          />
          <DialogFooter>
            <button onClick={() => setShowNewDialog(null)} className="nf-btn nf-btn-ghost">
              Cancel
            </button>
            <button onClick={handleCreate} className="nf-btn nf-btn-primary">
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
