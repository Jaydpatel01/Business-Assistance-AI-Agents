/**
 * Enhanced Header Component with UX Improvements
 * 
 * Integrates all user experience components and provides quick access
 * to help, shortcuts, performance, and notifications
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HelpSystem } from '@/components/user-experience/help-system';
import { KeyboardShortcuts } from '@/components/user-experience/keyboard-shortcuts';
import { PerformanceDashboard } from '@/components/user-experience/performance-dashboard';
import { NotificationsDialog } from '@/components/notifications-dialog';
import { SearchDialog } from '@/components/search-dialog';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Bell, 
  Search, 
  Settings, 
  Zap,
  Menu,
  ChevronDown
} from 'lucide-react';

interface EnhancedHeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  showPerformance?: boolean;
  notificationCount?: number;
}

export function EnhancedHeader({ 
  title, 
  breadcrumbs = [],
  showPerformance = true,
  notificationCount = 0
}: EnhancedHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          {/* Left Section - Title & Breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Title and Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2">
              {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {breadcrumb.href ? (
                        <a href={breadcrumb.href} className="hover:text-foreground">
                          {breadcrumb.label}
                        </a>
                      ) : (
                        <span>{breadcrumb.label}</span>
                      )}
                      {index < breadcrumbs.length - 1 && (
                        <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                      )}
                    </div>
                  ))}
                </nav>
              )}
              
              {title && (
                <div className="flex items-center gap-2">
                  {breadcrumbs.length > 0 && <Separator orientation="vertical" className="h-4" />}
                  <h1 className="font-semibold">{title}</h1>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Quick Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="gap-2 text-muted-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden xl:inline">Search...</span>
              <Badge variant="outline" className="ml-1 text-xs">
                Ctrl K
              </Badge>
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <HelpSystem />
            <KeyboardShortcuts />
            
            {showPerformance && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <PerformanceDashboard />
              </>
            )}
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>

            {/* Performance Indicator (Mobile) */}
            {showPerformance && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
              >
                <Zap className="h-4 w-4" />
              </Button>
            )}

            {/* Settings */}
            <Button variant="ghost" size="sm" asChild>
              <a href="/settings">
                <Settings className="h-4 w-4" />
              </a>
            </Button>

            <Separator orientation="vertical" className="h-4" />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Navigation */}
            <UserNav />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t bg-background/95 backdrop-blur md:hidden">
            <div className="container py-4 px-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <HelpSystem />
                <KeyboardShortcuts />
                {showPerformance && <PerformanceDashboard />}
                <Button variant="outline" size="sm" asChild>
                  <a href="/settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                </Button>
              </div>
              
              {breadcrumbs.length > 0 && (
                <div className="pt-2">
                  <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((breadcrumb, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {breadcrumb.href ? (
                          <a href={breadcrumb.href} className="hover:text-foreground">
                            {breadcrumb.label}
                          </a>
                        ) : (
                          <span>{breadcrumb.label}</span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Dialogs */}
      <SearchDialog open={showSearch} onOpenChange={setShowSearch} />
      <NotificationsDialog open={showNotifications} onOpenChange={setShowNotifications} />
    </>
  );
}
