import { Check, Play } from "lucide-react";

export default function Demo() {
  const features = [
    "Real-time cursor tracking",
    "Integrated video chat",
    "Code history and playback",
    "Multi-language support",
    "Customizable editor themes",
    "Instant session sharing",
  ];

  return (
    <section
      id="demo"
      className="py-20 bg-[linear-gradient(to_bottom_right,var(--grey-gradient-start),var(--grey-gradient-end))]"
    >
      <div className="container mx-auto px-4">
        <h2
          className="text-4xl font-bold inline-block relative after:content-[''] after:block after:w-full after:h-1 mb-16
                         after:bg-gradient-to-r after:from-black after:via-gray-500 after:to-transparent after:mt-1"
        >
          See CollabX in Action
          <span className="absolute bottom-[-8px] left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></span>
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
          <div className="w-full md:w-3/5 relative">
            <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative">
              <img
                src="/placeholder.svg"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-black/50 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                  <Play className="h-10 w-10 text-white" fill="white" />
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/5">
            <h3 className="text-2xl font-semibold mb-6">Key Features</h3>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-6 w-6 text-accent mr-3" />
                  <span className="text-lg">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
