"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonalityConfig {
  risk_tolerance: number
  decision_speed: number
  collaboration_style: number
  detail_focus: number
  communication_style: 'formal' | 'casual' | 'technical' | 'diplomatic'
}

interface PersonalityConfigProps {
  config: PersonalityConfig
  onChange: (config: PersonalityConfig) => void
  disabled?: boolean
}

export function PersonalityConfig({ config, onChange, disabled = false }: PersonalityConfigProps) {
  const handleSliderChange = (key: keyof Omit<PersonalityConfig, 'communication_style'>, value: number[]) => {
    onChange({
      ...config,
      [key]: value[0]
    })
  }

  const handleCommunicationStyleChange = (value: PersonalityConfig['communication_style']) => {
    onChange({
      ...config,
      communication_style: value
    })
  }

  const getSliderDescription = (key: string, value: number) => {
    switch (key) {
      case 'risk_tolerance':
        return value < 30 ? 'Conservative' : value < 70 ? 'Balanced' : 'Aggressive'
      case 'decision_speed':
        return value < 30 ? 'Deliberate' : value < 70 ? 'Moderate' : 'Quick'
      case 'collaboration_style':
        return value < 30 ? 'Independent' : value < 70 ? 'Collaborative' : 'Team-oriented'
      case 'detail_focus':
        return value < 30 ? 'Big Picture' : value < 70 ? 'Balanced' : 'Detail-oriented'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personality Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Tolerance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
            <span className="text-sm text-muted-foreground">
              {getSliderDescription('risk_tolerance', config.risk_tolerance)}
            </span>
          </div>
          <Slider
            id="risk-tolerance"
            min={0}
            max={100}
            step={5}
            value={[config.risk_tolerance]}
            onValueChange={(value) => handleSliderChange('risk_tolerance', value)}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Decision Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="decision-speed">Decision Speed</Label>
            <span className="text-sm text-muted-foreground">
              {getSliderDescription('decision_speed', config.decision_speed)}
            </span>
          </div>
          <Slider
            id="decision-speed"
            min={0}
            max={100}
            step={5}
            value={[config.decision_speed]}
            onValueChange={(value) => handleSliderChange('decision_speed', value)}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Deliberate</span>
            <span>Quick</span>
          </div>
        </div>

        {/* Collaboration Style */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="collaboration-style">Collaboration Style</Label>
            <span className="text-sm text-muted-foreground">
              {getSliderDescription('collaboration_style', config.collaboration_style)}
            </span>
          </div>
          <Slider
            id="collaboration-style"
            min={0}
            max={100}
            step={5}
            value={[config.collaboration_style]}
            onValueChange={(value) => handleSliderChange('collaboration_style', value)}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Independent</span>
            <span>Team-oriented</span>
          </div>
        </div>

        {/* Detail Focus */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="detail-focus">Detail Focus</Label>
            <span className="text-sm text-muted-foreground">
              {getSliderDescription('detail_focus', config.detail_focus)}
            </span>
          </div>
          <Slider
            id="detail-focus"
            min={0}
            max={100}
            step={5}
            value={[config.detail_focus]}
            onValueChange={(value) => handleSliderChange('detail_focus', value)}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Big Picture</span>
            <span>Detail-oriented</span>
          </div>
        </div>

        {/* Communication Style */}
        <div className="space-y-3">
          <Label htmlFor="communication-style">Communication Style</Label>
          <Select 
            value={config.communication_style} 
            onValueChange={handleCommunicationStyleChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select communication style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal - Professional and structured</SelectItem>
              <SelectItem value="casual">Casual - Friendly and approachable</SelectItem>
              <SelectItem value="technical">Technical - Data-driven and precise</SelectItem>
              <SelectItem value="diplomatic">Diplomatic - Tactful and considerate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
