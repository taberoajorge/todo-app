import { ArrowUpRight, Download, Linkedin, Mail } from 'lucide-react';
import { headers } from 'next/headers';

type Lang = 'en' | 'es';

const content = {
  en: {
    nav: { work: 'Work', cv: 'CV', contact: 'Contact' },
    hero: {
      kicker: 'ALEX TABEROA · SOFTWARE ENGINEER',
      intent:
        "Hi, I'm Alex. I build reliable software and I'm looking to join a strong engineering team.",
      roles: "Roles I'm looking for: Software Engineer, Full Stack, Backend, or Integrations.",
    },
    work: {
      kicker: 'OPEN WORK',
      title: 'Work you can open and review',
      items: [
        {
          title: 'LoopForge',
          type: 'OPEN SOURCE · PUBLIC RELEASE',
          description:
            'Desktop orchestrator for development cycles with code agents. The repository includes a release draft and artifacts for macOS, Linux, and Windows.',
          proof: 'Repository + release draft',
          href: 'https://github.com/taberoajorge/loopforge',
        },
        {
          title: 'Ralph',
          type: 'OPEN SOURCE · MIT',
          description:
            'Tool to run autonomous development cycles using Codex, Claude, Cursor, and Gemini.',
          proof: 'Public repository',
          href: 'https://github.com/taberoajorge/ralph',
        },
        {
          title: 'Audio Cleaner',
          type: 'OPEN SOURCE DEMO',
          description:
            'Audio cleaning product with a web app and GPU worker. Refactored into a public auth-free demo that anyone can run locally.',
          proof: 'Public repository',
          href: 'https://github.com/taberoajorge/audio-cleaner-oss',
        },
      ],
      action: 'Review evidence',
    },
    cv: {
      kicker: 'RESUME',
      title: 'Curriculum Vitae',
      description: 'You can download my CV to see my full experience, tech stack, and background.',
      action: 'Download CV',
    },
    contact: {
      kicker: 'NEXT STEP',
      title: "Let's talk",
      description:
        'Feel free to reach out if you have an open role. You can review my public code and CV before contacting me.',
      email: 'Email me',
      linkedin: 'View LinkedIn',
    },
    footer: 'English · Español',
  },
  es: {
    nav: { work: 'Trabajo', cv: 'CV', contact: 'Contacto' },
    hero: {
      kicker: 'ALEX TABEROA · SOFTWARE ENGINEER',
      intent:
        'Hola, soy Alex. Creo software confiable y busco unirme a un gran equipo de ingeniería.',
      roles: 'Roles que busco: Software Engineer, Full Stack, Backend o Integrations.',
    },
    work: {
      kicker: 'TRABAJO PÚBLICO',
      title: 'Trabajo que puedes abrir y revisar',
      items: [
        {
          title: 'LoopForge',
          type: 'OPEN SOURCE · PUBLIC RELEASE',
          description:
            'Orquestador de escritorio para ciclos de desarrollo con agentes de código. El repositorio incluye una release draft y artefactos para macOS, Linux y Windows.',
          proof: 'Repositorio + release draft',
          href: 'https://github.com/taberoajorge/loopforge',
        },
        {
          title: 'Ralph',
          type: 'OPEN SOURCE · MIT',
          description:
            'Herramienta para ejecutar ciclos autónomos de desarrollo con Codex, Claude, Cursor y Gemini.',
          proof: 'Repositorio público',
          href: 'https://github.com/taberoajorge/ralph',
        },
        {
          title: 'Audio Cleaner',
          type: 'OPEN SOURCE DEMO',
          description:
            'Producto para limpiar audio con una aplicación web y un worker GPU. Refactorizado a un demo público sin autenticación que cualquiera puede clonar y ejecutar.',
          proof: 'Repositorio público',
          href: 'https://github.com/taberoajorge/audio-cleaner-oss',
        },
      ],
      action: 'Revisar evidencia',
    },
    cv: {
      kicker: 'CURRÍCULUM',
      title: 'Descarga mi CV',
      description:
        'Puedes descargar mi CV para ver mi experiencia completa, stack tecnológico y trayectoria.',
      action: 'Descargar CV',
    },
    contact: {
      kicker: 'SIGUIENTE PASO',
      title: 'Hablemos',
      description:
        'Escríbeme si tienes un rol abierto. Puedes revisar mi código público y mi CV antes de contactarme.',
      email: 'Escribir por email',
      linkedin: 'Ver LinkedIn',
    },
    footer: 'Español · English',
  },
};

export default async function HomePage() {
  const acceptLanguage = (await headers()).get('accept-language') || '';
  const lang: Lang = acceptLanguage.toLowerCase().startsWith('es') ? 'es' : 'en';
  const t = content[lang];

  return (
    <main className="p-4 md:p-8 antialiased">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hero / Intro */}
        <div className="bento-card col-span-1 md:col-span-2 p-8 md:p-12 flex flex-col justify-center">
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold mb-6">
            AT
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
            {t.hero.intent}
          </h1>
          <p className="text-gray-500 text-lg">{t.hero.roles}</p>
        </div>

        {/* Contact & CV Bento */}
        <div className="bento-card col-span-1 p-8 flex flex-col justify-between bg-gray-900 text-white">
          <div>
            <h2 className="text-xl font-medium mb-2">{t.contact.title}</h2>
            <p className="text-gray-400 text-sm mb-8">{t.contact.description}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="/alex-taberoa-cv.pdf"
              download
              className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3 px-4 rounded-xl text-center font-medium hover:bg-gray-100 transition-colors"
            >
              {t.cv.action} <Download size={16} aria-hidden="true" />
            </a>
            <a
              href="mailto:job@taberoa.simplelogin.com"
              className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 px-4 rounded-xl text-center font-medium hover:bg-white/20 transition-colors"
            >
              {t.contact.email} <Mail size={16} aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/taberoajorge"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 px-4 rounded-xl text-center font-medium hover:bg-white/20 transition-colors"
            >
              {t.contact.linkedin} <Linkedin size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Projects Header */}
        <div className="col-span-1 md:col-span-3 mt-4 mb-2 flex justify-between items-end px-2">
          <h2 className="text-xl font-semibold">{t.work.title}</h2>
          <span className="text-sm text-gray-400 font-medium">{t.footer}</span>
        </div>

        {/* Project Cards */}
        {t.work.items.map((item, index) => (
          <div className="bento-card col-span-1 p-8 flex flex-col" key={item.title}>
            <div
              className={`text-xs font-semibold tracking-wider uppercase mb-3 ${index === 0 ? 'text-indigo-500' : index === 1 ? 'text-emerald-500' : 'text-orange-500'}`}
            >
              {item.type}
            </div>
            <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed flex-grow">
              {item.description}
            </p>
            <div className="mt-auto">
              <p className="text-xs text-gray-400 mb-2">{item.proof}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center text-sm font-medium text-gray-900 transition-colors ${index === 0 ? 'hover:text-indigo-600' : index === 1 ? 'hover:text-emerald-600' : 'hover:text-orange-600'}`}
              >
                {t.work.action} <ArrowUpRight size={15} className="ml-1" aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
