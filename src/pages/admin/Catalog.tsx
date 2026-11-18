import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Pencil, Plus, Star, Trash2, Upload, Replace, X } from 'lucide-react';
import { api, mediaUrl } from '../../lib/api';
import { LogoArt, SmartImage } from '../../components/media';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { cx, fcfa } from '../../lib/format';
import type { Equipment, GalleryPhoto, Service } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Confirm, Empty, ErrorState, Field, Input, Modal, PageHeader, Select, Spinner, Textarea, Toggle } from '../../components/ui';

const readDims = (file: File) =>
  new Promise<{ width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
const MAX = 8 * 1024 * 1024;
const checkFiles = (files: File[]) => {
  const big = files.find((f) => f.size > MAX);
  if (big) throw new Error(`« ${big.name} » dépasse 8 Mo`);
};

// ------------------------------------------------------------------ Services
const ServiceForm: React.FC<{ service: Service | null; onDone: () => void }> = ({ service, onDone }) => {
  const toast = useToast();
  const [f, setF] = useState({
    name: service?.name || '', tagline: service?.tagline || '', description: service?.description || '', booking_mode: service?.booking_mode || 'quote',
    price: service?.price?.toString() || '', price_unit: service?.price_unit || '', min_hours: String(service?.min_hours || 1), max_hours: String(service?.max_hours || 8),
    allow_deposit: !!service?.allow_deposit, deposit_percent: String(service?.deposit_percent || 50), features: (service?.features || []).join('\n'),
    is_active: service ? service.is_active : true, is_featured: !!service?.is_featured, sort_order: String(service?.sort_order ?? 0)
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (image) checkFiles([image]);
      const body = { ...f, price: f.price === '' ? null : Number(f.price), min_hours: Number(f.min_hours), max_hours: Number(f.max_hours), deposit_percent: Number(f.deposit_percent), sort_order: Number(f.sort_order) };
      const r = service
        ? await api<{ service: Service }>(`/admin/services/${service.id}`, { method: 'PATCH', body })
        : await api<{ service: Service }>('/admin/services', { method: 'POST', body });
      if (image) {
        const form = new FormData();
        form.append('image', image);
        await api(`/admin/services/${r.service.id}/image`, { method: 'POST', form });
      }
      toast(service ? 'Service mis à jour — visible immédiatement sur le site' : 'Service créé');
      onDone();
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" className="sm:col-span-2"><Input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Accroche" className="sm:col-span-2"><Input value={f.tagline} onChange={set('tagline')} maxLength={255} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={4} value={f.description} onChange={set('description')} /></Field>
        <Field label="Mode de réservation">
          <Select value={f.booking_mode} onChange={set('booking_mode')}>
            <option value="slot">Créneau horaire (calendrier)</option><option value="per_track">Au titre (sans créneau)</option><option value="quote">Sur devis (contact)</option>
          </Select>
        </Field>
        <Field label="Tarif (FCFA)" hint={f.booking_mode === 'quote' ? 'Facultatif : laissez vide pour « Sur devis »' : 'Requis pour la réservation en ligne'}><Input type="number" min={0} value={f.price} onChange={set('price')} /></Field>
        {f.booking_mode !== 'quote' && <Field label="Unité du tarif"><Input value={f.price_unit} onChange={set('price_unit')} placeholder={f.booking_mode === 'slot' ? 'heure' : 'titre'} /></Field>}
        {f.booking_mode === 'slot' && (
          <>
            <Field label="Durée minimale (h)"><Input type="number" min={1} max={16} value={f.min_hours} onChange={set('min_hours')} /></Field>
            <Field label="Durée maximale (h)"><Input type="number" min={1} max={16} value={f.max_hours} onChange={set('max_hours')} /></Field>
          </>
        )}
        {f.booking_mode !== 'quote' && (
          <div className="flex items-end gap-4 sm:col-span-2">
            <Toggle checked={f.allow_deposit} onChange={(v) => setF({ ...f, allow_deposit: v })} label="Acompte autorisé" />
            {f.allow_deposit && <Field label="Acompte (%)"><Input type="number" min={1} max={100} value={f.deposit_percent} onChange={set('deposit_percent')} className="w-28" /></Field>}
          </div>
        )}
        <Field label="Points forts (un par ligne)" className="sm:col-span-2"><Textarea rows={4} value={f.features} onChange={set('features')} /></Field>
        <Field label="Ordre d’affichage"><Input type="number" min={0} value={f.sort_order} onChange={set('sort_order')} /></Field>
        <Field label="Image">
          <input type="file" accept={ACCEPT} onChange={(e) => setImage(e.target.files?.[0] || null)} className="block w-full text-sm text-bone-400 file:mr-3 file:rounded-full file:border-0 file:bg-ink-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-bone" />
        </Field>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <Toggle checked={f.is_active} onChange={(v) => setF({ ...f, is_active: v })} label="Visible et réservable" />
          <Toggle checked={f.is_featured} onChange={(v) => setF({ ...f, is_featured: v })} label="Mis en avant sur l’accueil" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onDone}>Annuler</Button><Button type="submit" loading={busy}>Enregistrer</Button></div>
    </form>
  );
};

export const AdminServices: React.FC = () => {
  useDocumentTitle('Services');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api<{ services: Service[] }>('/admin/services').then((r) => r.services), []);
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const [del, setDel] = useState<Service | null>(null);
  const patch = async (s: Service, body: any, ok: string) => { try { await api(`/admin/services/${s.id}`, { method: 'PATCH', body }); toast(ok); reload(); } catch (e: any) { toast(e.message, 'error'); } };

  return (
    <div>
      <PageHeader title="Services" subtitle="Les modifications apparaissent immédiatement sur le site public." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>Nouveau service</Button>} />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data || []).map((s) => (
          <div key={s.id} className={cx('card overflow-hidden', !s.is_active && 'opacity-60')}>
            <div className="relative aspect-[16/8] w-full overflow-hidden">{s.image_url ? <SmartImage src={s.image_url} alt="" className="absolute inset-0" /> : <LogoArt variant="shine" compact />}</div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-semibold">{s.name}</p><p className="text-sm text-bone-400">{s.booking_mode === 'quote' || !s.price ? 'Sur devis' : `${fcfa(s.price)} / ${s.price_unit || (s.booking_mode === 'slot' ? 'heure' : 'titre')}`}</p></div>
                <div className="flex flex-col items-end gap-1">{s.is_featured && <Badge tone="ember">En avant</Badge>}{!s.is_active && <Badge tone="red">Masqué</Badge>}</div>
              </div>
              <p className="mt-2 text-xs text-bone-600">{{ slot: 'Créneau horaire', per_track: 'Au titre', quote: 'Sur devis' }[s.booking_mode]} · {s.nb_reservations || 0} réservation(s)</p>
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink-600/70 pt-4">
                <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(s)}>Modifier</Button>
                <Button size="sm" variant="ghost" icon={s.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} onClick={() => patch(s, { is_active: !s.is_active }, s.is_active ? 'Service désactivé' : 'Service activé')}>{s.is_active ? 'Désactiver' : 'Activer'}</Button>
                <Button size="sm" variant="ghost" icon={<Star className={cx('h-3.5 w-3.5', s.is_featured && 'fill-ember text-ember')} />} onClick={() => patch(s, { is_featured: !s.is_featured }, 'Mise en avant modifiée')}>Avant</Button>
                <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDel(s)}>Supprimer</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} size="lg" title={editing === 'new' ? 'Nouveau service' : 'Modifier le service'}>
        {editing && <ServiceForm service={editing === 'new' ? null : editing} onDone={() => { setEditing(null); reload(); }} />}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} danger title="Supprimer ce service ?" confirmLabel="Supprimer"
        message="Un service lié à des réservations ne peut pas être supprimé : désactivez-le pour le masquer du site."
        onConfirm={async () => { try { await api(`/admin/services/${del!.id}`, { method: 'DELETE' }); toast('Service supprimé'); reload(); } catch (e: any) { toast(e.message, 'error'); } setDel(null); }} />
    </div>
  );
};

// ------------------------------------------------------------------ Équipements
const EquipmentForm: React.FC<{ item: Equipment | null; categories: string[]; onDone: () => void }> = ({ item, categories, onDone }) => {
  const toast = useToast();
  const [f, setF] = useState({ name: item?.name || '', category: item?.category || '', description: item?.description || '', is_public: item ? !!item.is_public : true, is_featured: !!item?.is_featured });
  const [current, setCurrent] = useState<Equipment | null>(item);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (id: number, list: File[], replace = false) => {
    checkFiles(list);
    const form = new FormData();
    list.forEach((x) => form.append('photos', x));
    if (replace) form.append('replace', '1');
    return (await api<{ equipment: Equipment }>(`/admin/equipment/${id}/photos`, { method: 'POST', form })).equipment;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (current) {
        await api(`/admin/equipment/${current.id}`, { method: 'PATCH', body: f });
        if (files.length) await upload(current.id, files);
      } else {
        checkFiles(files);
        const form = new FormData();
        Object.entries(f).forEach(([k, v]) => form.append(k, String(v)));
        files.forEach((x) => form.append('photos', x));
        await api('/admin/equipment', { method: 'POST', form });
      }
      toast('Équipement enregistré');
      onDone();
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const photoAction = async (fn: () => Promise<Equipment>) => {
    try { setCurrent(await fn()); } catch (e: any) { toast(e.message, 'error'); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom"><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Catégorie">
          <Input list="eq-categories" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Microphones, Monitoring…" />
          <datalist id="eq-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <Toggle checked={f.is_public} onChange={(v) => setF({ ...f, is_public: v })} label="Visible sur le site" />
          <Toggle checked={f.is_featured} onChange={(v) => setF({ ...f, is_featured: v })} label="Mis en avant" />
        </div>
      </div>

      <div>
        <p className="label">Photos</p>
        {current && current.photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {current.photos.map((p, i) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-600">
                <img src={mediaUrl(p.url)} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-[10px] font-semibold">Principale</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <button type="button" disabled={i === 0} aria-label="Mettre en premier" onClick={() => photoAction(() => api<{ equipment: Equipment }>(`/admin/equipment/${current.id}/photos-order`, { method: 'PUT', body: { ids: [p.id, ...current.photos.filter((x) => x.id !== p.id).map((x) => x.id)] } }).then((r) => r.equipment))} className="rounded p-1 hover:bg-white/10 disabled:opacity-30"><Star className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label="Supprimer la photo" onClick={() => photoAction(() => api<{ equipment: Equipment }>(`/admin/equipment/${current.id}/photos/${p.id}`, { method: 'DELETE' }).then((r) => r.equipment))} className="rounded p-1 hover:bg-white/10"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="subtle" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>Ajouter des photos</Button>
          {current && current.photos.length > 0 && files.length > 0 && (
            <Button type="button" size="sm" variant="ghost" icon={<Replace className="h-4 w-4" />} onClick={async () => { try { setCurrent(await upload(current.id, files, true)); setFiles([]); toast('Photos remplacées'); } catch (e: any) { toast(e.message, 'error'); } }}>Remplacer toutes les photos</Button>
          )}
          {files.length > 0 && <span className="text-xs text-bone-400">{files.length} fichier(s) sélectionné(s) <button type="button" onClick={() => setFiles([])} className="ml-1 align-middle" aria-label="Retirer"><X className="inline h-3 w-3" /></button></span>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onDone}>Fermer</Button><Button type="submit" loading={busy}>Enregistrer</Button></div>
    </form>
  );
};

export const AdminEquipment: React.FC = () => {
  useDocumentTitle('Équipements');
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => api<{ equipment: Equipment[] }>('/admin/equipment').then((r) => r.equipment), []);
  const [editing, setEditing] = useState<Equipment | 'new' | null>(null);
  const [del, setDel] = useState<Equipment | null>(null);
  const categories = [...new Set((data || []).map((e) => e.category).filter(Boolean))] as string[];
  const patch = async (e: Equipment, body: any) => { try { await api(`/admin/equipment/${e.id}`, { method: 'PATCH', body }); reload(); } catch (err: any) { toast(err.message, 'error'); } };
  const move = async (i: number, dir: number) => {
    const list = [...(data || [])];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setData(list);
    await api('/admin/equipment-order', { method: 'PUT', body: { ids: list.map((x) => x.id) } }).catch((e) => toast(e.message, 'error'));
  };

  return (
    <div>
      <PageHeader title="Nos équipements" subtitle="Le matériel réel du studio : ajoutez photos et descriptions, choisissez ce qui est visible et mis en avant."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>Ajouter un équipement</Button>} />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <Empty title="Aucun équipement" />}
      {data && data.length > 0 && (
        <div className="card divide-y divide-ink-700">
          {data.map((e, i) => (
            <div key={e.id} className={cx('flex flex-wrap items-center gap-4 p-4', !e.is_public && 'opacity-60')}>
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-0.5 text-bone-600 hover:text-bone disabled:opacity-20" aria-label="Monter"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === data.length - 1} className="rounded p-0.5 text-bone-600 hover:text-bone disabled:opacity-20" aria-label="Descendre"><ArrowDown className="h-4 w-4" /></button>
              </div>
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-700">{e.photos[0] ? <SmartImage src={e.photos[0].url} alt="" fit="cover" className="h-full w-full" /> : <ImagePlus className="m-4 h-6 w-6 text-bone-600" />}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-bone-600">{e.category || 'Sans catégorie'} · {e.photos.length} photo(s){!e.description && ' · sans description'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button onClick={() => patch(e, { is_featured: !e.is_featured })} className={cx('rounded-full p-2 hover:bg-ink-700', e.is_featured ? 'text-ember' : 'text-bone-600')} aria-label="Mettre en avant" title="Mettre en avant"><Star className={cx('h-4 w-4', e.is_featured && 'fill-ember')} /></button>
                <button onClick={() => patch(e, { is_public: !e.is_public })} className="rounded-full p-2 text-bone-400 hover:bg-ink-700" aria-label={e.is_public ? 'Masquer' : 'Afficher'} title={e.is_public ? 'Masquer du site' : 'Afficher sur le site'}>{e.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(e)}>Modifier</Button>
                <button onClick={() => setDel(e)} className="rounded-full p-2 text-bone-600 hover:bg-ink-700 hover:text-[#F07A7A]" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => { setEditing(null); reload(); }} size="lg" title={editing === 'new' ? 'Nouvel équipement' : 'Modifier l’équipement'}>
        {editing && <EquipmentForm item={editing === 'new' ? null : editing} categories={categories} onDone={() => { setEditing(null); reload(); }} />}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} danger title="Supprimer cet équipement ?" confirmLabel="Supprimer" message="L’équipement et ses photos seront supprimés définitivement."
        onConfirm={async () => { await api(`/admin/equipment/${del!.id}`, { method: 'DELETE' }); toast('Équipement supprimé'); setDel(null); reload(); }} />
    </div>
  );
};

// ------------------------------------------------------------------ Galerie
export const AdminGallery: React.FC = () => {
  useDocumentTitle('Galerie');
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => api<{ photos: GalleryPhoto[] }>('/admin/gallery').then((r) => r.photos), []);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [del, setDel] = useState<GalleryPhoto | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      checkFiles(files);
      for (let i = 0; i < files.length; i += 10) {
        const batch = files.slice(i, i + 10);
        const fd = new FormData();
        batch.forEach((f) => fd.append('photos', f));
        fd.append('dimensions', JSON.stringify(await Promise.all(batch.map(readDims))));
        await api('/admin/gallery', { method: 'POST', form: fd });
      }
      toast(`${files.length} photo(s) ajoutée(s)`);
      reload();
    } catch (e: any) { toast(e.message, 'error'); } finally { setUploading(false); if (input.current) input.current.value = ''; }
  };
  const patch = async (p: GalleryPhoto, body: any) => { try { await api(`/admin/gallery/${p.id}`, { method: 'PATCH', body }); reload(); } catch (e: any) { toast(e.message, 'error'); } };
  const move = async (i: number, dir: number) => {
    const list = [...(data || [])];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setData(list);
    await api('/admin/gallery-order', { method: 'PUT', body: { ids: list.map((x) => x.id) } }).catch((e) => toast(e.message, 'error'));
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); upload(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))); }}>
      <PageHeader title="Galerie du studio" subtitle="Glissez-déposez vos photos ou importez-les depuis votre ordinateur. L’ordre ici est celui du site."
        actions={<Button icon={<Upload className="h-4 w-4" />} loading={uploading} onClick={() => input.current?.click()}>Importer des photos</Button>} />
      <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => upload(Array.from(e.target.files || []))} />
      <input ref={replaceInput} type="file" accept={ACCEPT} className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file || !editing) return;
        try {
          checkFiles([file]);
          const fd = new FormData(); fd.append('photo', file);
          const d = await readDims(file);
          if (d) { fd.append('width', String(d.width)); fd.append('height', String(d.height)); }
          const r = await api<{ photo: GalleryPhoto }>(`/admin/gallery/${editing.id}/replace`, { method: 'POST', form: fd });
          setEditing(r.photo); toast('Photo remplacée'); reload();
        } catch (err: any) { toast(err.message, 'error'); }
        e.target.value = '';
      }} />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <button onClick={() => input.current?.click()} className="w-full">
          <Empty icon={<ImagePlus className="h-8 w-8" />} title="Aucune photo pour l’instant" text="Importez les photos du studio : elles apparaîtront dans la galerie publique et sur l’accueil." />
        </button>
      )}
      {data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {data.map((p, i) => (
            <div key={p.id} className={cx('card group overflow-hidden', !p.is_public && 'opacity-60')}>
              <div className="relative aspect-[4/3] bg-ink-700">
                <SmartImage src={p.url} alt={p.title || ''} className="absolute inset-0" />
                <div className="absolute left-2 top-2 flex gap-1">{p.is_featured && <Badge tone="ember">En avant</Badge>}{!p.is_public && <Badge>Masquée</Badge>}</div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{p.title || <span className="text-bone-600">Sans titre</span>}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-bone-600 hover:text-bone disabled:opacity-20" aria-label="Avancer"><ArrowUp className="h-4 w-4 -rotate-90 sm:rotate-0" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === data.length - 1} className="rounded p-1.5 text-bone-600 hover:text-bone disabled:opacity-20" aria-label="Reculer"><ArrowDown className="h-4 w-4 -rotate-90 sm:rotate-0" /></button>
                  </div>
                  <div className="flex">
                    <button onClick={() => patch(p, { is_featured: !p.is_featured })} className={cx('rounded p-1.5', p.is_featured ? 'text-ember' : 'text-bone-600 hover:text-bone')} aria-label="Mettre en avant"><Star className={cx('h-4 w-4', p.is_featured && 'fill-ember')} /></button>
                    <button onClick={() => { setEditing(p); setForm({ title: p.title || '', description: p.description || '' }); }} className="rounded p-1.5 text-bone-600 hover:text-bone" aria-label="Modifier"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDel(p)} className="rounded p-1.5 text-bone-600 hover:text-[#F07A7A]" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier la photo"
        footer={<><Button variant="ghost" onClick={() => replaceInput.current?.click()} icon={<Replace className="h-4 w-4" />}>Remplacer l’image</Button><Button onClick={async () => { await patch(editing!, form); toast('Photo mise à jour'); setEditing(null); }}>Enregistrer</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div className="relative h-64 overflow-hidden rounded-xl"><SmartImage src={editing.url} alt="" fit="contain" className="absolute inset-0" /></div>
            <Field label="Titre"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={editing.is_featured} onChange={(v) => { patch(editing, { is_featured: v }); setEditing({ ...editing, is_featured: v }); }} label="Mise en avant" />
              <Toggle checked={!!editing.is_public} onChange={(v) => { patch(editing, { is_public: v }); setEditing({ ...editing, is_public: v }); }} label="Visible sur le site" />
            </div>
          </div>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} danger title="Supprimer cette photo ?" confirmLabel="Supprimer" message="La photo sera retirée de la galerie et supprimée du serveur."
        onConfirm={async () => { await api(`/admin/gallery/${del!.id}`, { method: 'DELETE' }); toast('Photo supprimée'); setDel(null); reload(); }} />
    </div>
  );
};
