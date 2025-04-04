import { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Demo from '@/components/Demo';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import AuthPage from '@/components/AuthPage';
import Footer from '@/components/Footer';
import SessionManager from '@/components/SessionManager';

export default function Home() {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-section-in');
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of section is visible
    );

    sectionRefs.current.forEach((ref) => observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <section ref={addToRefs}><Hero /></section>
      <section ref={addToRefs}><Features /></section>
      <section ref={addToRefs}><Demo /></section>
      <section ref={addToRefs}><Testimonials /></section>
      <section ref={addToRefs}><CTA /></section>
      <Footer />
      {/* <SessionManager></SessionManager> */}
    </main>
  );
}
