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
  { label: 'Stockholm', value: 'Stockholm' },
  { label: 'Göteborg', value: 'Göteborg' },
  { label: 'Malmö', value: 'Malmö' },
  { label: 'Uppsala', value: 'Uppsala' },
  { label: 'Linköping', value: 'Linköping' },
  { label: 'Örebro', value: 'Örebro' },
  { label: 'Annat', value: 'Annat' },
];

export const GENDER_OPTIONS = [
  { label: 'Man', value: 'man' },
  { label: 'Kvinna', value: 'kvinna' },
  { label: 'Icke-binär', value: 'icke-binär' },
  { label: 'Vill ej uppge', value: 'vill-ej-uppge' },
  { label: 'Övrigt', value: 'övrigt' },
];
