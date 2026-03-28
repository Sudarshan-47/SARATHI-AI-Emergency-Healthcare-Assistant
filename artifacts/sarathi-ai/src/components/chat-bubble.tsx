import { motion } from 'framer-motion';
import { User, Activity } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg
          ${isUser ? 'bg-secondary border border-white/10' : 'bg-card border border-accent/30 box-glow-accent'}`}
        >
          {isUser ? <User className="w-5 h-5 text-muted-foreground" /> : <Activity className="w-5 h-5 text-accent" />}
        </div>

        {/* Message Content */}
        <div className={`
          p-4 rounded-2xl shadow-lg leading-relaxed
          ${isUser 
            ? 'bg-secondary text-foreground rounded-tr-sm border border-white/5' 
            : 'bg-card/80 backdrop-blur-md text-foreground rounded-tl-sm border border-accent/20'}
        `}>
          <p className="text-sm md:text-base whitespace-pre-wrap">{content}</p>
        </div>
        
      </div>
    </motion.div>
  );
}
