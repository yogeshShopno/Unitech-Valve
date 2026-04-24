'use client';

import { useParams } from 'next/navigation';
import QuotationForm from '../../QuotationForm';

export default function EditQuotation() {
  const { id } = useParams();
  
  return <QuotationForm id={id as string} />;
}
