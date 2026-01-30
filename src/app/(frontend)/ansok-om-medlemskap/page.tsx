'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FormRenderer, createField, createSection } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import { Heading } from '@/components/headings';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import { Button } from '@/components/ui';
import { VarmeverketIcon } from '@/components/icons';
import { submitForm } from '@/services/formService';
import clsx from 'clsx';
import PageLayout from '../../../components/layout/PageLayout';

const FORM_SLUG = 'medlemskap';

const PAGE_HEADER_TEXT = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Ansökan om medlemskap',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        tag: 'h1',
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'För att skapa ditt medlemskonto behöver vi bara några grundläggande uppgifter. När din registrering är klar får du tillgång till alla våra tjänster och medlemsförmåner.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
};

export default function AnsokOmMedlemskapPage() {
  const [submitted, setSubmitted] = useState(false);

  const formConfig: FormConfig = useMemo(
    () => ({
      sections: [
        createSection('Personuppgifter', [
          createField('email', 'E-postadress', 'email', {
            required: true,
            placeholder: 'din@epost.se',
            helpText: 'Obligatoriskt för medlemsansökan.',
          }),
          createField('name', 'För- och efternamn', 'text', {
            required: true,
            placeholder: 'Ditt offentliga visningsnamn',
          }),
          createField('mobile', 'Mobilnummer', 'tel', {
            required: true,
            placeholder: 'Ditt mobilnummer',
          }),
          createField('birthDate', 'Födelsedatum', 'date', {
            required: true,
            placeholder: 'MM/DD/ÅÅÅÅ',
          }),
          createField('location', 'Vart är du baserad?', 'select', {
            required: true,
            placeholder: 'Välj',
            options: [
              { label: 'Stockholm', value: 'stockholm' },
              { label: 'Göteborg', value: 'goteborg' },
              { label: 'Malmö', value: 'malmo' },
              { label: 'Övrigt', value: 'other' },
            ],
          }),
          createField(
            'gender',
            'Vilket kön identifierar du dig som?',
            'select',
            {
              required: true,
              options: [
                { label: 'Man', value: 'man' },
                { label: 'Kvinna', value: 'kvinna' },
                { label: 'Icke-binär', value: 'non-binary' },
                { label: 'Vill ej uppge', value: 'prefer-not-to-say' },
                { label: 'Övrigt', value: 'other' },
              ],
            }
          ),
        ]),
        createSection('Dina behov', [
          createField('needs', 'Beskriv dina behov', 'textarea', {
            required: false,
            placeholder: 'Berätta om dina behov...',
          }),
          createField('preferences', 'Preferenser', 'textarea', {
            placeholder: 'Eventuella preferenser...',
          }),
        ]),
        createSection('Uppgifter om din kreativa verksamhet', [
          createField('occupation', 'Sysselsättning', 'text', {
            required: false,
            placeholder: 'Fyll i här',
          }),
          createField(
            'creativeField',
            'Inom vilket område verkar du inom?',
            'select',
            {
              required: false,
              options: [
                { label: 'Visuell konst', value: 'visuell-konst' },
                { label: 'Scenkonst', value: 'scenkonst' },
                { label: 'Musik', value: 'musik' },
                { label: 'Litteratur och skrivande', value: 'litteratur' },
                { label: 'Övrigt', value: 'other' },
              ],
            }
          ),
          createField('creativeFieldOther', 'Vänligen specificera', 'text', {
            required: true,
            placeholder: 'Skriv här',
            showIf: (formValues) => formValues.creativeField === 'other',
          }),
          createField(
            'membershipMotivation',
            'Berätta med egna ord varför du söker medlemskap i Värmeverket och vad du hoppas kunna bidra med till vår community.',
            'textarea',
            {
              required: false,
              placeholder: 'Skriv här',
            }
          ),
        ]),
      ],
      submitButtonLabel: 'Ansök',
      submitButtonVariant: 'marquee',
      submitSectionTitle: 'Har du fyllt i alla uppgifter?',
      submitButtonClassName: 'text-[color:var(--color-bg)]',
      submitButtonSize: 'lg',
      showSuccessMessage: false,
      onSubmit: async formData => {
        await submitForm(FORM_SLUG, formData);
      },
      onSuccess: () => {
        setSubmitted(true);
      },
    }),
    []
  );

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 pt-12">
        <div className="w-full max-w-md space-y-6 text-center">
          <Heading variant="section" as="h2" center className="pb-2">
            Tack för din ansökan
          </Heading>
          <p className="font-mono">
            Vi behandlar din ansökan och återkommer till dig så snart som
            möjligt med nästa steg.
          </p>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full bg-transparent border-text text-text hover:bg-text hover:text-[color:var(--color-bg)]"
            >
              STÄNG
            </Button>
          </Link>
        </div>
        <Link href="/" className={clsx('mt-12')}>
          <VarmeverketIcon size={112} className="mx-auto" />
        </Link>
      </div>
    );
  }

  return (
    <PageLayout contentType="page" paddingBottom={true}>
      <PageHeaderTextOnly text={PAGE_HEADER_TEXT} />
      <div className="">
        <FormRenderer config={{ ...formConfig, title: undefined }} />
      </div>
    </PageLayout>
  );
}
