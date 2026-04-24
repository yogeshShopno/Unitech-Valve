'use client';

import { Suspense } from 'react';
import QuotationForm from '../QuotationForm';

export default function NewQuotation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuotationForm />
    </Suspense>
  );
}