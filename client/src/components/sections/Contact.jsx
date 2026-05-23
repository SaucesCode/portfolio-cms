import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Reusable input field component so we don't repeat styling
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-400">{label}</label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update one field at a time
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Client-side validation before hitting the API
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!form.body.trim()) newErrors.body = "Message is required";
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate first — don't hit the API if form is invalid
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/contact", form);

      toast.success("Message sent! I'll get back to you soon.");

      // Reset form after success
      setForm({ name: "", email: "", subject: "", body: "" });
    } catch (error) {
      // Show specific error from server if available
      const message = error.response?.data?.error || "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared input classes — reused for all text inputs
  const inputClass = `
    w-full px-4 py-2.5 rounded-lg text-sm
    bg-gray-900 border border-white/10
    text-white placeholder:text-gray-600
    focus:outline-none focus:border-blue-500/50 focus:bg-gray-800
    transition-all duration-200
  `;

  return (
    <section id="contact" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p className="text-blue-400 text-sm font-mono tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact Me</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Have a project in mind or just want to say hi? I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Left — contact info */}
          <motion.div
            className="flex flex-col gap-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-white font-semibold mb-2">Let's work together</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                I'm currently available for freelance work and full-time positions. If you have
                a project that needs some creative work, I'm your guy.
              </p>
            </div>

            {/* Contact links */}
            <div className="flex flex-col gap-4">
              <a
                href="mailto:your@email.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2.5 rounded-lg bg-gray-900 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Mail size={16} className="text-blue-400" />
                </div>
                <span className="text-sm">your@email.com</span>
              </a>
              <a
                href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2.5 rounded-lg bg-gray-900 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <FaGithub size={16} className="text-blue-400" />
                </div>
                <span className="text-sm">
                  github.com/{import.meta.env.VITE_GITHUB_USERNAME}
                </span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2.5 rounded-lg bg-gray-900 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <FaLinkedin size={16} className="text-blue-400" />
                </div>
                <span className="text-sm">linkedin.com/in/yourprofile</span>
              </a>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {/* Name + Email side by side */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" error={errors.name}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Juan dela Cruz"
                  className={inputClass}
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@email.com"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Subject (optional)">
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Project inquiry"
                className={inputClass}
              />
            </Field>

            <Field label="Message" error={errors.body}>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder="Tell me about your project..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Message
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
