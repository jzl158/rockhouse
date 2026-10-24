"use client";
import Image from "next/image";
import { Link, Divider } from "@heroui/react";
import { menuLinks } from "@/data/menuLinks";

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1 */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Sauvage Outdoors</h3>
          {/* Logo placeholder */}
          <div className="flex justify-center">
            <Image
              src="/rockhouse-icon.png"
              alt="Sauvage Outdoors Logo"
              width={150}
              height={50}
              className="object-contain"
              style={{ height: "auto" }}
            />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Landscaping and Construction Services
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Quick Links</h3>
          <ul className="space-y-2 text-sm text-center">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Contact</h3>
          <p className="text-gray-600 text-sm text-center">Atlanta, GA</p>
          <p className="text-gray-600 text-sm text-center">(470) 707-7689</p>
          <p className="text-gray-600 text-sm text-center">sauvageoutdoors@gmail.com</p>
          <p className="text-gray-600 text-sm text-center">Sunday - Saturday: 6AM - 7PM</p>
        </div>
      </div>

      <Divider className="my-4" />

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="mb-2 md:mb-0">
            © {new Date().getFullYear()} Sauvage Outdoors. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-700">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-500 hover:text-gray-700">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
