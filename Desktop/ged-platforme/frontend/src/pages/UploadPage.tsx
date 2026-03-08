// frontend/src/pages/UploadPage.tsx
import { Upload, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadForm } from '@/components/documents/UploadForm';

export function UploadPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button type="button" onClick={() => navigate('/documents')} className="hover:text-slate-300 transition-colors">
          Documents
        </button>
        <span className="opacity-40">/</span>
        <span className="text-slate-300">Upload</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.20)' }}>
              <Upload className="h-4 w-4 text-blue-400" />
            </span>
            Uploader un document
          </h1>
          <p className="page-sub mt-1">Ajoutez un nouveau document sécurisé à la plateforme</p>
        </div>

        <button type="button" onClick={() => navigate('/documents')} className="btn-secondary self-start">
          <FileText className="h-4 w-4" />
          Retour aux documents
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <UploadForm />
          </div>
        </div>

        {/* Right panel (UI only) */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Bonnes pratiques</h2>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li>• اختر مستوى السرّية قبل الرفع (Public / Interne / Confidentiel / Secret).</li>
              <li>• PDF أفضل للأرشفة الرسمية.</li>
              <li>• استعمل Tags لتحسين البحث والفهرسة.</li>
              <li>• كل العمليات قد تظهر في سجل التدقيق (Audit).</li>
            </ul>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Conseils</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              إذا كان الملف يحتوي معلومات حساسة، اختر مستوى سرّية مناسب وتجنب وضع بيانات شخصية في العنوان.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}