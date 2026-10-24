import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Sauvage Outdoors',
  description: 'Terms of Service for Sauvage Outdoors landscaping and construction services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Sauvage Outdoors' website and services, you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Services Description</h2>
              <p className="text-gray-700 mb-4">
                Sauvage Outdoors provides landscaping, construction, and outdoor improvement services including 
                but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Landscape design and installation</li>
                <li>Hardscaping and stonework</li>
                <li>Deck and patio construction</li>
                <li>Outdoor lighting installation</li>
                <li>Maintenance and repair services</li>
                <li>Consultation and project planning</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Agreements and Quotes</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Quote Validity</h3>
              <p className="text-gray-700 mb-4">
                All quotes are valid for 30 days from the date of issue unless otherwise specified. Quotes are 
                subject to change based on material costs, site conditions, or scope modifications.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Service Agreements</h3>
              <p className="text-gray-700 mb-4">
                Work will commence only after a signed service agreement and required deposit payment. 
                All project specifications, timelines, and costs will be detailed in the service agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>A deposit of 25-50% may be required before work commences</li>
                <li>Progress payments may be required for larger projects</li>
                <li>Final payment is due upon project completion</li>
                <li>Late payments may incur additional fees</li>
                <li>We reserve the right to suspend work for non-payment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation and Changes</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Client Cancellation</h3>
              <p className="text-gray-700 mb-4">
                Clients may cancel services with 48 hours written notice. Cancellation fees may apply for 
                materials ordered or work completed.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Scope Changes</h3>
              <p className="text-gray-700 mb-4">
                Any changes to the original scope of work must be agreed upon in writing and may result in 
                additional charges and timeline adjustments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Warranties and Guarantees</h2>
              <p className="text-gray-700 mb-4">
                We provide the following warranties:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>1-year warranty on workmanship</li>
                <li>Manufacturer warranties on materials and products</li>
                <li>Plant warranties as per industry standards</li>
                <li>Seasonal conditions may affect warranty coverage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Liability and Insurance</h2>
              <p className="text-gray-700 mb-4">
                Sauvage Outdoors carries appropriate business insurance including general liability and 
                workers' compensation. Our liability is limited to the value of services provided. We are 
                not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Damage to underground utilities not properly marked</li>
                <li>Pre-existing conditions not disclosed by the client</li>
                <li>Weather-related delays or damage</li>
                <li>Damage caused by third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Site Access and Safety</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Client must provide safe and adequate access to work areas</li>
                <li>Client is responsible for marking underground utilities</li>
                <li>Work areas should be clear of personal belongings</li>
                <li>Children and pets should be kept away from active work zones</li>
                <li>We reserve the right to suspend work for unsafe conditions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Weather and Delays</h2>
              <p className="text-gray-700 mb-4">
                Project timelines may be affected by weather conditions, permit delays, material availability, 
                or unforeseen site conditions. We will communicate any delays promptly and work to minimize 
                project disruption.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Permits and Regulations</h2>
              <p className="text-gray-700 mb-4">
                Client is responsible for obtaining necessary permits unless otherwise specified in the service 
                agreement. All work will be performed in accordance with local building codes and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Privacy and Confidentiality</h2>
              <p className="text-gray-700 mb-4">
                We respect your privacy and will not share your personal information with third parties except 
                as necessary to complete your project or as required by law. See our Privacy Policy for details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these terms or our services will be resolved through binding arbitration 
                in accordance with local laws. Both parties agree to attempt good-faith negotiation before 
                pursuing legal action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modification of Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately 
                upon posting to our website. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Sauvage Outdoors</strong><br />
                  Email: sauvageoutdoors@gmail.com<br />
                  Phone: (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}