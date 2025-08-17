'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users, Stethoscope, MessageCircle, Star, Phone, Mail, MapPin, Shield, Award, Heart, Activity, CheckCircle, Quote, ArrowRight, Zap, Users2, Globe } from 'lucide-react'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80 // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
    setIsMenuOpen(false) // Close mobile menu
  }

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      experience: "15 years",
      rating: 4.9,
      image: "/placeholder-lnkb2.png",
      education: "Harvard Medical School",
      certifications: "Board Certified Cardiologist"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      experience: "12 years",
      rating: 4.8,
      image: "/male-neurologist.png",
      education: "Johns Hopkins University",
      certifications: "Board Certified Neurologist"
    },
    {
      id: 3,
      name: "Dr. Emily Davis",
      specialty: "Pediatrician",
      experience: "10 years",
      rating: 4.9,
      image: "/placeholder-fu1h9.png",
      education: "Stanford Medical School",
      certifications: "Board Certified Pediatrician"
    },
    {
      id: 4,
      name: "Dr. Robert Wilson",
      specialty: "Orthopedic Surgeon",
      experience: "18 years",
      rating: 4.9,
      image: "/placeholder.svg?height=300&width=300&text=Dr.+Wilson",
      education: "Mayo Clinic",
      certifications: "Board Certified Orthopedic Surgeon"
    },
    {
      id: 5,
      name: "Dr. Lisa Martinez",
      specialty: "Dermatologist",
      experience: "8 years",
      rating: 4.8,
      image: "/placeholder.svg?height=300&width=300&text=Dr.+Martinez",
      education: "UCLA Medical School",
      certifications: "Board Certified Dermatologist"
    },
    {
      id: 6,
      name: "Dr. James Thompson",
      specialty: "General Practitioner",
      experience: "20 years",
      rating: 4.9,
      image: "/placeholder.svg?height=300&width=300&text=Dr.+Thompson",
      education: "University of Michigan",
      certifications: "Board Certified Family Medicine"
    }
  ]

  const services = [
    {
      icon: <Stethoscope className="h-8 w-8 text-emerald-600" />,
      title: "General Consultation",
      description: "Comprehensive health checkups and consultations with experienced physicians"
    },
    {
      icon: <Calendar className="h-8 w-8 text-emerald-600" />,
      title: "Easy Scheduling",
      description: "Book appointments online or through our AI assistant 24/7"
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      title: "Specialist Care",
      description: "Access to specialized medical professionals across multiple disciplines"
    },
    {
      icon: <Clock className="h-8 w-8 text-emerald-600" />,
      title: "24/7 Support",
      description: "Round-the-clock medical assistance and emergency support"
    },
    {
      icon: <Heart className="h-8 w-8 text-emerald-600" />,
      title: "Cardiology",
      description: "Advanced cardiac care and heart health monitoring"
    },
    {
      icon: <Activity className="h-8 w-8 text-emerald-600" />,
      title: "Diagnostic Services",
      description: "State-of-the-art diagnostic equipment and laboratory services"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Patient",
      content: "The AI assistant made booking my appointment so easy! The doctors are incredibly professional and caring.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60&text=SM"
    },
    {
      name: "John Rodriguez",
      role: "Patient",
      content: "Excellent service and modern facilities. Dr. Johnson helped me with my heart condition expertly.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60&text=JR"
    },
    {
      name: "Maria Garcia",
      role: "Patient",
      content: "The pediatric care for my children has been outstanding. Highly recommend Meera Clinic!",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60&text=MG"
    }
  ]

  const whyChooseUs = [
    {
      icon: <Award className="h-12 w-12 text-emerald-600" />,
      title: "Award-Winning Care",
      description: "Recognized for excellence in patient care and medical innovation"
    },
    {
      icon: <Shield className="h-12 w-12 text-emerald-600" />,
      title: "Advanced Technology",
      description: "State-of-the-art medical equipment and AI-powered assistance"
    },
    {
      icon: <Users2 className="h-12 w-12 text-emerald-600" />,
      title: "Expert Team",
      description: "Board-certified physicians with years of specialized experience"
    },
    {
      icon: <Globe className="h-12 w-12 text-emerald-600" />,
      title: "Comprehensive Care",
      description: "Full spectrum of medical services under one roof"
    }
  ]

  const healthTips = [
    {
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily for optimal health",
      icon: <Activity className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Regular Exercise",
      description: "30 minutes of moderate exercise 5 times a week",
      icon: <Heart className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Balanced Diet",
      description: "Include fruits, vegetables, and whole grains in your meals",
      icon: <Stethoscope className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Quality Sleep",
      description: "Get 7-9 hours of quality sleep every night",
      icon: <Clock className="h-6 w-6 text-emerald-600" />
    }
  ]

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can book appointments through our AI chatbot, call us directly, or use our online booking system."
    },
    {
      question: "Do you accept insurance?",
      answer: "Yes, we accept most major insurance plans. Please contact us to verify your specific coverage."
    },
    {
      question: "What are your emergency procedures?",
      answer: "For life-threatening emergencies, call 911. For urgent care, contact our 24/7 hotline at (555) 123-4567."
    },
    {
      question: "Can I get my test results online?",
      answer: "Yes, test results are available through our secure patient portal within 24-48 hours."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
              <img src="/logo.png" alt="meera clinic logo" className=' h-16 w-20' />
                <h1 className="text-2xl font-bold text-emerald-600">Meera Clinic</h1>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button onClick={() => scrollToSection('home')} className="text-gray-900 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Home</button>
                <button onClick={() => scrollToSection('services')} className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Services</button>
                <button onClick={() => scrollToSection('doctors')} className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Doctors</button>
                <button onClick={() => scrollToSection('about')} className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">About</button>
                <button onClick={() => scrollToSection('contact')} className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Contact</button>
                {/* <Link href="/doctor/login">
                  <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">Doctor Login</Button>
                </Link> */}
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button onClick={() => scrollToSection('home')} className="text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Home</button>
              <button onClick={() => scrollToSection('services')} className="text-gray-500 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Services</button>
              <button onClick={() => scrollToSection('doctors')} className="text-gray-500 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Doctors</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-500 block px-3 py-2 rounded-md text-base font-medium w-full text-left">About</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-500 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Contact</button>
              <Link href="/doctor/login" className="block px-3 py-2">
                <Button variant="outline" size="sm" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">Doctor Login</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-emerald-50 to-teal-100 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience world-class healthcare with our team of expert doctors and cutting-edge technology. Book appointments easily with our AI assistant and get the care you deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat with AI Assistant
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white" onClick={() => scrollToSection('doctors')}>
                  <Users className="mr-2 h-5 w-5" />
                  View Our Doctors
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">15+</div>
                  <div className="text-sm text-gray-600">Expert Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">10k+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/modern-medical-clinic.png" 
                alt="Meera Clinic" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Meera Clinic?</h2>
            <p className="text-xl text-gray-600">Excellence in healthcare with a personal touch</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-emerald-100">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive healthcare solutions for you and your family</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Emergency Services */}
          <div className="mt-16 bg-red-50 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Services</h3>
            <p className="text-gray-600 mb-6">24/7 emergency care available. For life-threatening emergencies, call 911.</p>
            <Button className="bg-red-600 hover:bg-red-700">
              <Phone className="mr-2 h-4 w-4" />
              Emergency Hotline: (555) 911-HELP
            </Button>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Doctors</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to your health and wellbeing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1">
                  <img 
                    src={doctor.image || "/placeholder.svg"} 
                    alt={doctor.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{doctor.name}</h3>
                  <p className="text-emerald-600 font-medium mb-2">{doctor.specialty}</p>
                  <p className="text-gray-600 mb-2">{doctor.experience} experience</p>
                  <p className="text-sm text-gray-500 mb-2">{doctor.education}</p>
                  <p className="text-sm text-gray-500 mb-3">{doctor.certifications}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-900 font-medium">{doctor.rating}</span>
                    </div>
                    <Link href={`/chat?doctor=${doctor.id}&name=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`}>
                      <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600">Real experiences from real patients</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-emerald-600 mb-4" />
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image || "/placeholder.svg"} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <div className="flex mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Health Tips</h2>
            <p className="text-xl text-gray-600">Simple steps for a healthier lifestyle</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthTips.map((tip, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {tip.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Meera Clinic</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2010, Meera Clinic has been at the forefront of providing exceptional healthcare services to our community. We combine traditional medical expertise with cutting-edge technology to deliver personalized care.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our mission is to make quality healthcare accessible to everyone through innovative solutions like our AI-powered appointment system and comprehensive medical services.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Board-certified physicians</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">State-of-the-art facilities</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">AI-powered patient assistance</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Comprehensive insurance coverage</span>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="/placeholder.svg?height=500&width=600&text=About+Meera+Clinic" 
                alt="About Meera Clinic" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers to common questions</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600">Get in touch with us for any inquiries or appointments</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Get In Touch</h3>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Phone className="h-8 w-8 text-emerald-600 mr-4" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Phone</h4>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                        <p className="text-sm text-gray-500">Mon-Fri 8AM-6PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="p-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Mail className="h-8 w-8 text-emerald-600 mr-4" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">info@meeraclinic.com</p>
                        <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="p-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <MapPin className="h-8 w-8 text-emerald-600 mr-4" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Address</h4>
                        <p className="text-gray-600">123 Health Street</p>
                        <p className="text-gray-600">Medical District, City 12345</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Office Hours */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Office Hours</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="p-6">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Meera Clinic</h3>
              <p className="text-gray-300 mb-4">Providing exceptional healthcare services with compassion and expertise since 2010.</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Globe className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-white">Home</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-gray-300 hover:text-white">Services</button></li>
                <li><button onClick={() => scrollToSection('doctors')} className="text-gray-300 hover:text-white">Doctors</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-white">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300">General Consultation</span></li>
                <li><span className="text-gray-300">Specialist Care</span></li>
                <li><span className="text-gray-300">Emergency Services</span></li>
                <li><span className="text-gray-300">Health Checkups</span></li>
                <li><span className="text-gray-300">Diagnostic Tests</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="text-gray-300">+1 (555) 123-4567</li>
                <li className="text-gray-300">info@meeraclinic.com</li>
                <li className="text-gray-300">123 Health Street</li>
                <li className="text-gray-300">Medical District, City 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 Meera Clinic. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <Link href="/chat">
        <Button 
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg z-40"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
