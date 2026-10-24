"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import type { Service } from "@/types/service";

type ImageUploadResult = {
    path: string;
    url: string;
    type: string;
    originalName: string;
};

type ContactFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    inquiryType: 'quote' | 'question';
    subject?: string;
    message: string;
    // Quote specific fields
    serviceType?: string;
    customerAddress?: string;
    projectStartDate?: string;
    estimatedDuration?: string;
    serviceDescription?: string;
    images?: ImageUploadResult[];
};

export default function ContactPage() {
    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inquiryType, setInquiryType] = useState<'question' | 'quote'>('question');
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    // Handle URL parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const serviceId = params.get('serviceId');
        
        if (type === 'quote') {
            setInquiryType('quote');
        }

        if (serviceId) {
            setSelectedServiceId(serviceId);
        }
    }, []);

    // Fetch services
    useEffect(() => {
        let mounted = true;
        async function fetchServices() {
            try {
                const { data, error } = await supabase
                    .from('service')
                    .select('*')
                    .order('name');
                
                if (!mounted) return;
                if (error) throw error;
                setServices(data || []);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError('Failed to load services. Please try again later.');
            } finally {
                if (mounted) {
                    setIsLoadingServices(false);
                }
            }
        }

        fetchServices();
        return () => {
            mounted = false;
        };
    }, [supabase]);

    useEffect(() => {
        async function fetchServices() {
            try {
                const { data, error } = await supabase
                    .from('service')
                    .select('*')
                    .order('name');
                
                if (error) throw error;
                setServices(data || []);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError('Failed to load services. Please try again later.');
            } finally {
                setIsLoadingServices(false);
            }
        }

        fetchServices();
    }, [supabase]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const form = event.currentTarget;
        const formData = new FormData(form);
        const inquiryType = formData.get("inquiryType") as 'quote' | 'question';
        
        const firstName = String(formData.get("firstName") || "");
        const lastName = String(formData.get("lastName") || "");
        const email = String(formData.get("email") || "");
        const message = String(formData.get("message") || "");

        // Validate required fields
        if (!firstName || !lastName || !email || !message) {
            setError("Please fill in all required fields: First Name, Last Name, Email, and Message are required.");
            setIsSubmitting(false);
            return;
        }
        
        const payload: ContactFormData = {
            firstName,
            lastName,
            email,
            phone: String(formData.get("phone") || ""),
            inquiryType,
            message,
        };

        // Add quote-specific fields if this is a quote request
        if (inquiryType === 'quote') {
            payload.serviceType = String(formData.get("serviceType") || "");
            payload.customerAddress = String(formData.get("customerAddress") || "");
            payload.projectStartDate = String(formData.get("projectStartDate") || "");
            payload.estimatedDuration = String(formData.get("estimatedDuration") || "");
            payload.serviceDescription = payload.message;

            // Validate required quote fields
            if (!payload.serviceType) {
                setError("Please select a service type");
                setIsSubmitting(false);
                return;
            }
        }

        try {
            // If this is a quote with images, we need to upload them first
            let imageUrls: string[] = [];
            if (inquiryType === 'quote' && selectedFiles.length > 0) {
                const timestamp = new Date().getTime();
                const uploadPromises = selectedFiles.map(async (file, index) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${timestamp}-${index}.${fileExt}`;
                    // Upload to media bucket with metadata
                    const { data, error } = await supabase.storage
                        .from('media')
                        .upload(`customer-quotes/${fileName}`, file, {
                            metadata: {
                                type: 'customer_quote',
                                contentType: file.type,
                                originalName: file.name,
                                uploadDate: new Date().toISOString()
                            }
                        });
                    
                    if (error) throw error;
                    
                    // Get the public URL for the uploaded file
                    const { data: { publicUrl } } = supabase.storage
                        .from('media')
                        .getPublicUrl(data.path);
                    
                    return {
                        path: data.path,
                        url: publicUrl,
                        type: 'customer_quote',
                        originalName: file.name
                    };
                });

                imageUrls = await Promise.all(uploadPromises);
            }

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    images: imageUrls
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error('Server error response:', data); // Log the full error response
                
                let errorMessage = data?.error || "Failed to send your message.";
                if (data?.details) {
                    if (typeof data.details === 'object') {
                        errorMessage += "\nDetails: " + Object.entries(data.details)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ');
                    } else {
                        errorMessage += "\nDetails: " + data.details;
                    }
                }
                throw new Error(errorMessage);
            }

            setIsSubmitted(true);
            form.reset();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Something went wrong.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen">
            {/* Header Section */}
            <section className="pb-4 pt-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div>
                        <h1 className="text-4xl font-bold uppercase text-[#255756] inline-block border-b-4 border-[#F7D566] pb-2">
                            Contact Us
                        </h1>
                    </div>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl">
                        Have a question or need a quote? Send us a message and our team will get back to you promptly.
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="pt-8 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <header>
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Get Started</h2>
                            <p className="mt-3 text-gray-600">
                                Choose your inquiry type and provide the details we need to help you.
                            </p>
                        </div>

                <div className="mt-6 bg-[#205A57]/5 rounded-lg p-8 border border-[#205A57]/10">
                    <h2 className="text-lg font-semibold text-[#205A57] mb-6 text-center">How to Get Started:</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#205A57] text-white flex items-center justify-center text-sm">
                                1
                            </div>
                            <p className="text-gray-700">
                                <span className="font-medium">Select your inquiry type</span> - Choose between requesting a quote or asking a general question.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#205A57] text-white flex items-center justify-center text-sm">
                                2
                            </div>
                            <p className="text-gray-700">
                                <span className="font-medium">For quotes:</span> Include project details, location, and timeline. Adding photos helps us provide more accurate estimates.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#205A57] text-white flex items-center justify-center text-sm">
                                3
                            </div>
                            <p className="text-gray-700">
                                <span className="font-medium">Response time:</span> We typically respond within 24-48 hours on business days. For urgent matters, please call us directly.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#205A57] text-white flex items-center justify-center text-sm">
                                4
                            </div>
                            <p className="text-gray-700">
                                <span className="font-medium">Next steps:</span> After submission, our team will review your request and contact you to discuss details or schedule a consultation.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-5">
                <div className="md:col-span-3">
                    <form onSubmit={handleSubmit} className="rounded-md border border-gray-200 bg-white p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    minLength={2}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    minLength={2}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    placeholder="Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    placeholder="(555) 555-5555"
                                />
                            </div>
                            <div>
                                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700">Inquiry Type</label>
                                <select
                                    id="inquiryType"
                                    name="inquiryType"
                                    required
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    value={inquiryType}
                                    onChange={(e) => setInquiryType(e.target.value as 'quote' | 'question')}
                                >
                                    <option value="question">General Question</option>
                                    <option value="quote">Request Quote</option>
                                </select>
                            </div>
                        </div>

                        {/* Quote specific fields */}
                        {inquiryType === 'quote' && (
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
                                <select
                                    id="serviceType"
                                    name="serviceType"
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    disabled={isLoadingServices}
                                    value={selectedServiceId || ''}
                                    onChange={(e) => setSelectedServiceId(e.target.value || null)}
                                >
                                    <option value="">Select a service</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingServices && (
                                    <p className="mt-1 text-sm text-gray-500">Loading services...</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Project Address</label>
                                <input
                                    id="customerAddress"
                                    name="customerAddress"
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    placeholder="123 Main St, City, State"
                                />
                            </div>
                            <div>
                                <label htmlFor="projectStartDate" className="block text-sm font-medium text-gray-700">Preferred Start Date</label>
                                <input
                                    id="projectStartDate"
                                    name="projectStartDate"
                                    type="date"
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700">Estimated Project Duration</label>
                                <input
                                    id="estimatedDuration"
                                    name="estimatedDuration"
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                    placeholder="e.g., 2 weeks, 1 month"
                                />
                            </div>
                            
                            {/* Image Upload */}
                            <div className="col-span-full mt-4">
                                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                    Project Images (optional)
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="file"
                                        id="images"
                                        name="images"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setSelectedFiles(files);
                                        }}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-gray-900 file:text-white
                                            hover:file:bg-gray-800
                                            file:cursor-pointer"
                                    />
                                </div>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Selected {selectedFiles.length} file(s)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}

                        <div className="mt-4">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Project Details</label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                minLength={10}
                                rows={6}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
                                placeholder="Please describe your project in detail, including any specific requirements or concerns."
                            />
                        </div>

                        {error ? (
                            <p className="mt-4 text-sm text-red-600">{error}</p>
                        ) : null}

                        {isSubmitted ? (
                            <p className="mt-4 text-sm text-green-700">Thanks! Your message has been sent. We’ll be in touch soon.</p>
                        ) : null}

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center rounded-md bg-[#255756] px-4 py-2 text-white hover:bg-[#418F6D] disabled:opacity-60"
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </div>
                    </form>
                </div>

                <aside className="md:col-span-2">
                    <div className="rounded-md border border-gray-200 bg-white p-6">
                        <div className="flex justify-center mb-6">
                            <img 
                                src="/rockhouse-icon.png" 
                                alt="Rockhouse Icon" 
                                className="h-24 w-24"
                            />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Prefer to talk?</h2>
                        <p className="mt-2 text-gray-600">We’re happy to discuss your project and provide guidance.</p>
                        <div className="mt-4 space-y-2 text-sm text-gray-700">
                            <p><span className="font-medium">Email:</span> sauvageoutdoors@gmail.com</p>
                            <p><span className="font-medium">Phone:</span> (470) 707-7689</p>
                            <p><span className="font-medium">Location:</span> Atlanta, GA</p>
                            <p><span className="font-medium">Hours:</span> Sunday - Saturday: 6AM - 7PM</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 space-y-3">
                            <Link 
                                href="/signup"
                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#205A57] rounded-md hover:bg-[#3B8D6D] transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Create an Account
                            </Link>

                            <Link 
                                href="/portfolio"
                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-[#205A57] bg-white border-2 border-[#205A57] rounded-md hover:bg-[#205A57] hover:text-white transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                View Our Portfolio
                            </Link>

                            <Link 
                                href="/services"
                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-[#205A57] bg-white border-2 border-[#205A57] rounded-md hover:bg-[#205A57] hover:text-white transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Explore Our Services
                            </Link>

                            <div className="flex justify-center space-x-4 pt-2">
                                <a 
                                    href="#" 
                                    className="p-2 text-[#205A57] hover:text-[#3B8D6D] transition-colors duration-200"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                    </svg>
                                </a>
                                <a 
                                    href="#" 
                                    className="p-2 text-[#205A57] hover:text-[#3B8D6D] transition-colors duration-200"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a 
                                    href="#" 
                                    className="p-2 text-[#205A57] hover:text-[#3B8D6D] transition-colors duration-200"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
                </div>
            </section>
        </main>
    );
}
