'use client';

import { FormEvent, useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface EmailSignupCtaProps {
  title?: string;
  description?: string;
  compact?: boolean;
  source?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailSignupCta({
  title = 'Get updates and news',
  description = 'Join the METODIC learn list for practical updates, new playbooks, and fresh facilitation resources.',
  compact = false,
  source = 'metodic-education',
}: EmailSignupCtaProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!cleanFirstName) {
      setMessageType('error');
      setMessage('Please enter your first name.');
      return;
    }
    if (!cleanLastName) {
      setMessageType('error');
      setMessage('Please enter your last name.');
      return;
    }

    if (!cleanEmail) {
      setMessageType('error');
      setMessage('Please enter your email.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setMessageType('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    const { error } = await supabase.from('education_email_subscribers').insert({
      email: cleanEmail,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      source,
      tags: ['updates', 'news'],
      is_active: true,
    });

    setLoading(false);

    if (!error) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setMessageType('success');
      setMessage('You are on the list. You will receive updates and news.');
      return;
    }

    if (error.code === '23505') {
      setMessageType('success');
      setMessage('You are already on the updates list.');
      return;
    }

    setMessageType('error');
    setMessage('Could not add you to updates right now. Please try again.');
  };

  return (
    <Card className={compact ? '' : 'bg-muted/30'}>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon icon="carbon:email" className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-4 gap-3">
          <Input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
          <Input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="sm:col-span-2"
          />
          <Button type="submit" disabled={loading} className="sm:col-span-4 sm:justify-self-start">
            {loading ? 'Getting updates...' : 'Get updates'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          We only send updates and news. Unsubscribe anytime.
        </p>
        {message && (
          <p className={`text-sm mt-3 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
