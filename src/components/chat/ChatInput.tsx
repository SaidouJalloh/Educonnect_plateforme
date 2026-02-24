import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Mic, Square, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatAttachment {
  file: File;
  previewUrl?: string;
  type: 'image' | 'audio' | 'file';
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: ChatAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ChatInput = ({ onSendMessage, disabled, placeholder = "Pose ta question (orientation, bourses, formations...)" }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      attachments.forEach(a => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    };
  }, []);

  const handleSubmit = () => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── File upload ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: ChatAttachment[] = files.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        type: isImage ? 'image' : 'file',
      };
    });
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Voice recording ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `vocal_${Date.now()}.webm`, { type: 'audio/webm' });
        const previewUrl = URL.createObjectURL(audioBlob);
        setAttachments(prev => [...prev, { file: audioFile, previewUrl, type: 'audio' }]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      console.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const hasContent = message.trim() || attachments.length > 0;

  return (
    <div className="w-full bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.type === 'image' && att.previewUrl ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                  <img src={att.previewUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : att.type === 'audio' ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border">
                  <Mic className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-foreground">Vocal</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border max-w-[150px]">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground truncate">{att.file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recording state */}
      {isRecording ? (
        <div className="px-5 py-4 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive flex-1">
            Enregistrement... {formatTime(recordingTime)}
          </span>
          <button
            onClick={cancelRecording}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            title="Annuler"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={stopRecording}
            className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Arrêter"
          >
            <Square className="w-3 h-3 text-destructive-foreground" />
          </button>
        </div>
      ) : (
        <div className="px-5 pt-4 pb-3 flex items-end gap-2">
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 mb-0.5"
            title="Joindre un fichier"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed"
          />

          {/* Mic or Send */}
          {hasContent ? (
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity mb-0.5"
            >
              <ArrowUp className="w-4 h-4 text-background" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={disabled}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 mb-0.5"
              title="Message vocal"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
