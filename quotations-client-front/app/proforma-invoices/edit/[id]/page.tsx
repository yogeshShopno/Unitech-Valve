'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import QuotationForm from '../../../quotations/QuotationForm';

export default function EditProformaInvoice() {
  const { id } = useParams();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuotationForm id={id as string} type="proforma" />
    </Suspense>
  );
}

