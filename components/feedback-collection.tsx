/**
 * Feedback Collection Component
 * 
 * Advanced feedback system for explainable AI decisions
 * Supports ratings, comments, corrections, and validation
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, CheckCircle, Edit3, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackCollectionProps {
  auditId: string;
  agentType: string;
  decision: string;
  onFeedbackSubmitted?: () => void;
}

interface FeedbackItem {
  type: 'rating' | 'comment' | 'correction' | 'validation';
  value: number | string;
  context: string;
}

export function FeedbackCollection({ 
  auditId, 
  agentType, 
  decision, 
  onFeedbackSubmitted 
}: FeedbackCollectionProps) {
  const [activeTab, setActiveTab] = useState<'rating' | 'comment' | 'correction' | 'validation'>('rating');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [correction, setCorrection] = useState('');
  const [validationChoice, setValidationChoice] = useState<'agree' | 'disagree' | ''>('');
  const [validationReason, setValidationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (feedbackData: FeedbackItem) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_feedback',
          auditId,
          userId: 'demo_user', // In real app, this would be the actual user ID
          type: feedbackData.type,
          value: feedbackData.value,
          context: feedbackData.context
        })
      });

      // Reset form
      setRating(0);
      setComment('');
      setCorrection('');
      setValidationChoice('');
      setValidationReason('');
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingSubmit = () => {
    if (rating === 0) return;
    
    const context = rating >= 4 ? 'Positive rating' : rating >= 3 ? 'Neutral rating' : 'Negative rating';
    submitFeedback({
      type: 'rating',
      value: rating,
      context: `${context}: ${rating}/5 stars for ${agentType.toUpperCase()} decision quality`
    });
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    
    submitFeedback({
      type: 'comment',
      value: comment.trim(),
      context: `User comment on ${agentType.toUpperCase()} decision`
    });
  };

  const handleCorrectionSubmit = () => {
    if (!correction.trim()) return;
    
    submitFeedback({
      type: 'correction',
      value: correction.trim(),
      context: `User-suggested correction for ${agentType.toUpperCase()} decision`
    });
  };

  const handleValidationSubmit = () => {
    if (!validationChoice || !validationReason.trim()) return;
    
    submitFeedback({
      type: 'validation',
      value: validationChoice,
      context: `Decision validation: ${validationChoice} - ${validationReason.trim()}`
    });
  };

  const feedbackTabs = [
    { id: 'rating', label: 'Rate Decision', icon: Star },
    { id: 'comment', label: 'Comment', icon: MessageSquare },
    { id: 'correction', label: 'Suggest Correction', icon: Edit3 },
    { id: 'validation', label: 'Validate', icon: CheckCircle }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Provide Feedback
        </CardTitle>
        <CardDescription>
          Help improve AI decision quality by sharing your insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {feedbackTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as 'rating' | 'comment' | 'correction' | 'validation')}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Decision Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-100 text-blue-800">
              {agentType.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-600">Decision</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-3">
            {decision}
          </p>
        </div>

        {/* Rating Tab */}
        {activeTab === 'rating' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                How would you rate this decision? (1-5 stars)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 5 ? 'Excellent decision!' :
                   rating === 4 ? 'Good decision with minor room for improvement' :
                   rating === 3 ? 'Acceptable decision, could be better' :
                   rating === 2 ? 'Poor decision with significant issues' :
                   'Very poor decision, major problems'}
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleRatingSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full"
            >
              Submit Rating
            </Button>
          </div>
        )}

        {/* Comment Tab */}
        {activeTab === 'comment' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Share your thoughts on this decision
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think about the reasoning? Was the evidence sufficient? Any suggestions for improvement?"
                className="min-h-[100px]"
              />
            </div>
            
            <Button 
              onClick={handleCommentSubmit}
              disabled={!comment.trim() || isSubmitting}
              className="w-full"
            >
              Submit Comment
            </Button>
          </div>
        )}

        {/* Correction Tab */}
        {activeTab === 'correction' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Suggest a better decision or approach
              </label>
              <Textarea
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                placeholder="If you disagree with this decision, what would you recommend instead? Please provide your reasoning."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <Edit3 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Suggestion Guidelines</p>
                  <p className="text-orange-700">
                    Please be specific about what should be different and why. 
                    This helps the AI learn and improve its decision-making.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleCorrectionSubmit}
              disabled={!correction.trim() || isSubmitting}
              className="w-full"
            >
              Submit Correction
            </Button>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Do you agree with this decision?
              </label>
              <div className="flex gap-3">
                <Button
                  variant={validationChoice === 'agree' ? 'default' : 'outline'}
                  onClick={() => setValidationChoice('agree')}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Agree
                </Button>
                <Button
                  variant={validationChoice === 'disagree' ? 'default' : 'outline'}
                  onClick={() => setValidationChoice('disagree')}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Disagree
                </Button>
              </div>
            </div>

            {validationChoice && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Why do you {validationChoice} with this decision?
                </label>
                <Textarea
                  value={validationReason}
                  onChange={(e) => setValidationReason(e.target.value)}
                  placeholder={validationChoice === 'agree' 
                    ? "What makes this a good decision? Which aspects were particularly well-reasoned?"
                    : "What concerns do you have? What information might have been missed or misinterpreted?"
                  }
                  className="min-h-[80px]"
                />
              </div>
            )}
            
            <Button 
              onClick={handleValidationSubmit}
              disabled={!validationChoice || !validationReason.trim() || isSubmitting}
              className="w-full"
            >
              Submit Validation
            </Button>
          </div>
        )}

        {/* Success Message */}
        {isSubmitting && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">Submitting feedback...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
