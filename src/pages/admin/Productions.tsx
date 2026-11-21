// Admin → Productions : les derniers sons du studio affichés sur l'accueil.
import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Music2, Pencil, Plus, Star, Trash2, Upload, X } from 'lucide-react';
import { api, mediaUrl } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { cx, fDateNum } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Confirm, Empty, ErrorState, Field, Input, Modal, PageHeader, Select, Spinner, Textarea, Toggle } from '../../components/ui';
import { LogoArt, SmartImage, logoVariantFor } from '../../components/media';
import { PLATFORM_LABEL, type Production } from '../../components/Productions';

const IMG = 'image/jpeg,image/png,image/webp,image/avif';
const AUD = 'audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/wav,audio/x-wav';

const ProductionForm: React.FC<{ item: Production | null; onDone: () => void }> = ({ item, onDone }) => {
  const toast = useToast();
  const [f, setF] = useState({
    title: item?.title || '', artist: item?.artist || '', description: item?.description || '', link_url: item?.link_url || '',
    platform: item?.platform || '', release_date: item?.release_date || '', is_public: item ? item.is_public !== false : true, is_featured: item ? item.is_featured : true
  });
  const [current, setCurrent] = useState<Production | null>(item);
  const [cover, setCover] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const upload = async (id: number, kind: 'cover' | 'audio', file: File) => {
    const max = kind === 'cover' ? 8 : 20;
    if (file.size > max * 1024 * 1024) throw new Error(`« ${file.name} » dépasse ${max} Mo`);
    const fd = new FormData();
    fd.append(kind === 'cover' ? 'image' : 'audio', file);
    return (await api<{ production: Production }>(`/admin/productions/${id}/${kind}`, { method: 'POST', form: fd })).production;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const body = { ...f, platform: f.platform || null, release_date: f.release_date || null };
      let p = current
        ? (await api<{ production: Production }>(`/admin/productions/${current.id}`, { method: 'PATCH', body })).production
        : (await api<{ production: Production }>('/admin/productions', { method: 'POST', body })).production;
      if (cover) p = await upload(p.id, 'cover', cover);
      if (audio) p = await upload(p.id, 'audio', audio);
      toast(current ? 'Production mise à jour' : 'Production ajoutée — visible sur l’accueil');
      onDone();
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const removeMedia = async (kind: 'cover' | 'audio') => {
    if (!current) return;
    try { setCurrent((await api<{ production: Production }>(`/admin/productions/${current.id}/media/${kind}`, { method: 'DELETE' })).production); toast(kind === 'cover' ? 'Pochette retirée' : 'Extrait retiré'); }
    catch (e: any) { toast(e.message, 'error'); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titre"><Input required value={f.title} onChange={set('title')} /></Field>
        <Field label="Artiste"><Input value={f.artist} onChange={set('artist')} /></Field>
        <Field label="Lien d’écoute" hint="Spotify, Apple Music, YouTube, Audiomack…" className="sm:col-span-2"><Input type="url" value={f.link_url} onChange={set('link_url')} placeholder="https://" /></Field>
        <Field label="Plateforme">
          <Select value={f.platform} onChange={set('platform')}>
            <option value="">—</option>
            {Object.entries(PLATFORM_LABEL).map(([k, v]) => <option key={k} value={k}>{k === 'autre' ? 'Autre' : v}</option>)}
          </Select>
        </Field>
        <Field label="Date de sortie"><Input type="date" value={f.release_date} onChange={set('release_date')} /></Field>
        <Field label="Description (facultatif)" className="sm:col-span-2"><Textarea rows={2} value={f.description} onChange={set('description')} /></Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label">Pochette</p>
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-700">
              {cover ? <img src={URL.createObjectURL(cover)} alt="" className="h-full w-full object-cover" /> : current?.cover_url ? <SmartImage src={current.cover_url} alt="" fit="cover" className="h-full w-full" /> : <LogoArt variant="float" compact />}
            </div>
            <div className="space-y-1.5">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink-700 px-3.5 py-2 text-[13px] font-semibold hover:bg-ink-600">
                <ImagePlus className="h-4 w-4" />{current?.cover_url || cover ? 'Remplacer' : 'Ajouter'}
                <input type="file" accept={IMG} className="hidden" onChange={(e) => setCover(e.target.files?.[0] || null)} />
              </label>
              {current?.cover_url && !cover && <button type="button" onClick={() => removeMedia('cover')} className="block text-xs text-bone-600 hover:text-[#F07A7A]">Retirer la pochette</button>}
            </div>
          </div>
        </div>
        <div>
          <p className="label">Extrait audio (facultatif)</p>
          <div className="space-y-2">
            {current?.audio_url && !audio && <audio controls preload="none" src={mediaUrl(current.audio_url)} className="h-9 w-full" />}
            {audio && <p className="truncate text-sm text-bone-200">{audio.name} <button type="button" onClick={() => setAudio(null)} aria-label="Retirer"><X className="inline h-3.5 w-3.5" /></button></p>}
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink-700 px-3.5 py-2 text-[13px] font-semibold hover:bg-ink-600">
                <Upload className="h-4 w-4" />{current?.audio_url || audio ? 'Remplacer' : 'Importer'}
                <input type="file" accept={AUD} className="hidden" onChange={(e) => setAudio(e.target.files?.[0] || null)} />
              </label>
              {current?.audio_url && !audio && <button type="button" onClick={() => removeMedia('audio')} className="text-xs text-bone-600 hover:text-[#F07A7A]">Retirer</button>}
            </div>
            <p className="text-xs text-bone-600">MP3, M4A ou WAV · 20 Mo max. Lisible directement sur l’accueil.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <Toggle checked={f.is_public} onChange={(v) => setF({ ...f, is_public: v })} label="Visible sur le site" />
        <Toggle checked={f.is_featured} onChange={(v) => setF({ ...f, is_featured: v })} label="Mise en avant sur l’accueil" />
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onDone}>Annuler</Button><Button type="submit" loading={busy}>Enregistrer</Button></div>
    </form>
  );
};

export const AdminProductions: React.FC = () => {
  useDocumentTitle('Productions');
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => api<{ productions: Production[] }>('/admin/productions').then((r) => r.productions), []);
  const [editing, setEditing] = useState<Production | 'new' | null>(null);
  const [del, setDel] = useState<Production | null>(null);
  const busyOrder = useRef(false);

  const patch = async (p: Production, body: Partial<Production>) => {
    try { await api(`/admin/productions/${p.id}`, { method: 'PATCH', body }); reload(); } catch (e: any) { toast(e.message, 'error'); }
  };
  const move = async (i: number, dir: number) => {
    const list = [...(data || [])];
    const j = i + dir;
    if (j < 0 || j >= list.length || busyOrder.current) return;
    [list[i], list[j]] = [list[j], list[i]];
    setData(list);
    busyOrder.current = true;
    await api('/admin/productions-order', { method: 'PUT', body: { ids: list.map((x) => x.id) } }).catch((e) => toast(e.message, 'error'));
    busyOrder.current = false;
  };

  return (
    <div>
      <PageHeader title="Productions" subtitle="Les derniers sons du studio, affichés sur l’accueil (pochette, extrait à écouter, lien vers la plateforme)."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>Ajouter un son</Button>} />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <button className="w-full" onClick={() => setEditing('new')}>
          <Empty icon={<Music2 className="h-8 w-8" />} title="Aucune production" text="Ajoutez les derniers sons enregistrés ou produits au studio." />
        </button>
      )}
      {data && data.length > 0 && (
        <div className="card divide-y divide-ink-700">
          {data.map((p, i) => (
            <div key={p.id} className={cx('flex flex-wrap items-center gap-4 p-4', p.is_public === false && 'opacity-60')}>
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-0.5 text-bone-600 hover:text-bone disabled:opacity-20" aria-label="Monter"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === data.length - 1} className="rounded p-0.5 text-bone-600 hover:text-bone disabled:opacity-20" aria-label="Descendre"><ArrowDown className="h-4 w-4" /></button>
              </div>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-700">
                {p.cover_url ? <SmartImage src={p.cover_url} alt="" fit="cover" className="h-full w-full" /> : <LogoArt variant={logoVariantFor(p.id)} compact />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="truncate text-xs text-bone-600">
                  {[p.artist, p.platform ? PLATFORM_LABEL[p.platform] : null, p.release_date ? `sortie le ${fDateNum(p.release_date)}` : null, p.audio_url ? 'extrait audio' : null].filter(Boolean).join(' · ') || '—'}
                </p>
                <div className="mt-1 flex gap-1.5">{p.is_featured && <Badge tone="ember">En avant</Badge>}{p.is_public === false && <Badge>Masquée</Badge>}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => patch(p, { is_featured: !p.is_featured })} className={cx('rounded-full p-2 hover:bg-ink-700', p.is_featured ? 'text-ember' : 'text-bone-600')} aria-label="Mettre en avant" title="Mettre en avant"><Star className={cx('h-4 w-4', p.is_featured && 'fill-ember')} /></button>
                <button onClick={() => patch(p, { is_public: p.is_public === false })} className="rounded-full p-2 text-bone-400 hover:bg-ink-700" aria-label={p.is_public === false ? 'Afficher' : 'Masquer'} title={p.is_public === false ? 'Afficher sur le site' : 'Masquer du site'}>{p.is_public === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(p)}>Modifier</Button>
                <button onClick={() => setDel(p)} className="rounded-full p-2 text-bone-600 hover:bg-ink-700 hover:text-[#F07A7A]" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} size="lg" title={editing === 'new' ? 'Ajouter un son' : 'Modifier la production'}>
        {editing && <ProductionForm item={editing === 'new' ? null : editing} onDone={() => { setEditing(null); reload(); }} />}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} danger title="Supprimer cette production ?" confirmLabel="Supprimer"
        message="Le son, sa pochette et son extrait audio seront supprimés du site."
        onConfirm={async () => { await api(`/admin/productions/${del!.id}`, { method: 'DELETE' }); toast('Production supprimée'); setDel(null); reload(); }} />
    </div>
  );
};
