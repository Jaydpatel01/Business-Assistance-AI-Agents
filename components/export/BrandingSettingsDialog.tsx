"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Palette, FileText, Download, Upload } from 'lucide-react';
import {
  BrandingConfig,
  defaultBranding,
  brandingPresets,
  validateBranding,
  exportBrandingConfig,
  importBrandingConfig,
} from '@/lib/pdf/branding-config';
import { useToast } from '@/hooks/use-toast';

interface BrandingSettingsDialogProps {
  onSave: (branding: BrandingConfig) => void;
  currentBranding?: BrandingConfig;
}

export function BrandingSettingsDialog({
  onSave,
  currentBranding = defaultBranding,
}: BrandingSettingsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig>(currentBranding);

  const handleSave = () => {
    const validation = validateBranding(branding);
    
    if (!validation.valid) {
      toast({
        title: "Invalid Configuration",
        description: validation.errors.join('\n'),
        variant: "destructive",
      });
      return;
    }

    onSave(branding);
    setOpen(false);
    toast({
      title: "Branding Saved",
      description: "Your branding preferences have been saved successfully.",
    });
  };

  const handlePresetChange = (presetName: string) => {
    if (presetName in brandingPresets) {
      setBranding(brandingPresets[presetName as keyof typeof brandingPresets]);
    }
  };

  const handleExport = () => {
    const json = exportBrandingConfig(branding);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'branding-config.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Configuration Exported",
      description: "Branding configuration has been downloaded.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const imported = importBrandingConfig(content);
        setBranding(imported);
        toast({
          title: "Configuration Imported",
          description: "Branding configuration has been loaded successfully.",
        });
      } catch {
        toast({
          title: "Import Failed",
          description: "Invalid branding configuration file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Branding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Branding Settings</DialogTitle>
          <DialogDescription>
            Customize the appearance of your PDF reports with company branding and color themes.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">
              <FileText className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          {/* Company Info Tab */}
          <TabsContent value="company" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={branding.companyName || ''}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  placeholder="Executive Boardroom AI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={branding.companyWebsite || ''}
                  onChange={(e) => setBranding({ ...branding, companyWebsite: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={branding.companyEmail || ''}
                  onChange={(e) => setBranding({ ...branding, companyEmail: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={branding.companyPhone || ''}
                  onChange={(e) => setBranding({ ...branding, companyPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={branding.companyAddress || ''}
                  onChange={(e) => setBranding({ ...branding, companyAddress: e.target.value })}
                  placeholder="123 Business St, City, State 12345"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showCompanyInfo"
                checked={branding.showCompanyInfo}
                onCheckedChange={(checked) => setBranding({ ...branding, showCompanyInfo: checked })}
              />
              <Label htmlFor="showCompanyInfo">Show company info in reports</Label>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    placeholder="#6b7280"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="successColor">Success Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="successColor"
                    type="color"
                    value={branding.successColor}
                    onChange={(e) => setBranding({ ...branding, successColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.successColor}
                    onChange={(e) => setBranding({ ...branding, successColor: e.target.value })}
                    placeholder="#10b981"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warningColor">Warning Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="warningColor"
                    type="color"
                    value={branding.warningColor}
                    onChange={(e) => setBranding({ ...branding, warningColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.warningColor}
                    onChange={(e) => setBranding({ ...branding, warningColor: e.target.value })}
                    placeholder="#f59e0b"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dangerColor">Danger Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="dangerColor"
                    type="color"
                    value={branding.dangerColor}
                    onChange={(e) => setBranding({ ...branding, dangerColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.dangerColor}
                    onChange={(e) => setBranding({ ...branding, dangerColor: e.target.value })}
                    placeholder="#ef4444"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={branding.fontFamily}
                  onValueChange={(value) => 
                    setBranding({ ...branding, fontFamily: value as BrandingConfig['fontFamily'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica (Sans-serif)</SelectItem>
                    <SelectItem value="Times-Roman">Times Roman (Serif)</SelectItem>
                    <SelectItem value="Courier">Courier (Monospace)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="8"
                  max="16"
                  value={branding.fontSize}
                  onChange={(e) => setBranding({ ...branding, fontSize: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageMargin">Page Margin</Label>
                <Input
                  id="pageMargin"
                  type="number"
                  min="20"
                  max="100"
                  value={branding.pageMargin}
                  onChange={(e) => setBranding({ ...branding, pageMargin: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="watermarkText">Watermark Text</Label>
                <Input
                  id="watermarkText"
                  value={branding.watermarkText || ''}
                  onChange={(e) => setBranding({ ...branding, watermarkText: e.target.value })}
                  placeholder="CONFIDENTIAL"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showWatermark"
                  checked={branding.showWatermark}
                  onCheckedChange={(checked) => setBranding({ ...branding, showWatermark: checked })}
                />
                <Label htmlFor="showWatermark">Show watermark</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeCharts"
                  checked={branding.includeCharts}
                  onCheckedChange={(checked) => setBranding({ ...branding, includeCharts: checked })}
                />
                <Label htmlFor="includeCharts">Include charts in reports</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeTranscript"
                  checked={branding.includeTranscript}
                  onCheckedChange={(checked) => setBranding({ ...branding, includeTranscript: checked })}
                />
                <Label htmlFor="includeTranscript">Include full transcript</Label>
              </div>
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(brandingPresets).map((presetName) => (
                <Button
                  key={presetName}
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => handlePresetChange(presetName)}
                >
                  <div className="font-semibold capitalize">{presetName}</div>
                  <div className="flex gap-2 mt-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: brandingPresets[presetName as keyof typeof brandingPresets].primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: brandingPresets[presetName as keyof typeof brandingPresets].secondaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: brandingPresets[presetName as keyof typeof brandingPresets].accentColor }}
                    />
                  </div>
                </Button>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Config
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <label>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Config
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
