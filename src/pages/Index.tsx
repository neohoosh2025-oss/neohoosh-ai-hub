import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, Shield, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Connect instantly with friends and colleagues through secure messaging",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with optimized delivery",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your conversations are encrypted and protected end-to-end",
    },
    {
      icon: Smartphone,
      title: "Works Everywhere",
      description: "Access from any device - mobile, tablet, or desktop",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Welcome to NeoHoosh
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of communication with AI-powered messaging and smart features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/neohi">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Launch NeoHi
                <MessageCircle className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Try AI Chat
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose NeoHoosh?</h2>
          <p className="text-muted-foreground text-lg">
            Built with cutting-edge technology for the modern user
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl p-12 text-center border border-primary/20"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users experiencing the next generation of messaging
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-10 py-6">
              Create Account
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
