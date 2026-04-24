'use client';

import { useParams } from 'next/navigation';
import QuotationForm from '../../../quotations/QuotationForm';

export default function EditProformaInvoice() {
  const { id } = useParams();
  
  return <QuotationForm id={id as string} type="proforma" />;
}
