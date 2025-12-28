import React, { useState } from 'react';
import { Copy, Check, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Build timestamp captured at bundle time
const BUILD_TIMESTAMP = new Date().toISOString();

// Supabase config (same as client.ts)
const SUPABASE_URL = "https://czbepdrjixrqrxeyfagc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmVwZHJqaXhycXJ4ZXlmYWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTcwMDMsImV4cCI6MjA3NDMzMzAwM30.H7Z1Ehi_5t12YHZwclZAuIeK3ME__I0_Bn_EYelxN7M";

// Extract fingerprint (first 6 + last 6 chars)
const getKeyFingerprint = (key: string) => {
  return `${key.substring(0, 6)}...${key.substring(key.length - 6)}`;
};

// Extract domain from URL
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

interface DiagnosticPanelProps {
  showAlways?: boolean;
}

const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ showAlways = false }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const diagnosticInfo = {
    build: BUILD_TIMESTAMP,
    domain: getDomain(SUPABASE_URL),
    keyFingerprint: getKeyFingerprint(SUPABASE_ANON_KEY),
    userAgent: navigator.userAgent.substring(0, 50) + '...',
  };

  const diagnosticText = `
📱 TudoFit TV - Diagnóstico
━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Build: ${diagnosticInfo.build}
🌐 Supabase: ${diagnosticInfo.domain}
🔑 Key: ${diagnosticInfo.keyFingerprint}
📲 Device: ${diagnosticInfo.userAgent}
━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticText);
      setCopied(true);
      toast.success('Diagnóstico copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for mobile browsers
      const textarea = document.createElement('textarea');
      textarea.value = diagnosticText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success('Diagnóstico copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only show in development or when showAlways is true
  const isDev = import.meta.env.DEV || showAlways;
  
  if (!isDev && !showAlways) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Collapsed toggle button */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="absolute bottom-2 right-2 p-2 bg-muted/80 backdrop-blur rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Abrir diagnóstico"
        >
          <Bug className="h-4 w-4" />
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="bg-muted/95 backdrop-blur border-t border-border p-3 text-xs">
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">🔧 Diagnóstico</span>
              <button
                onClick={() => setExpanded(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-1 font-mono text-muted-foreground">
              <p><span className="text-foreground">Build:</span> {diagnosticInfo.build}</p>
              <p><span className="text-foreground">Supabase:</span> {diagnosticInfo.domain}</p>
              <p><span className="text-foreground">Key:</span> {diagnosticInfo.keyFingerprint}</p>
            </div>

            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar diagnóstico
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticPanel;
