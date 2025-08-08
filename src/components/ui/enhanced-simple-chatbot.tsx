'use client';

import React from 'react';
import { Bot, Copy, CornerRightUp, Sparkles, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function EnhancedAiInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  connectionStatus,
  isStreaming,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  connectionStatus: string;
  isStreaming: boolean;
}) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 50,
    maxHeight: 200,
  });

  const getPlaceholder = () => {
    if (isStreaming) return "AI is responding...";
    if (connectionStatus === 'connected') return "Ask me anything!";
    if (connectionStatus === 'connecting') return "Connecting...";
    return "Disconnected - trying to reconnect...";
  };

  const isDisabled = connectionStatus !== 'connected' || isStreaming;

  return (
    <div className="w-full">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-start gap-2">
        <div className="relative mx-auto w-full max-w-4xl">
          <Textarea
            ref={textareaRef}
            placeholder={getPlaceholder()}
            className={cn(
              'bg-muted/50 text-foreground ring-primary/20 placeholder:text-muted-foreground/70 w-full max-w-4xl resize-none rounded-3xl border-none py-4 pr-12 pl-6 leading-[1.2] text-wrap',
              'focus:ring-primary/30 min-h-[56px] transition-all duration-200 focus:ring-2',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isDisabled}
            value={value}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              onChange(e);
              adjustHeight();
            }}
          />
          <button
            onClick={onSubmit}
            className={cn(
              'bg-primary/10 hover:bg-primary/20 absolute top-1/2 right-3 -translate-y-1/2 rounded-xl p-2 transition-all duration-200',
              value.trim() && !isDisabled ? 'opacity-100' : 'cursor-not-allowed opacity-50',
            )}
            type="button"
            disabled={!value.trim() || isDisabled}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <CornerRightUp
                className={cn(
                  'text-primary h-4 w-4 transition-opacity',
                  value.trim() && !isDisabled ? 'opacity-100' : 'opacity-50',
                )}
              />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4">
          <p className="text-muted-foreground text-xs">
            {value.length}/2000 characters
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === 'connected' ? "bg-green-500" :
              connectionStatus === 'connecting' ? "bg-yellow-500 animate-pulse" :
              connectionStatus === 'error' ? "bg-red-500" : "bg-gray-500"
            )} />
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnhancedSimpleChatbot() {
  const { 
    messages: geminiMessages, 
    isStreaming, 
    currentResponse, 
    sendTextMessage,
    connectionStatus,
    selectedFilter
  } = useEnhancedAIAssistant();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Convert Gemini messages to display format and apply filter
  const messages: Message[] = geminiMessages
    .map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content.text || '',
      timestamp: msg.timestamp
    }))
    .filter(msg => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Conversation') return msg.role === 'user' || msg.role === 'assistant';
      if (selectedFilter === 'Tools') return false; // No tool messages yet
      return true;
    });

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse, isStreaming]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim() || connectionStatus !== 'connected' || isStreaming) return;
      
      sendTextMessage(input.trim());
      setInput('');
    },
    [input, sendTextMessage, connectionStatus, isStreaming],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here if needed
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
      <div className="border-primary/20 bg-card/40 text-card-foreground h-full flex-1 overflow-y-auto rounded-xl border p-4 text-sm leading-6 shadow-md sm:text-base sm:leading-7">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="whitespace-pre-wrap">
                {message.role === 'user' ? (
                  <div className="flex flex-row px-2 py-4 sm:px-4">
                    <img
                      alt="user"
                      className="mr-2 flex size-6 rounded-full sm:mr-4 md:size-8"
                      src="/logo.webp"
                      width={32}
                      height={32}
                    />
                    <div className="flex max-w-3xl flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">You</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-foreground">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mb-4 flex rounded-xl bg-neutral-50 px-2 py-6 sm:px-4 dark:bg-neutral-900">
                    <Bot className="bg-secondary text-primary mr-2 flex size-8 rounded-full p-1 sm:mr-4" />
                    <div className="markdown-body w-full max-w-3xl overflow-x-auto rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary">AI Assistant</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-foreground">{message.content}</p>
                    </div>
                    <button
                      type="button"
                      title="Copy message"
                      className="absolute top-2 right-2 rounded-full bg-rose-500 p-1 opacity-50 transition-all hover:opacity-75 active:scale-95 dark:bg-neutral-800"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Show streaming response */}
            {isStreaming && currentResponse && (
              <div className="whitespace-pre-wrap">
                <div className="relative mb-4 flex rounded-xl bg-neutral-50 px-2 py-6 sm:px-4 dark:bg-neutral-900">
                  <Bot className="bg-secondary text-primary mr-2 flex size-8 rounded-full p-1 sm:mr-4" />
                  <div className="markdown-body w-full max-w-3xl overflow-x-auto rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-primary">AI Assistant</span>
                      <span className="text-xs text-muted-foreground">typing...</span>
                    </div>
                    <p className="text-foreground">{currentResponse}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show typing indicator when streaming but no content yet */}
            {isStreaming && !currentResponse && (
              <div className="bg-primary/5 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2">
                <Sparkles className="text-primary h-4 w-4 animate-pulse" />
                <span className="from-primary/80 to-primary animate-pulse bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent">
                  AI is thinking...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-muted-foreground mx-auto px-2 text-center text-xl font-semibold tracking-wide md:text-2xl">
              Start Chatting with
              <br />
              <span className="text-primary text-2xl font-bold md:text-4xl">
                MVPBlocks
              </span>
              <span className="text-primary">.AI</span>
            </p>
            <div className="group relative mt-6">
              <div className="from-primary/30 to-primary/10 absolute -inset-1 rounded-full bg-gradient-to-r opacity-75 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
              <img
                src="/assets/robo.svg"
                alt="AI Assistant"
                width={200}
                height={200}
                className="relative transition-all duration-500 hover:scale-105 active:scale-95"
              />
            </div>
            
            {/* Connection status indicator */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn(
                "w-2 h-2 rounded-full",
                connectionStatus === 'connected' ? "bg-green-500" :
                connectionStatus === 'connecting' ? "bg-yellow-500 animate-pulse" :
                connectionStatus === 'error' ? "bg-red-500" : "bg-gray-500"
              )} />
              <span className="capitalize">{connectionStatus}</span>
              {connectionStatus === 'connected' && (
                <span className="text-green-600">• Ready to chat</span>
              )}
            </div>
          </div>
        )}
      </div>

      <form className="mt-2" onSubmit={handleSubmit}>
        <div className="relative">
          <EnhancedAiInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            connectionStatus={connectionStatus}
            isStreaming={isStreaming}
          />
        </div>
      </form>
    </div>
  );
}