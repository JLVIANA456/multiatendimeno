"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../../hooks/use-outside-click";

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

type CardData = {
  id: string;
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

interface CardProps {
  card: CardData;
  index: number;
  layout?: boolean;
}

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l",
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-6 pl-4",
              "mx-auto max-w-7xl",
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.1 * index,
                    ease: "easeOut",
                  },
                }}
                key={"card" + index}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%] [content-visibility:auto]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2 -mt-10 mb-10">
          <button
            className="relative z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 disabled:opacity-30 transition-all hover:bg-gray-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <button
            className="relative z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 disabled:opacity-30 transition-all hover:bg-gray-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: CardProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const content = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] h-screen w-screen flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-full w-full bg-black/40 backdrop-blur-md pointer-events-auto"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            ref={containerRef}
            layoutId={layout ? `card-${card.id || card.title}` : undefined}
            className="relative z-[10000] h-[90vh] w-[95vw] md:w-[80vw] max-w-5xl bg-white p-8 md:p-16 rounded-[3rem] font-sans dark:bg-neutral-900 shadow-2xl overflow-y-auto pointer-events-auto"
          >
            <button
              className="absolute top-8 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-[10001]"
              onClick={handleClose}
            >
              <IconX className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex flex-col gap-4">
              <motion.p
                layoutId={layout ? `category-${card.id || card.title}` : undefined}
                className="text-xs font-black text-primary-500 uppercase tracking-widest"
              >
                {card.category}
              </motion.p>
              <motion.h2
                layoutId={layout ? `title-${card.id || card.title}` : undefined}
                className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter"
              >
                {card.title}
              </motion.h2>
            </div>

            <div className="mt-12">{card.content}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {typeof document !== "undefined" ? createPortal(content, document.body) : null}
      
      <motion.button
        layoutId={layout ? `card-${card.id || card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-[26rem] w-[20rem] flex-col overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-40 p-10 flex flex-col h-full justify-between items-start text-left">
          <div className="flex flex-col gap-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-500 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 shadow-sm">
              {card.icon || <i className="fa-solid fa-chart-pie text-2xl"></i>}
            </div>
            
            <div className="flex flex-col gap-1">
              <motion.p
                layoutId={layout ? `category-${card.id || card.category}` : undefined}
                className="text-gray-400 font-sans text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                {card.category}
              </motion.p>
              
              <motion.div
                layoutId={layout ? `title-${card.id || card.title}` : undefined}
              >
                <h3 className="text-gray-900 text-3xl font-black tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                  {card.title}
                </h3>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400 group-hover:text-primary-500 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest">Ver Detalhes</span>
            <IconArrowNarrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: any) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-gray-50">
      <img
        className={cn(
          "h-full w-full transition-all duration-700 ease-in-out",
          isLoading ? "blur-2xl opacity-0" : "blur-0 opacity-20", // Reduced opacity to keep it light
          className,
        )}
        onLoad={() => setLoading(false)}
        src={src as string}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        alt={alt ? alt : "Background"}
        {...rest}
      />
    </div>
  );
};
