import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.formData();
  const name = body.get('name') as string;
  const email = body.get('email') as string;
  const phone = (body.get('phone') as string) || '';
  const message = body.get('message') as string;

  if (!name || !email || !message) {
    return NextResponse.redirect(new URL(`/institution/${params.id}?error=missing_fields`, request.url));
  }

  const { error } = await supabase.from('contact_requests').insert({
    institution_id: params.id,
    name,
    email,
    phone,
    message,
  });

  if (error) {
    return NextResponse.redirect(new URL(`/institution/${params.id}?error=send_failed`, request.url));
  }

  return NextResponse.redirect(new URL(`/institution/${params.id}?sent=true`, request.url));
}
