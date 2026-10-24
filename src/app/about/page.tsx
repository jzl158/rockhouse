import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="min-h-screen">
            {/* Header Section */}
            <section className="pb-4 pt-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div>
                        <h1 className="text-4xl font-bold uppercase text-[#255756] inline-block border-b-4 border-[#F7D566] pb-2">
                            About Us
                        </h1>
                    </div>
                    <p className="mt-4 text-lg text-gray-600">
                        We help homeowners and businesses keep their properties in top shape—on time, on budget, and with clear communication at every step. From small fixes to larger projects, our team is built around craftsmanship, safety, and doing the job right the first time.
                    </p>
                </div>
            </section>

            {/* About Content */}
            <section className="pt-8 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    {/* Our Mission */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                        <div className="relative bg-white flex items-center justify-center p-8">
                            <img 
                                src="/rockhouse-icon.png"
                                alt="Rockhouse Icon"
                                className="max-w-[200px] h-auto object-contain"
                            />
                        </div>
                        <div className="flex items-center justify-center p-12 bg-[#255756]">
                            <div className="max-w-md">
                                <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                                <p className="text-white/90 leading-relaxed text-lg">
                                    To deliver reliable, high-quality service that protects your investment and gives you
                                    peace of mind. We believe in honest advice, dependable timelines, and clean, professional
                                    work—from the first quote to the final walkthrough.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Our Story */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                        <div className="flex items-center justify-center p-12 bg-[#F7D566]">
                            <div className="max-w-md">
                                <h2 className="text-3xl font-bold text-[#255756] mb-6">Our Story</h2>
                                <p className="text-[#255756]/80 leading-relaxed text-lg">
                                    We started with a simple promise: treat every property like it&apos;s our own. Today, that
                                    promise guides a skilled team serving homeowners, builders, and local businesses across
                                    the region. Most of our work comes from referrals—earned by showing up, communicating
                                    clearly, and standing behind what we build.
                                </p>
                            </div>
                        </div>
                        <div className="relative bg-cover bg-center bg-no-repeat" style={{
                            backgroundImage: "url(/construction3.jpg)"
                        }}>
                            <div className="absolute inset-0 bg-black/30"></div>
                        </div>
                    </section>

                    {/* Core Values */}
                    <section className="py-12 bg-gray-50 rounded-lg">
                        <div className="px-6">
                            <h2 className="text-2xl font-semibold tracking-tight text-[#255756]">What We Stand For</h2>
                            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-medium text-[#255756]">Craftsmanship</h3>
                                    <p className="mt-2 text-gray-600">Attention to detail, quality materials, and work that lasts.</p>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-medium text-[#255756]">Integrity</h3>
                                    <p className="mt-2 text-gray-600">Transparent pricing, clear scopes, and no surprises.</p>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-medium text-[#255756]">Safety</h3>
                                    <p className="mt-2 text-gray-600">Licensed, insured, and committed to safe job sites.</p>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-medium text-[#255756]">Reliability</h3>
                                    <p className="mt-2 text-gray-600">We show up when we say we will and finish on schedule.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section className="py-12">
                        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-[#255756]">Why Customers Choose Us</h2>
                                <ul className="mt-4 space-y-3 text-gray-700">
                                    <li className="flex gap-3"><span className="text-[#418F6D]">✓</span><span>Clear, itemized estimates and scopes</span></li>
                                    <li className="flex gap-3"><span className="text-[#418F6D]">✓</span><span>Respect for your time, property, and budget</span></li>
                                    <li className="flex gap-3"><span className="text-[#418F6D]">✓</span><span>Experienced team and vetted trade partners</span></li>
                                    <li className="flex gap-3"><span className="text-[#418F6D]">✓</span><span>Clean job sites and quality control at every step</span></li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-[#255756]">Service Area</h2>
                                <p className="mt-4 text-gray-600 leading-relaxed">
                                    We proudly serve the <strong>Atlanta metro area</strong>, providing reliable landscaping and construction 
                                    services to homeowners and businesses throughout the region. If you&apos;re
                                    unsure whether we cover your specific location, reach out—our team is happy to help.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href="/services" className="inline-flex items-center rounded-md bg-[#255756] px-4 py-2 text-white hover:bg-[#418F6D] transition-colors duration-200">
                                        View Services
                                    </Link>
                                    <Link href="/contact" className="inline-flex items-center rounded-md border border-[#255756] px-4 py-2 text-[#255756] hover:bg-[#255756] hover:text-white transition-colors duration-200">
                                        Ask About Your Area
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
