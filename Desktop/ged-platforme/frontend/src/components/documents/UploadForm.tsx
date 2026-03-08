// frontend/src/components/documents/UploadForm.tsx
import { useMemo, useRef, useState, useCallback, type FormEvent } from 'react';
import { Upload, X, Tag, Plus, CheckCircle2, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '@/services/api';
import { validateRequired } from '@/utils/validators';
import { CATEGORY_LABELS, CONFIDENTIALITY_LABELS } from '@/utils/constants';

import type { DocumentCategory, ConfidentialityLevel } from '@/types/document.types';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]);

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function sanitizeTag(input: string) {
  return input.trim().replace(/\s+/g, ' ');
}

export function UploadForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('CORRESPONDANCE');
  const [confidentialityLevel, setConfidentialityLevel] = useState<ConfidentialityLevel>('INTERNE');
  const [description, setDescription] = useState('');

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  const fileHint = useMemo(() => `PDF, Word, Excel, Images — max ${formatBytes(MAX_FILE_SIZE_BYTES)}`, []);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_FILE_SIZE_BYTES) return `Fichier trop volumineux (max ${formatBytes(MAX_FILE_SIZE_BYTES)}).`;
    if (f.type && !ALLOWED_MIME.has(f.type)) return 'Type de fichier non autorisé.';
    return null;
  };

  const setPickedFile = useCallback(
    (f: File) => {
      const fileErr = validateFile(f);
      if (fileErr) {
        setError(fileErr);
        setFile(null);
        return;
      }
      setError('');
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    },
    [title]
  );

  const onDrop = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setPickedFile(files[0]);
    },
    [setPickedFile]
  );

  const clearFile = () => {
    setFile(null);
    setTitle('');
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = () => {
    const t = sanitizeTag(tagInput);
    if (!t) return;

    const normalized = t.toLowerCase();
    const exists = tags.some((x) => x.toLowerCase() === normalized);
    if (!exists) setTags((prev) => [...prev, t]);

    setTagInput('');
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) return setError('Veuillez sélectionner un fichier');

    const titleErr = validateRequired(title, 'Le titre');
    if (titleErr) return setError(titleErr);

    setIsUploading(true);
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('confidentialityLevel', confidentialityLevel);
      formData.append('description', description);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
        signal: controller.signal,
        onUploadProgress: (evt) => {
          const total = evt.total ?? file.size;
          const loaded = evt.loaded ?? 0;
          const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
          setProgress(Math.min(100, Math.max(0, pct)));
        },
      });

      setProgress(100);
      toast.success('Document uploadé avec succès');
      navigate('/documents');
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        toast('Upload annulé', { icon: '🛑' });
        return;
      }
      const msg = err?.response?.data?.message ?? "Erreur lors de l'upload";
      setError(msg);
    } finally {
      setIsUploading(false);
      abortRef.current = null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* DROPZONE */}
      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onDrop(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(e) => onDrop(e.target.files)}
        />

        {file ? (
          <>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
            >
              <X className="h-3.5 w-3.5" /> Supprimer
            </button>
          </>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)' }}>
              <Upload className="h-7 w-7 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-white">Glisser-déposer votre fichier</p>
              <p className="text-sm text-slate-400 mt-1">
                أو <span className="text-blue-400 underline cursor-pointer">parcourir</span> vos fichiers
              </p>
            </div>
            <p className="text-xs text-slate-500">{fileHint}</p>
          </>
        )}
      </div>

      {/* FIELDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Titre du document *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Circulaire n°2025-01 — Rentrée scolaire"
            className="input"
          />
        </div>

        <div>
          <label className="label">Catégorie *</label>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Niveau de confidentialité</label>
          <select
            className="select"
            value={confidentialityLevel}
            onChange={(e) => setConfidentialityLevel(e.target.value as ConfidentialityLevel)}
          >
            {Object.entries(CONFIDENTIALITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brève description du contenu du document…"
            rows={3}
            className="input resize-none"
          />
        </div>
      </div>

      {/* TAGS */}
      <div>
        <label className="label">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Ajouter un tag…"
            className="input flex-1"
          />
          <button type="button" onClick={addTag} className="btn-secondary px-3" disabled={!tagInput.trim()}>
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t) => (
              <span key={t} className="badge-blue flex items-center gap-1">
                <Tag className="h-3 w-3" /> {t}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                  className="hover:text-white ml-0.5"
                  aria-label={`Supprimer tag ${t}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && <p className="alert-error">{error}</p>}

      {/* PROGRESS + CANCEL */}
      {isUploading && (
        <div className="space-y-2">
          <div className="rounded-xl overflow-hidden h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full transition-all duration-200 rounded-xl"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #06b6d4)' }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Upload: {progress}%</span>
            <button type="button" onClick={cancelUpload} className="btn-ghost h-8 px-2 text-xs">
              <Ban className="h-3.5 w-3.5" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => navigate('/documents')} className="btn-secondary" disabled={isUploading}>
          Annuler
        </button>

        <button type="submit" disabled={isUploading || !file} className="btn-primary min-w-[160px]">
          {isUploading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Upload en cours…
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Upload className="h-4 w-4" /> Uploader
            </span>
          )}
        </button>
      </div>
    </form>
  );
}