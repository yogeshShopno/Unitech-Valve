'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import QuotationForm from '../../QuotationForm';

export default function EditQuotation() {
  const { id } = useParams();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuotationForm id={id as string} />
    </Suspense>
  );
}

