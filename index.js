import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import {
  HiUserCircle as HiOutlineUserMd,
  HiShieldCheck as HiOutlineShieldCheck,
  HiChatAlt2 as HiOutlineChatAlt2,
  HiClipboardCheck as HiOutlineClipboardCheck,
  HiCalendar as HiOutlineCalendar,
  HiVideoCamera as HiOutlineVideoCamera,
  HiDocumentText as HiOutlineDocumentText,
  HiUser as HiOutlineUser,
  HiBeaker as HiOutlineBeaker,
} from "react-icons/hi"; // Heroicons

// ---------------- LANGUAGE SWITCHER ----------------
function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = router;

  const languages = {
    en: { name: 'English' },
    hi: { name: 'हिन्दी' },
    pa: { name: 'ਪੰਜਾਬੀ' }
  };

  function changeLanguage(e) {
    const newLocale = e.target.value;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(router.pathname, router.pathname, { locale: newLocale });
  }

  return (
        <div className="relative inline-block">
      <select
        value={locale}
        onChange={changeLanguage}
        className="appearance-none px-6 py-2 pr-10 rounded-lg border-2 border-green-600 bg-white hover:bg-green-50 
                 text-green-800 text-lg font-medium cursor-pointer shadow-md transition-all duration-200 
                 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        <option value="hi" className="font-hindi">हिन्दी</option>
        <option value="pa" className="font-punjabi">ਪੰਜਾਬੀ</option>
        <option value="en">English</option>
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ---------------- MAIN PAGE ----------------
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Home() {
  const { t } = useTranslation("common");

  const cardData = [
    {
      href: "/hospital-chat",
      title: t("hospitalSupport"),
      desc: t("hospitalSupportDesc"),
      icon: <HiOutlineChatAlt2 className="w-8 h-8 text-blue-600" />,
    },
    {
      href: "/symptom-checker",
      title: t("symptomChecker"),
      desc: t("symptomCheckerDesc"),
      icon: <HiOutlineClipboardCheck className="w-8 h-8 text-green-600" />,
    },
    {
      href: "/appointment",
      title: t("bookAppointment"),
      desc: t("bookAppointmentDesc"),
      icon: <HiOutlineCalendar className="w-8 h-8 text-purple-600" />,
    },
    {
      href: "/video-consult",
      title: t("videoConsult"),
      desc: t("videoConsultDesc"),
      icon: <HiOutlineVideoCamera className="w-8 h-8 text-red-500" />,
    },
    {
      href: "/health-record",
      title: t("healthRecord"),
      desc: t("healthRecordDesc"),
      icon: <HiOutlineDocumentText className="w-8 h-8 text-indigo-600" />,
    },
    {
      href: "/patient-view",
      title: t("patientView"),
      desc: t("patientViewDesc"),
      icon: <HiOutlineUser className="w-8 h-8 text-orange-500" />,
    },
    {
      href: "/pharmacy",
      title: t("pharmacy"),
      desc: t("pharmacyDesc"),
      icon: <HiOutlineBeaker className="w-8 h-8 text-pink-500" />,
    },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Head>
        <title>NabhaCare - Your Health Platform</title>
        <meta name="description" content="NabhaCare Integrated Health Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-2 flex justify-end gap-4">
          <Link href="/doctor-view" legacyBehavior>
            <a className="inline-flex items-center px-4 py-2 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors">
              <HiOutlineUserMd className="w-5 h-5 mr-2" />
              {t("doctorLogin")}
            </a>
          </Link>
          <Link href="/login-pharmacy-admin" legacyBehavior>
            <a className="inline-flex items-center px-4 py-2 rounded-lg text-pink-700 hover:bg-pink-50 transition-colors">
              <HiOutlineBeaker className="w-5 h-5 mr-2" />
              {t("pharmacyAdminLogin")}
            </a>
          </Link>
          <Link href="/super-admin" legacyBehavior>
            <a className="inline-flex items-center px-4 py-2 rounded-lg text-green-700 hover:bg-green-50 transition-colors">
              <HiOutlineShieldCheck className="w-5 h-5 mr-2" />
              {t("adminLogin")}
            </a>
          </Link>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/ministry.png"
          alt="Healthcare Background"
          fill
          className="object-cover opacity-15 mix-blend-overlay"
          priority
          unoptimized
        />
      </div>

      <main className="flex flex-col items-center px-6 py-10 relative z-10">
        {/* Header with Punjab Logo, Language Switcher, and Ministry Logo */}
        <div className="w-full max-w-6xl mb-6 flex justify-between items-center">
          <div className="w-48 h-24 relative">
            <Image
              src="/images/ministry.png"
              alt="Punjab Government Logo"
              width={100}
              height={100}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <LanguageSwitcher />
          <div className="w-48 h-24 relative">
            <Image
              src="/images/punjab.png"
              alt="Ministry Logo"
              width={100}
              height={100}
              className="object-contain background-white rounded-lg"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Banner Section */}
        <div className="w-full max-w-6xl mb-10 relative rounded-2xl overflow-hidden shadow-xl">
          <div className="aspect-[21/9] relative">
            <Image
              src="/images/banner.jpg"
              alt="Healthcare Banner"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
              <div className="p-8 text-white max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Transforming Rural Healthcare</h2>
                <p className="text-lg text-white/90">
                  Bringing quality healthcare services to the doorsteps of 173 villages in Nabha
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Multilingual Title */}
        <h1 className="mb-2">
          <div className="text-4xl md:text-3xl font-extrabold text-blue-900 drop-shadow-lg text-center">
            Welcome to Nabha Care
            <span className="mx-3 text-green-700">•</span>
            <span className="font-hindi">नभा केयर में आपका स्वागत है</span>
          </div>
        </h1>
        
        {/* Subtitle */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <p className="text-lg text-gray-700">
            Bridging healthcare gaps for 173 villages 
            <span className="mx-3 text-green-700">|</span>
            <span className="font-hindi">173 गांवों में स्वास्थ्य सेवा का विस्तार</span>
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {cardData.map((card, index) => (
            <Link href={card.href} key={index} legacyBehavior>
              <a className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-200 hover:border-green-500 flex flex-col gap-3">
                {card.icon}
                <h2 className="text-xl font-semibold text-green-800">{card.title}</h2>
                <p className="text-gray-600 text-sm">{card.desc}</p>
              </a>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-gray-600 text-sm text-center border-t pt-4 w-full">
          © {new Date().getFullYear()} Nabha Care • SIH Telemedicine Solution <br />
          In collaboration with <span className="font-semibold">Punjab Government</span> &{" "}
          <span className="font-semibold">Ministry of Health</span>
        </footer>
      </main>
    </div>
  );
}
