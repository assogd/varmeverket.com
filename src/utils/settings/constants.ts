/**
 * Settings Page Constants
 * Centralized configuration for options, tabs, and form settings
 */

export type TabType = 'personal' | 'business' | 'account';

export const TABS: Array<{ id: TabType; label: string }> = [
  { id: 'personal', label: 'PERSONLIGT' },
  { id: 'business', label: 'VERKSAMHET' },
  { id: 'account', label: 'KONTO' },
];

export const LOCATION_OPTIONS = [
  { label: 'Stockholm', value: 'stockholm' },
  { label: 'Göteborg', value: 'goteborg' },
  { label: 'Malmö', value: 'malmo' },
  { label: 'Uppsala', value: 'uppsala' },
  { label: 'Linköping', value: 'linkoping' },
  { label: 'Örebro', value: 'örebro' },
  { label: 'Annat', value: 'annat' },
];

export const GENDER_OPTIONS = [
  { label: 'Man', value: 'man' },
  { label: 'Kvinna', value: 'kvinna' },
  { label: 'Icke-binär', value: 'icke-binär' },
  { label: 'Vill ej uppge', value: 'vill-ej-uppge' },
  { label: 'Övrigt', value: 'övrigt' },
];
