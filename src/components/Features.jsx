import { Code, Users, Video, Share } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Live Collaboration",
      description:
        "See teammates' cursors in real-time with color-coded identifiers.",
    },
    {
      icon: <Video className="h-10 w-10 text-primary" />,
      title: "Integrated Video Chat",
      description:
        "Discuss code face-to-face without leaving your coding environment.",
    },
    {
      icon: <Share className="h-10 w-10 text-primary" />,
      title: "Instant Session Sharing",
      description:
        "Share your coding session with a simple link. No setup required.",
    },
    {
      icon: <Code className="h-10 w-10 text-primary" />,
      title: "Multi-Language Support",
      description:
        "Support for over 40 programming languages with syntax highlighting.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Heading with gradient underline */}
        <div className="text-left mb-16">
          <h2
            className="text-4xl font-bold inline-block relative after:content-[''] after:block after:w-full after:h-1 
                         after:bg-gradient-to-r after:from-black after:via-gray-500 after:to-transparent after:mt-1"
          >
            Core Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
