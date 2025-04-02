import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote:
        "CollabX transformed our remote team’s workflow. The real-time collaboration features have made our pair programming sessions incredibly productive.",
      author: "Priya S.",
      role: "Developer, Tech Co.",
    },
    {
      quote:
        "The integrated video chat alongside real-time code editing is a game-changer. We’ve cut our meeting time in half while improving code quality.",
      author: "Marcus J.",
      role: "Senior Engineer, StartupX",
    },
    {
      quote:
        "As a coding instructor, CollabX has revolutionized how I teach. I can see exactly where students are struggling in real-time.",
      author: "Elena R.",
      role: "Lead Instructor, CodeAcademy",
    },
    {
      quote:
        "Our distributed team relies on CollabX daily. The multi-language support and instant session sharing have made collaboration seamless.",
      author: "Jamal T.",
      role: "CTO, DevFlow",
    },
  ];

  const cardsPerView = 2; // Show 2 cards at a time
  const maxIndex = Math.ceil(testimonials.length / cardsPerView) - 1;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 7000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, [maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * cardsPerView,
    currentIndex * cardsPerView + cardsPerView
  );

  return (
    <section
      id="testimonials"
      className="py-20 min-h-[600px] bg-[linear-gradient(to_bottom_right,var(--grey-gradient-start),var(--grey-gradient-end))]"
    >
      <div className="container mx-auto px-4">
        <h2
          className="text-4xl font-bold inline-block relative mb-16 after:content-[''] after:block after:w-full after:h-1 
                         after:bg-gradient-to-r after:from-black after:via-gray-500 after:to-transparent after:mt-1"
        >
          What Developers Say
          <span className="absolute bottom-[-8px] left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></span>
        </h2>
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-md"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-md"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex justify-center gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="w-[300px] min-h-[325px] bg-card p-8 rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300 flex-shrink-0"
              >
                <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-[60px] h-[60px] rounded-full bg-muted flex items-center justify-center text-primary font-bold text-xl mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
