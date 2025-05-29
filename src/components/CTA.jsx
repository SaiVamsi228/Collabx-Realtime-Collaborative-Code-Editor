import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // Ensure this import is present

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-4xl font-bold mb-6">Ready to Code Together?</h2>
        <p className="text-xl opacity-90 mb-10">
          Join thousands of developers using CollabX to accelerate their
          projects.
        </p>
        <Button className="relative overflow-hidden bg-background text-primary border border-primary text-lg px-6 py-6 font-semibold h-auto rounded-2xl transition-all group">
          <span className="absolute inset-0 bg-[#150f37] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
          <span className="relative flex items-center group-hover:text-white">
            <Link to="/auth" className="flex items-center">
              Start Coding Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </span>
        </Button>
      </div>
    </section>
  );
}
