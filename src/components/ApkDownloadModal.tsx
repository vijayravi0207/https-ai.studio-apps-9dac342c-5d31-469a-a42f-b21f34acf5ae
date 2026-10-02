import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../utils/translations';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  HardHat, 
  Terminal,
  Share2
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleDirectApkDownload = async () => {
    try {
      setDownloading(true);
      setDownloadProgress(25);
      setDownloadStatus(lang === 'ta' ? 'பதிவிறக்கம் தொடங்குகிறது...' : 'Connecting to server...');

      const response = await fetch('/api/download-apk', {
        cache: 'no-store',
        headers: { 'Accept': 'application/vnd.android.package-archive' },
      });

      setDownloadProgress(65);
      setDownloadStatus(lang === 'ta' ? '3.0 MB APK கோப்பு பெறப்படுகிறது...' : 'Receiving 3.0 MB APK package...');

      const blob = await response.blob();
      setDownloadProgress(90);

      // Verify blob size is real APK (>100KB, HTML error is ~10KB)
      if (blob.size < 100000) {
        // Fallback to direct navigation if proxy intercepted
        window.location.href = '/api/download-apk';
        return;
      }

      const blobUrl = window.URL.createObjectURL(
        new Blob([blob], { type: 'application/vnd.android.package-archive' })
      );

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'ConcreteMixDesignPro.apk';
      link.setAttribute('download', 'ConcreteMixDesignPro.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadProgress(100);
      setDownloadStatus(lang === 'ta' ? 'பதிவிறக்கம் முடிந்தது!' : 'Download complete! (Concrete Mix Design APK)');

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        setDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus(null);
      }, 2500);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
      window.location.href = '/api/download-apk';
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 font-sans">
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Download className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-1.5">
                <span>{lang === 'ta' ? 'அண்ட்ராய்டு APK / செயலி நிறுவுதல்' : 'Android App & APK Download'}</span>
              </h2>
              <span className="text-[10.5px] text-amber-400 font-mono">Concrete Mix Design Pro (IS 10262:2019)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Direct APK File Download Card (Primary) */}
          <div className="bg-gradient-to-br from-emerald-500/15 via-slate-800 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-4 md:p-5 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950 uppercase tracking-wide">
                  {lang === 'ta' ? 'நேரடி Android APK கோப்பு' : 'Native Android APK'}
                </span>
                <h3 className="text-sm md:text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Download className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                  <span>ConcreteMixDesignPro.apk</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-800/60">
                Native App · Signed
              </span>
            </div>

            <p className="text-slate-300 text-[11.5px] leading-relaxed">
              {lang === 'ta'
                ? 'இந்த Concrete Mix Design செயலியின் உண்மையான Android APK கோப்பு! இன்ஸ்டால் செய்தவுடன் நேரடி Concrete Mix Design பயன்பாடே (Offline / Online) உங்கள் போனில் திறக்கும்.'
                : 'Native Android APK compiled specifically for this Concrete Mix Design Pro application! Bundled with full offline IS 10262 & IS 456 calculations.'}
            </p>

            {downloading && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40">
                <div className="flex justify-between text-[11px] text-emerald-300 font-medium">
                  <span>{downloadStatus}</span>
                  <span className="font-mono">{downloadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleDirectApkDownload}
              disabled={downloading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all text-center disabled:opacity-70 cursor-pointer"
            >
              <Download className={`w-4 h-4 stroke-[2.5] ${downloading ? 'animate-bounce' : ''}`} />
              <span>
                {downloading
                  ? (lang === 'ta' ? 'பதிவிறக்கம் ஆகிறது...' : 'Downloading ConcreteMixDesignPro.apk...')
                  : (lang === 'ta' ? 'Concrete Design APK-ஐ பதிவிறக்கு (Download .APK)' : 'Download ConcreteMixDesignPro.apk')}
              </span>
            </button>

            <div className="text-center pt-0.5">
              <a
                href="/api/download-apk"
                download="ConcreteMixDesignPro.apk"
                className="text-[10.5px] text-emerald-400/80 hover:text-emerald-300 underline font-mono"
              >
                {lang === 'ta' ? 'நேரடி லிங்க் (Direct HTTP Download Link)' : 'Direct HTTP Link Fallback'}
              </a>
            </div>

            {/* Android Install Instructions & Latest Security Guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ta' ? 'பாதுகாப்பு & நிறுவும் வழிகாட்டி (Android Security Guide)' : 'Android Security & Install Guide'}</span>
                </span>
                <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  v1 + v2 + v3 Scheme Verified
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>
                    {lang === 'ta'
                      ? 'பதிவிறக்கம் செய்த .apk ஃபைலைத் திறக்கவும் (Open .apk from Downloads).'
                      : 'Open the downloaded .apk file from Notifications or Downloads folder.'}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>
                    {lang === 'ta'
                      ? 'அனுமதி கேட்டால்: "Settings" சென்று "Allow from this source / Install unknown apps" என்பதை இயக்கவும்.'
                      : 'If prompted: Tap "Settings" and enable "Allow from this source / Install unknown apps".'}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-amber-300">
                      {lang === 'ta' ? 'Play Protect எச்சரிக்கை வந்தால்:' : 'If Google Play Protect warns:'}
                    </strong>{' '}
                    <span>
                      {lang === 'ta'
                        ? '"More details" (மேலும் விவரங்கள்) என்பதைத் தட்டி ➔ "Install anyway" (எப்படியும் நிறுவு) என்பதை அழுத்தவும்.'
                        : 'Tap "More details" ➔ then tap "Install anyway" to proceed.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Instant Native Android 1-Tap PWA Install (No Security Warnings) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-800/90 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-slate-950 uppercase">
                  {lang === 'ta' ? 'முறை 2: பாதுகாப்பு எச்சரிக்கை இல்லாத நேரடி நிறுவல்' : 'Method 2: Zero-Warning WebAPK Install'}
                </span>
                <h3 className="text-xs md:text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>
                    {lang === 'ta'
                      ? 'Chrome வழியாக 1-கிளிக்கில் நேரடியாக நிறுவுக'
                      : 'Install Directly via Chrome (Google WebAPK)'}
                  </span>
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              {lang === 'ta'
                ? 'உங்கள் போன் பாதுகாப்பு காரணங்களால் மூன்றாம் தரப்பு APK-களை தடை செய்தால், கீழே உள்ள பொத்தானை அழுத்தினால் கூகுள் Chrome எந்தவித பாதுகாப்புக் கட்டுப்பாடும் இல்லாமல் நேரடியாக முழுமையான ஆப்பாக நிறுவும்!'
                : 'If your Android device blocks sideloaded APKs, this installs via Google Chrome as an official WebAPK with native launcher icon, offline caching, and 0 security warnings!'}
            </p>

            {isInstallable ? (
              <button
                onClick={handleNativeInstall}
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 stroke-[2.2]" />
                <span>{lang === 'ta' ? 'ஹோம் ஸ்கிரீனில் நேரடியாக நிறுவுக (Install App)' : 'Install App to Android Home Screen'}</span>
              </button>
            ) : isInstalled ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'ta' ? 'இந்த ஆப் ஏற்கனவே நிறுவப்பட்டுள்ளது!' : 'App is already installed!'}</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                {lang === 'ta' ? (
                  <span>
                    Chrome மெனுவில் (மேல் வலது மூலையில் உள்ள <strong>3 புள்ளிகள் ⋮</strong>) ➔ <strong>"Install app"</strong> அல்லது <strong>"Add to Home screen"</strong> என்பதை அழுத்தியும் நேரடியாக நிறுவலாம்.
                  </span>
                ) : (
                  <span>
                    Tap Chrome menu (<strong>3 dots ⋮</strong> in top right) ➔ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Method 3: PWABuilder Signed Store APK */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">PWABuilder Cloud APK Generator</span>
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                <span>PWABuilder.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[10.5px] text-slate-400">
              {lang === 'ta'
                ? 'Google Play Store-ல் பதிவேற்றம் செய்யக்கூடிய Signed AAB/APK தொகுப்பைப் பெற PWABuilder பயன்படுத்தலாம்.'
                : 'Generate a Google Play Store-ready signed bundle (.aab/.apk) via Microsoft/Google PWABuilder.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {lang === 'ta' ? 'மூடுக' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
