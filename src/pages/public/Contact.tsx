import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useDocumentTitle } from '../../lib/hooks';
import { weekdayFr } from '../../lib/format';
import { PageHero } from '../../components/site/Chrome';
import { Alert, Button, Field, Input, Textarea } from '../../components/ui';

// Le formulaire prépare un message WhatsApp que le visiteur envoie lui-même au studio
const Contact: React.FC = () => {
  useDocumentTitle('Contact');
  const { settings, openingHours } = useConfig();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', subject: params.get('service') ? `Devis — ${params.get('service')}` : '', message: '' });
  const [sent, setSent] = useState(false);
  const waNumber = String(settings.contact_phone || '').replace(/\D/g, '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Bonjour ${settings.studio_name},\n\nNom : ${form.name}\nE-mail : ${form.email}\nSujet : ${form.subject}\n\n${form.message}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setSent(true);
  };

  return (
    <div>
      <PageHero eyebrow="Contact" title={<>Parlons de <span className="serif-accent text-gradient">votre projet.</span></>}
        text="Une question, un devis, une visite du studio ? Écrivez-nous, l’équipe répond rapidement." />
      <section className="container-x grid gap-10 pb-24 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {settings.contact_phone && (
            <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="card flex items-center gap-4 p-6 transition hover:border-ember/40">
              <Phone className="h-6 w-6 text-ember" />
              <div><p className="text-xs uppercase tracking-wider text-bone-600">Téléphone</p><p className="font-display text-lg font-semibold">{settings.contact_phone}</p>{settings.contact_phone_2 && <p className="text-sm text-bone-400">{settings.contact_phone_2}</p>}</div>
            </a>
          )}
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-6 transition hover:border-ember/40">
              <MessageCircle className="h-6 w-6 text-ember" />
              <div><p className="text-xs uppercase tracking-wider text-bone-600">WhatsApp</p><p className="font-display text-lg font-semibold">Écrire au studio</p></div>
            </a>
          )}
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="card flex items-center gap-4 p-6 transition hover:border-ember/40">
              <Mail className="h-6 w-6 text-ember" />
              <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-bone-600">E-mail</p><p className="break-all font-display text-lg font-semibold">{settings.contact_email}</p>{settings.contact_email_2 && <p className="text-sm text-bone-400">{settings.contact_email_2}</p>}</div>
            </a>
          )}
          {settings.address && (
            <a href={settings.maps_url || '#'} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-4 p-6 transition hover:border-ember/40">
              <MapPin className="mt-1 h-6 w-6 text-ember" />
              <div>
                <p className="text-xs uppercase tracking-wider text-bone-600">Adresse</p>
                <p className="font-display text-lg font-semibold">{settings.address}</p>
                {openingHours.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-bone-400">
                    {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
                      const d = openingHours.find((x) => x.weekday === wd);
                      if (!d) return null;
                      return <li key={wd} className="flex justify-between gap-6"><span>{weekdayFr[wd]}</span><span>{d.is_open ? `${d.open_time} – ${d.close_time.replace('24:00', '00:00')}` : 'Fermé'}</span></li>;
                    })}
                  </ul>
                )}
              </div>
            </a>
          )}
        </div>
        <form onSubmit={submit} className="card space-y-5 p-6 sm:p-10 lg:col-span-7">
          <h2 className="text-2xl font-semibold">Envoyer un message</h2>
          {sent && <Alert tone="success">WhatsApp s’est ouvert avec votre message : il ne vous reste qu’à l’envoyer.</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></Field>
            <Field label="E-mail"><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></Field>
          </div>
          <Field label="Sujet"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          <Field label="Message"><Textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
          <Button type="submit" size="lg" icon={<Send className="h-4 w-4" />} disabled={!waNumber}>Envoyer via WhatsApp</Button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
