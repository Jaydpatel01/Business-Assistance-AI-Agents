/**
 * Advanced Keyboard Shortcuts Component
 * 
 * Provides comprehensive keyboard shortcuts for power users
 * Includes customizable shortcuts and search functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Keyboard, 
  Search, 
  Navigation, 
  MessageSquare, 
  FileText, 
  Zap,
  Command
} from 'lucide-react';

interface KeyboardShortcut {
  id: string;
  description: string;
  keys: string[];
  category: string;
  action?: () => void;
}

const keyboardShortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    description: 'Go to Dashboard',
    keys: ['Ctrl', 'Shift', 'D'],
    category: 'navigation'
  },
  {
    id: 'nav-scenarios',
    description: 'Go to Scenarios',
    keys: ['Ctrl', 'Shift', 'S'],
    category: 'navigation'
  },
  {
    id: 'nav-boardroom',
    description: 'Go to Boardroom',
    keys: ['Ctrl', 'Shift', 'B'],
    category: 'navigation'
  },
  {
    id: 'nav-documents',
    description: 'Go to Documents',
    keys: ['Ctrl', 'Shift', 'F'],
    category: 'navigation'
  },
  {
    id: 'nav-analytics',
    description: 'Go to Analytics',
    keys: ['Ctrl', 'Shift', 'A'],
    category: 'navigation'
  },
  {
    id: 'nav-settings',
    description: 'Go to Settings',
    keys: ['Ctrl', ','],
    category: 'navigation'
  },

  // General Actions
  {
    id: 'search',
    description: 'Global Search',
    keys: ['Ctrl', 'K'],
    category: 'general'
  },
  {
    id: 'help',
    description: 'Open Help',
    keys: ['F1'],
    category: 'general'
  },
  {
    id: 'shortcuts',
    description: 'Show Keyboard Shortcuts',
    keys: ['Ctrl', '?'],
    category: 'general'
  },
  {
    id: 'notifications',
    description: 'Open Notifications',
    keys: ['Ctrl', 'Shift', 'N'],
    category: 'general'
  },

  // Scenario Management
  {
    id: 'new-scenario',
    description: 'Create New Scenario',
    keys: ['Ctrl', 'N'],
    category: 'scenarios'
  },
  {
    id: 'edit-scenario',
    description: 'Edit Current Scenario',
    keys: ['Ctrl', 'E'],
    category: 'scenarios'
  },
  {
    id: 'duplicate-scenario',
    description: 'Duplicate Scenario',
    keys: ['Ctrl', 'D'],
    category: 'scenarios'
  },
  {
    id: 'delete-scenario',
    description: 'Delete Scenario',
    keys: ['Ctrl', 'Delete'],
    category: 'scenarios'
  },

  // Boardroom Actions
  {
    id: 'new-session',
    description: 'Start New Session',
    keys: ['Ctrl', 'Shift', 'Enter'],
    category: 'boardroom'
  },
  {
    id: 'send-message',
    description: 'Send Message',
    keys: ['Ctrl', 'Enter'],
    category: 'boardroom'
  },
  {
    id: 'clear-input',
    description: 'Clear Message Input',
    keys: ['Escape'],
    category: 'boardroom'
  },
  {
    id: 'focus-input',
    description: 'Focus Message Input',
    keys: ['/', '?'],
    category: 'boardroom'
  },
  {
    id: 'select-ceo',
    description: 'Select CEO Agent',
    keys: ['Alt', '1'],
    category: 'boardroom'
  },
  {
    id: 'select-cfo',
    description: 'Select CFO Agent',
    keys: ['Alt', '2'],
    category: 'boardroom'
  },
  {
    id: 'select-cto',
    description: 'Select CTO Agent',
    keys: ['Alt', '3'],
    category: 'boardroom'
  },
  {
    id: 'select-hr',
    description: 'Select HR Director',
    keys: ['Alt', '4'],
    category: 'boardroom'
  },

  // Document Management
  {
    id: 'upload-document',
    description: 'Upload Document',
    keys: ['Ctrl', 'U'],
    category: 'documents'
  },
  {
    id: 'search-documents',
    description: 'Search Documents',
    keys: ['Ctrl', 'F'],
    category: 'documents'
  },
  {
    id: 'new-folder',
    description: 'Create New Folder',
    keys: ['Ctrl', 'Shift', 'N'],
    category: 'documents'
  },

  // Quick Actions
  {
    id: 'quick-export',
    description: 'Quick Export',
    keys: ['Ctrl', 'Shift', 'E'],
    category: 'quick'
  },
  {
    id: 'quick-share',
    description: 'Quick Share',
    keys: ['Ctrl', 'Shift', 'S'],
    category: 'quick'
  },
  {
    id: 'toggle-theme',
    description: 'Toggle Dark/Light Theme',
    keys: ['Ctrl', 'Shift', 'T'],
    category: 'quick'
  },
  {
    id: 'zoom-in',
    description: 'Zoom In',
    keys: ['Ctrl', '+'],
    category: 'quick'
  },
  {
    id: 'zoom-out',
    description: 'Zoom Out',
    keys: ['Ctrl', '-'],
    category: 'quick'
  },
  {
    id: 'reset-zoom',
    description: 'Reset Zoom',
    keys: ['Ctrl', '0'],
    category: 'quick'
  }
];

const categories = [
  { id: 'all', label: 'All Shortcuts', icon: Keyboard },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'general', label: 'General', icon: Command },
  { id: 'scenarios', label: 'Scenarios', icon: FileText },
  { id: 'boardroom', label: 'Boardroom', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'quick', label: 'Quick Actions', icon: Zap }
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Global keyboard shortcut to open this dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + ? to open shortcuts
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredShortcuts = keyboardShortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index} className="inline-flex items-center">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
      </span>
    ));
  };

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="categories" className="space-y-4">
            <TabsList>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="list">All Shortcuts</TabsTrigger>
              <TabsTrigger value="tips">Power User Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="gap-2"
                    >
                      <Icon className="h-3 w-3" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>

              {/* Shortcuts by Category */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([categoryId, shortcuts]) => {
                    const category = categories.find(c => c.id === categoryId);
                    if (!category || shortcuts.length === 0) return null;

                    const Icon = category.icon;
                    
                    return (
                      <div key={categoryId} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <h4 className="font-semibold">{category.label}</h4>
                          <Badge variant="secondary">{shortcuts.length}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {shortcuts.map((shortcut) => (
                            <Card key={shortcut.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{shortcut.description}</span>
                                <div className="flex items-center gap-1">
                                  {formatKeys(shortcut.keys)}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredShortcuts.map((shortcut) => (
                    <Card key={shortcut.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{shortcut.description}</span>
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === shortcut.category)?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {formatKeys(shortcut.keys)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Power User Tips</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + K</kbd> for global search to quickly find anything
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">/</kbd> in boardroom to quickly focus message input
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Alt + 1-4</kbd> to quickly select different AI agents
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + Shift + E</kbd> for quick export from any page
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Escape</kbd> key cancels most dialogs and clears inputs
                    </li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Workflow Optimization</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Create scenarios with <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + N</kbd>, then immediately start sessions with <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + Shift + Enter</kbd>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + Enter</kbd> to send messages without taking your hands off the keyboard
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Upload documents with <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + U</kbd> for faster document management
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Toggle theme with <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + Shift + T</kbd> for optimal viewing in different environments
                    </li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Accessibility Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      All interactive elements are keyboard accessible with Tab navigation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Screen reader compatible with ARIA labels and proper heading structure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      High contrast mode available in Settings for improved visibility
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Zoom controls (<kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl + +/-</kbd>) for better readability
                    </li>
                  </ul>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
