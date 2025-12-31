"use client"
import Image from "next/image";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  ClipboardList, 
  Clock, 
  Shield, 
  Zap, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  Star,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profiles, enrollment tracking, and parent communication tools",
      color: "bg-pink-500",
      lightBg: "bg-pink-50"
    },
    {
      icon: GraduationCap,
      title: "Teacher Management",
      description: "Manage teaching staff, assign classes, track performance and schedules efficiently",
      color: "bg-purple-500",
      lightBg: "bg-purple-50"
    },
    {
      icon: ClipboardList,
      title: "Class Organization",
      description: "Create and manage classes, sections, and student groups with ease",
      color: "bg-orange-500",
      lightBg: "bg-orange-50"
    },
    {
      icon: Calendar,
      title: "Attendance Tracking",
      description: "Real-time attendance monitoring with automated reports and notifications",
      color: "bg-cyan-500",
      lightBg: "bg-cyan-50"
    },
    {
      icon: DollarSign,
      title: "Fee Management",
      description: "Streamlined fee collection, payment tracking, and financial reporting",
      color: "bg-green-500",
      lightBg: "bg-green-50"
    },
    {
      icon: Clock,
      title: "Timetable Scheduling",
      description: "Create and manage timetables, class schedules, and event planning",
      color: "bg-blue-500",
      lightBg: "bg-blue-50"
    }
  ];

  const benefits = [
    "Reduce administrative workload by 60%",
    "Improve parent-teacher communication",
    "Real-time data access from anywhere",
    "Automated report generation",
    "Secure data management",
    "Mobile-friendly interface"
  ];

  const stats = [
    { number: "500+", label: "Schools Trust Us" },
    { number: "50K+", label: "Students Managed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Support Available" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Principal, Little Stars Academy",
      content: "Pre-Primary ERP has transformed how we manage our school. The intuitive interface makes it easy for all staff members to use.",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Administrator, Sunshine Kindergarten",
      content: "The attendance and fee management features have saved us countless hours. Parent feedback has been overwhelmingly positive.",
      rating: 5
    },
    {
      name: "Anjali Patel",
      role: "Director, Growing Minds School",
      content: "Excellent support team and regular updates. This system grows with our needs and handles everything we require.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹4,999",
      period: "per month",
      description: "Perfect for small preschools",
      features: [
        "Up to 100 students",
        "Basic student management",
        "Attendance tracking",
        "Fee management",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "₹9,999",
      period: "per month",
      description: "Most popular for growing schools",
      features: [
        "Up to 500 students",
        "All Starter features",
        "Teacher management",
        "Advanced reporting",
        "Parent portal",
        "Priority support",
        "Custom timetables",
        "SMS notifications"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large institutions",
      features: [
        "Unlimited students",
        "All Professional features",
        "Multi-branch support",
        "Custom integrations",
        "Dedicated account manager",
        "On-premise deployment",
        "Training sessions",
        "24/7 phone support"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pre-Primary ERP</h1>
                <p className="text-xs text-gray-500">School Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
                <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 mb-6">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Trusted by 500+ schools</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Complete School Management System for Pre-Primary Education
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your preschool operations with our comprehensive ERP system. Manage students, teachers, attendance, fees, and more from one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-lg font-medium">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-900 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-lg font-medium">
                  Watch Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  14-day free trial
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <Image
                  src="/dashboard.png"
                  alt="Pre-Primary ERP Dashboard"
                  width={800}
                  height={600}
                  className="rounded-lg"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-orange-500 text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm">Uptime</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-purple-500 text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm">Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your School
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive ERP system includes all the features you need to run your pre-primary school efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Schools Choose Pre-Primary ERP
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of schools that have transformed their operations with our intelligent management system
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <button className="mt-8 px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-lg font-medium">
                Learn More
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                <Shield className="w-10 h-10 text-pink-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">Bank-level security with daily backups</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mt-8">
                <Zap className="w-10 h-10 text-purple-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Optimized for speed and performance</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <BarChart3 className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Analytics</h3>
                <p className="text-gray-600">Data-driven insights and reports</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-200 mt-8">
                <Users className="w-10 h-10 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">Intuitive interface for everyone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by School Administrators
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about Pre-Primary ERP
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your school's needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-xl p-8 border-2 ${
                  plan.popular 
                    ? 'border-orange-500 bg-orange-50 relative' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <button className={`w-full py-3 rounded-lg font-medium transition-colors mb-8 ${
                  plan.popular
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  Get Started
                </button>
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of schools using Pre-Primary ERP to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-transparent text-white rounded-lg border-2 border-white hover:bg-white/10 transition-colors text-lg font-medium">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your school name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about your requirements"
                  />
                </div>
                <button className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Send Message
                </button>
              </form>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="text-gray-900">info@preprimaryerp.com</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                    <div className="text-gray-900">+91 98765 43210</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Address</div>
                    <div className="text-gray-900">Mumbai, Maharashtra, India</div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our support team is available 24/7 to assist you with any questions
                </p>
                <button className="text-orange-600 font-medium flex items-center gap-2">
                  Visit Help Center
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Pre-Primary ERP</h3>
                  <p className="text-xs text-gray-400">School Management</p>
                </div>
              </div>
              <p className="text-gray-400">
                Complete school management solution for pre-primary education
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Pre-Primary ERP. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}