import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { Camera, ChefHat, ShoppingBag, ArrowRight } from 'lucide-react';

const slides = [
  {
    icon: Camera,
    emoji: '📸',
    headline: 'Snap a photo, we\'ll do the rest',
    body: 'Take a photo of your fridge or cupboard and our AI will identify every ingredient',
    gradient: 'from-primary to-secondary',
  },
  {
    icon: ChefHat,
    emoji: '👨‍🍳',
    headline: 'Cook with what you have',
    body: 'Get personalised recipe suggestions that maximise your existing ingredients and reduce waste',
    gradient: 'from-secondary to-primary',
  },
  {
    icon: ShoppingBag,
    emoji: '💰',
    headline: 'Best prices, delivered',
    body: 'We compare prices across supermarkets and find the cheapest way to get ingredients to your door',
    gradient: 'from-warning to-destructive',
  },
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);

  const isLast = step === slides.length - 1;

  return (
    <div className="app-container flex flex-col items-center justify-between min-h-screen bg-card px-6 py-12">
      <button
        onClick={() => setHasOnboarded(true)}
        className="self-end text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center text-center gap-8 max-w-sm"
        >
          <div className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br ${slides[step].gradient} flex items-center justify-center shadow-xl`}>
            <span className="text-6xl">{slides[step].emoji}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              {slides[step].headline}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {slides[step].body}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full space-y-6">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 gradient-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <Button
          variant="gradient"
          size="xl"
          className="w-full"
          onClick={() => {
            if (isLast) {
              setHasOnboarded(true);
            } else {
              setStep(step + 1);
            }
          }}
        >
          {isLast ? 'Get Started' : 'Next'}
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
