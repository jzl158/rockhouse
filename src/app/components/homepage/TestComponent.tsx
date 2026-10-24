export default function TestComponent() {
  return (
    <div className="bg-gray-100 p-8 text-center">
      <h1 className="text-4xl font-bold text-[#255756] mb-4">
        FULL SERVICE LANDSCAPING & CONSTRUCTION
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Transform your outdoor space with Rockhouse ATL&apos;s landscaping and construction services. From design to installation, we bring your plan to life.
      </p>
      <div className="space-x-4">
        <a 
          href="/contact" 
          className="inline-block bg-[#255756] text-white px-6 py-3 rounded hover:bg-[#418F6D] transition-colors"
        >
          Get a Quote
        </a>
        <a 
          href="/portfolio" 
          className="inline-block border border-[#255756] text-[#255756] px-6 py-3 rounded hover:bg-[#255756] hover:text-white transition-colors"
        >
          See Our Work
        </a>
      </div>
    </div>
  );
}