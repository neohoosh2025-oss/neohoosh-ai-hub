import { useState } from 'react';
import { 
  Home, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Trash2,
  FolderOpen,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { useFilesStore } from '@/store/filesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

export const Header = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const { projectName, setProjectName, files, resetToDefault } = useFilesStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(projectName);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleRename = () => {
    if (newName.trim()) {
      setProjectName(newName.trim());
      toast.success('Project renamed!');
    }
    setIsRenaming(false);
  };

  const handleExport = () => {
    // Create a JSON export of all files
    const exportData = {
      name: projectName,
      files: Object.values(files).filter(f => f.type === 'file').map(f => ({
        path: f.path,
        content: f.content,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.neoforge.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Project exported!');
  };

  const handleReset = () => {
    resetToDefault();
    setShowResetDialog(false);
    toast.success('Project reset to defaults');
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <Home className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              NeoForge
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Project Name */}
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-48 h-8"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setNewName(projectName);
                setIsRenaming(true);
              }}
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              {projectName}
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowResetDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Project?</DialogTitle>
            <DialogDescription>
              This will delete all your changes and reset the project to its default state. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
