import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  Trash2,
  FileCode,
  FileText,
  FileJson
} from 'lucide-react';
import { useFilesStore, VirtualFile } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-yellow-400" />;
    case 'css':
    case 'scss':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-green-400" />;
    default:
      return <FileText className="w-4 h-4 text-muted-foreground" />;
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
              "flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-md transition-all text-sm",
              "hover:bg-accent/50",
              isActive && "bg-accent text-accent-foreground"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={handleClick}
          >
            {file.type === 'folder' ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-400" />
                )}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                {getFileIcon(file.name)}
              </>
            )}
            <span className="truncate">{file.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {file.type === 'folder' && (
            <>
              <ContextMenuItem onClick={() => setShowNewDialog('file')}>
                <Plus className="w-4 h-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setShowNewDialog('folder')}>
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </ContextMenuItem>
            </>
          )}
          {file.id !== 'root' && file.id !== 'src' && file.id !== 'public' && (
            <ContextMenuItem 
              onClick={() => deleteFile(file.id)}
              className="text-destructive"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {showNewDialog === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={showNewDialog === 'file' ? 'filename.js' : 'folder-name'}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const FileTree = () => {
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
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Explorer</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowNewDialog('file')}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowNewDialog('folder')}
          >
            <Folder className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        {rootFile?.children?.map((id) => {
          const file = files[id];
          if (!file) return null;
          return <FileTreeItem key={id} file={file} depth={0} />;
        })}
      </div>

      <Dialog open={showNewDialog !== null} onOpenChange={() => setShowNewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {showNewDialog === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={showNewDialog === 'file' ? 'filename.js' : 'folder-name'}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
