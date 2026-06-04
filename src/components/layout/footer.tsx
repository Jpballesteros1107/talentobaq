import Link from "next/link";
import { Zap, Mail, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaFacebook, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>

              <span className="text-xl font-extrabold tracking-tight text-white">
                TalentoBAQ
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Conectamos a los jóvenes de Barranquilla con las mejores
              oportunidades deportivas y culturales de la ciudad. Descubre tu
              pasión, desarrolla tu talento.
            </p>

            <div className="mt-5 flex items-center gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <FaFacebook className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="X"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Plataforma
            </h3>

            <ul className="space-y-2">
              {[
                {
                  href: "/explore",
                  label: "Explorar instituciones",
                },
                {
                  href: "/explore?type=sport",
                  label: "Deportes",
                },
                {
                  href: "/explore?type=culture",
                  label: "Cultura",
                },
                {
                  href: "/auth/register",
                  label: "Registrar institución",
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Contacto
            </h3>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                Barranquilla, Atlántico, Colombia
              </li>

              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                hola@talentobaq.co
              </li>

              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +57 300 000 0000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TalentoBAQ. Todos los derechos
            reservados.
          </p>

          <p className="text-xs text-slate-500">
            Hecho con pasión en Barranquilla
          </p>
        </div>
      </div>
    </footer>
  );
}