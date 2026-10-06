import { motion } from 'framer-motion';
import { UserRound, HeartPulse } from 'lucide-react';

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
      className={`mb-5 flex w-full ${isUser ? 'justify-end' : 'justify-start'} sm:mb-6`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl
          ${isUser ? 'border border-border bg-secondary text-muted-foreground' : 'border border-accent/15 bg-accent/10 text-accent'}`}
        >
          {isUser ? <UserRound className="h-[18px] w-[18px]" /> : <HeartPulse className="h-[18px] w-[18px]" />}
        </div>

        {/* Message Content */}
        <div className={`
          rounded-2xl p-3.5 leading-relaxed sm:p-4
          ${isUser 
            ? 'rounded-tr-sm border border-border bg-[#eaf1f1] text-foreground' 
            : 'rounded-tl-sm border border-border bg-white text-foreground shadow-[0_4px_14px_rgba(27,53,64,.035)]'}
        `}>
          <p className="whitespace-pre-wrap text-[13px] leading-6 sm:text-sm sm:leading-7">{content}</p>
        </div>
        
      </div>
    </motion.div>
  );
}
