import { cn } from "@/lib/utils";
import { Bot, FileText, Mic } from "lucide-react";

export interface BubbleAttachment {
  name: string;
  type: 'image' | 'audio' | 'file';
  url?: string;
}

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  attachments?: BubbleAttachment[];
}

const ChatBubble = ({ message, isUser, timestamp, attachments }: ChatBubbleProps) => {
  const renderAttachments = () => {
    if (!attachments?.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {attachments.map((att, i) => {
          if (att.type === 'image' && att.url) {
            return (
              <img key={i} src={att.url} alt={att.name} className="max-w-[200px] max-h-[200px] rounded-xl object-cover border border-border" />
            );
          }
          if (att.type === 'audio' && att.url) {
            return (
              <div key={i} className="flex items-center gap-2">
                <audio controls src={att.url} className="h-8 max-w-[220px]" />
              </div>
            );
          }
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground truncate max-w-[120px]">{att.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-5 animate-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-[65%]">
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground shadow-sm">
            {renderAttachments()}
            {message && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>}
          </div>
          {timestamp && (
            <span className="text-[10px] text-muted-foreground mt-1 px-1 block text-right">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-5 animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0 max-w-[75%]">
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          {renderAttachments()}
          {message && <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{message}</p>}
        </div>
        {timestamp && (
          <span className="text-[10px] text-muted-foreground mt-1 block px-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
