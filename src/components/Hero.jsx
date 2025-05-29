import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { Link } from "react-router-dom"; // Ensure this import is present
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Code together in real-time.",
        "Seamless multi-language support.",
        "Integrated video chat.",
        "Instant session sharing.",
      ],
      typeSpeed: 50,
      backSpeed: 25,
      backDelay: 2000,
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  return (
    <section
      className="min-h-screen pt-20"
      style={{
        background:
          "linear-gradient(to bottom right, #1e1e1e 5%, #3a3a3a 15%, #E3E3E4 90%)",
      }}
    >
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 text-white mb-12 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold leading-tight mb-6">
            Real-Time Code Collaboration{" "}
            <span className="text-accent">Made Simple</span>
          </h1>
          <div className="h-16 mb-6">
            <p className="text-xl md:text-2xl font-medium">
              <span ref={typedRef}></span>
            </p>
          </div>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-xl">
            Pair program, debug together, and share knowledge in real-time with
            integrated video chat and multi-language support.
          </p>
          <Button className="bg-slate-50 text-gray-800 hover:bg-gray-100 hover:translate-y-[-2px] transition-all text-lg px-7 py-5 h-auto font-550 rounded-lg flex items-center">
            <Link to="/auth" className="flex items-center">
              Start Coding Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        {/* Code Editor Section */}
        <div className="w-full md:w-1/2">
          <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden max-w-xl mx-auto">
            <div className="bg-slate-800 px-4 py-2 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 text-gray-400 text-sm">script.js</div>
            </div>
            <div className="p-6 relative font-mono text-[14px]">
              <pre className="text-gray-300 relative">
                <span className="text-green-400">
                  // Collaborating in real-time
                </span>
                <br />
                <span className="text-blue-400">function</span>{" "}
                <span className="text-yellow-300 relative">
                  team
                  <span className="inline-block h-[18px] w-1 bg-blue-300 shadow shadow-blue-300/50 animate-pulse"></span>
                  work
                </span>
                () {"{"}
                <br />
                {"  "}
                <span className="text-cyan-400">console</span>.
                <span className="text-yellow-300 relative">
                  log
                  <span className="inline-block h-[18px] w-1 bg-purple-300 shadow shadow-purple-300/50 animate-pulse"></span>
                </span>
                (<span className="text-orange-300">'Happy coding!'</span>);
                <br />
                {"}"}
              </pre>
              <div className="absolute top-[42px] left-[130px] text-xs bg-blue-500 text-white px-1 py-0.5 rounded-sm -mt-5 font-medium shadow-md">
                Sarah
              </div>
              <div className="absolute top-[64px] left-[190px] text-xs bg-purple-500 text-white px-1 py-0.5 rounded-sm -mt-5 font-medium shadow-md">
                Bob
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <div className="w-12 h-12 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-medium shadow-lg">
                  S
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white font-medium shadow-lg">
                  B
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Code Editor Section */}
      </div>
    </section>
  );
}
