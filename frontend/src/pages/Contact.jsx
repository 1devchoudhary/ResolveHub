import { useState } from 'react';
import { Mail, MessageCircle, Phone, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Eyebrow, SectionHeading } from '../components/ui/SectionHeading';
import { Label, Input, Select, Textarea } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { cn } from '../utilities/cn';

const infoCardClasses =
  'bg-surface-primary rounded-xl border border-border-default p-6 shadow-soft flex items-start gap-4 hover:border-brand-200 hover:shadow-medium transition-all duration-200';

const infoIconClasses =
  'w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0';

export const Contact = () => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Accordion State for FAQs (open index or null)
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      question: 'How do I track my ticket?',
      answer:
        'Once you submit a ticket, you will receive an instant email confirmation with your unique Ticket ID and tracking link. You can also view live updates directly from your Dashboard after logging in.',
    },
    {
      question: 'What is your response time?',
      answer:
        'Our average response time is under 2 hours during active business hours. For Critical or High-priority tickets, our dedicated on-call engineers typically respond within 30 minutes.',
    },
    {
      question: 'Can I change my ticket priority?',
      answer:
        'Yes! You can reply to any ticket email or open the ticket in your portal to request an escalation or adjust the priority level if your situation becomes more urgent.',
    },
  ];

  return (
    <main className="bg-surface-primary">
      {/* ──────────────── 1. HERO SECTION ──────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)]" aria-hidden="true"></div>
        <div className="relative py-16 sm:py-24 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow className="mb-5 animate-fade-in">Contact</Eyebrow>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight animate-fade-in stagger-1">
            Get in touch
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-xl mx-auto animate-fade-in stagger-2">
            Have a question? We usually reply within 2 hours.
          </p>
        </div>
      </section>

      {/* ──────────────── 2. MAIN SECTION: FORM (60%) + INFO CARDS (40%) ──────────────── */}
      <section className="pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Form (7 cols ~ 58-60%) */}
          <div className="lg:col-span-7 bg-surface-primary rounded-2xl border border-border-default p-6 sm:p-8 shadow-medium">
            {submitted ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-14 h-14 bg-status-success-bg text-status-success rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-status-success-bg/50">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  Message Sent!
                </h3>
                <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
                  Thank you for reaching out, {formData.fullName || 'there'}. Our team has received your ticket and will respond to{' '}
                  <span className="font-semibold text-text-primary">{formData.email}</span> shortly.
                </p>
                <Button
                  className="mt-6"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      email: '',
                      subject: '',
                      message: '',
                    });
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" id="contact-form">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Send us a message</h2>
                  <p className="mt-1 text-sm text-text-secondary">Fill in the form and the right person will get back to you.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="contact-name">Full name</Label>
                    <Input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Jane Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div>
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Select
                    id="contact-subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Account & Billing</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </Select>
                </div>

                {/* Message Textarea */}
                <div>
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Describe how we can help you in detail..."
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" fullWidth id="btn-contact-submit">
                  Send message
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: 3 Info Cards (5 cols ~ 40%) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card 1: Email us */}
            <div className={infoCardClasses}>
              <div className={infoIconClasses}>
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Email us
                </h3>
                <p className="mt-1 text-sm text-brand-600 dark:text-brand-400 font-medium">
                  support@resolvehub.com
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  We respond within 2 hours
                </p>
              </div>
            </div>

            {/* Card 2: Live chat */}
            <div className={infoCardClasses}>
              <div className={infoIconClasses}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Live chat
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
                  </span>
                  <span className="text-sm font-medium text-text-secondary">
                    Available 24/7
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  Average wait time: 2 mins
                </p>
              </div>
            </div>

            {/* Card 3: Phone */}
            <div className={infoCardClasses}>
              <div className={infoIconClasses}>
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Phone
                </h3>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  +1 (555) 123-4567
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  Mon to Fri, 9am to 6pm EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 3. FAQ STRIP (ACCORDION) ──────────────── */}
      <section className="py-20 bg-surface-secondary border-t border-border-default">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Quick answers"
            description="Common questions about getting in touch and support resolution."
            className="mb-10"
          />

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={cn(
                    'bg-surface-primary rounded-xl border overflow-hidden transition-all duration-200 shadow-soft',
                    isOpen ? 'border-brand-200 shadow-medium' : 'border-border-default'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-text-primary hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                  >
                    <span className="text-base">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-text-tertiary transition-transform duration-200 shrink-0 ml-4',
                        isOpen && 'rotate-180 text-brand-600'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-text-secondary leading-relaxed animate-slide-down">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};
