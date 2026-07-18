"use client";
import React from 'react';
import { GlassCard } from "@/components/shared/GlassCard";
import { WisdomQuote } from "@/lib/store/types";
import { Trash2, Quote } from "lucide-react";
import { useGlobalStore } from "@/lib/store/GlobalStore";

export function WisdomQuoteCard({ quote, delay }: { quote: WisdomQuote, delay: number }) {
  const { deleteWisdomQuote } = useGlobalStore();

  return (
    <GlassCard delay={delay} className="h-full group flex flex-col justify-between" style={{ borderTop: `4px solid ${quote.color}` }}>
      <div className="p-6">
        <Quote className="mb-4 opacity-40" size={24} style={{ color: quote.color }} />
        <p className="text-lg font-medium text-foreground/90 italic leading-relaxed mb-6">
          "{quote.quote}"
        </p>
        <div className="flex flex-col gap-1 mt-auto">
          <span className="font-semibold text-foreground/80">{quote.author}</span>
          {quote.source && <span className="text-sm text-muted-foreground/60">{quote.source}</span>}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => deleteWisdomQuote(quote.id)}
          className="p-2 rounded-full bg-destructive/10 text-destructive/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
          title="Delete Quote"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </GlassCard>
  );
}
