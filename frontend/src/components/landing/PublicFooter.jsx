import React from "react";
import { Link } from "react-router-dom";
import { Apple, Play, Briefcase } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import logo from "@/assets/logo.png";

export default function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#070a59] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                <img src={logo} alt="UniLink" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-lg font-bold">UniLink</span>
            </div>
            <p className="text-white/60 text-sm">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.about")}</a></li>
              <li><Link to="/membership" className="hover:text-white transition-colors">{t("footer.membership")}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.careers")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.help")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.contact")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.terms")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.faq")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.download")}</h4>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-black/80 transition-colors">
                <Apple size={18} />
                <div className="leading-tight">
                  <p className="text-[10px]">{t("footer.appStoreLine1")}</p>
                  <p className="font-semibold">{t("footer.appStoreLine2")}</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-black/80 transition-colors">
                <Play size={18} />
                <div className="leading-tight">
                  <p className="text-[10px]">{t("footer.googlePlayLine1")}</p>
                  <p className="font-semibold">{t("footer.googlePlayLine2")}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">{t("footer.rights", { year: 2026 })}</p>
          <Link to="/become-partner" className="flex items-center gap-2 bg-[#FF7700] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#FF7700]/90 transition-colors">
            <Briefcase size={16} />
            {t("footer.becomePartner")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
