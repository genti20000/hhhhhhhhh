import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Tv, 
  Download, 
  Copy, 
  Check, 
  X, 
  Terminal, 
  Smartphone, 
  Layers, 
  FileCode,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AndroidTVPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="uk.co.londonkaraokeclub.singshottv">

    <!-- Google TV & Android TV Hardware Declarations -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.microphone"
        android:required="false" />

    <!-- Network & Screen Wake Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:banner="@drawable/tv_banner"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Leanback"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:screenOrientation="landscape"
            android:configChanges="orientation|keyboardHidden|screenSize">
            
            <!-- Standard Android Launcher Intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Google TV & Android TV Leanback Launcher Intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

const CAPACITOR_CONFIG_JSON = `{
  "appId": "uk.co.londonkaraokeclub.singshottv",
  "appName": "SingShot - Soho Live TV",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "android": {
    "flavor": "tv",
    "minWebViewVersion": 80
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#070709",
      "showSpinner": false
    }
  }
}`;

export const AndroidTVPackageModal: React.FC<AndroidTVPackageModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manifest' | 'capacitor' | 'install'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFiles = () => {
    // Generate text blob for AndroidManifest.xml
    const blob = new Blob([ANDROID_MANIFEST_XML], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AndroidManifest.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-3xl bg-neutral-900 border border-amber-400/50 rounded-3xl shadow-[0_0_60px_rgba(234,179,8,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-black text-white uppercase tracking-wider">
                  Android App for Google TV
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/40">
                  LEANBACK READY
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                London Karaoke Club Soho · 10-Foot UI & D-Pad Remote Architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Google TV Features
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manifest'
                ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'capacitor'
                ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Capacitor / APK Build
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Google TV Setup Guide
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="text-amber-400 font-black text-xs uppercase flex items-center gap-1.5">
                    <Tv className="w-4 h-4" /> D-PAD REMOTE ENGINE
                  </div>
                  <p className="text-xs text-neutral-300">
                    Full hardware remote support (Up/Down/Left/Right, OK, Back, Menu, Play/Pause) with spatial focus navigation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="text-pink-400 font-black text-xs uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> SCREEN WAKELOCK
                  </div>
                  <p className="text-xs text-neutral-300">
                    Prevents Google TV ambient screensavers from turning on during live karaoke operations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="text-cyan-400 font-black text-xs uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> OVERSCAN SAFE ZONES
                  </div>
                  <p className="text-xs text-neutral-300">
                    5% - 10% TV safe area guards ensure QR codes, lower-thirds, and headers are never clipped by TV bezels.
                  </p>
                </div>
              </div>

              {/* 16:9 Leanback Launcher Banner Preview */}
              <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Google TV Leanback Launcher Banner (320×180 Standard)
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    public/tv-banner.svg
                  </span>
                </div>
                <div className="w-[320px] h-[180px] mx-auto rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-xl bg-neutral-950 flex items-center justify-center">
                  <img 
                    src="/tv-banner.svg" 
                    alt="SingShot Google TV Banner" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANIFEST */}
          {activeTab === 'manifest' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">
                  Android TV Manifest with LEANBACK_LAUNCHER & Landscape lock:
                </span>
                <button
                  onClick={() => handleCopy(ANDROID_MANIFEST_XML, 'manifest')}
                  className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'manifest' ? 'Copied' : 'Copy XML'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black border border-neutral-800 text-xs font-mono text-amber-200/90 overflow-x-auto max-h-[340px]">
                {ANDROID_MANIFEST_XML}
              </pre>
            </div>
          )}

          {/* TAB 3: CAPACITOR */}
          {activeTab === 'capacitor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">
                  Capacitor Android TV Build Config (capacitor.config.json):
                </span>
                <button
                  onClick={() => handleCopy(CAPACITOR_CONFIG_JSON, 'cap')}
                  className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cap' ? 'Copied' : 'Copy Config'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black border border-neutral-800 text-xs font-mono text-cyan-200/90 overflow-x-auto max-h-[220px]">
                {CAPACITOR_CONFIG_JSON}
              </pre>

              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs text-neutral-300">
                <div className="font-bold text-amber-400 uppercase tracking-wider">
                  One-Line Build to Android TV APK:
                </div>
                <code className="block p-2 rounded-lg bg-black text-amber-300 font-mono">
                  npx cap add android && npx cap sync && cd android && ./gradlew assembleDebug
                </code>
              </div>
            </div>
          )}

          {/* TAB 4: INSTALLATION */}
          {activeTab === 'install' && (
            <div className="space-y-4 text-xs text-neutral-300">
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">1</span>
                  Direct Google TV PWA Launch (No Sideload Required)
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Open Chrome or TV Web Browser on your Chromecast with Google TV or Sony Bravia TV. Navigate to the app URL. Click the browser menu and select <strong>"Add to Apps / Install"</strong>. The SingShot icon will appear on your Google TV home screen shelf.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">2</span>
                  Sideloading via Android TV "Downloader" App
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Install the free <strong>Downloader by AFTVnews</strong> from the Google TV Play Store. Enter the APK download link or code, download, and hit install. The app registers as a Leanback Launcher app!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">3</span>
                  ADB Direct Deployment from Laptop
                </h3>
                <code className="block p-2 rounded-lg bg-black text-amber-300 font-mono">
                  adb connect 192.168.1.xxx:5555 && adb install -r singshot-tv.apk
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/80">
          <button
            onClick={handleDownloadFiles}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download AndroidManifest.xml
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
