'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PASSWORD_MISMATCH_MESSAGE = 'Konfirmasi password tidak sama dengan password.';

function getPasswordConfirmationError(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : PASSWORD_MISMATCH_MESSAGE;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const confirmPasswordError = getPasswordConfirmationError(
    formData.password,
    formData.confirmPassword
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmPasswordError) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Pendaftaran gagal');
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <BackButton fallbackHref="/" />
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Bergabung dengan MemorialCare</h1>
          <p className="text-muted-foreground">
            Buat akun untuk mulai merencanakan
          </p>
        </div>

        <Card className="p-8 bg-card border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nama Depan</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Budi"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nama Belakang</label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Santoso"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nomor Telepon</label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+62-812-0000-0000"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kata Sandi</label>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                aria-invalid={Boolean(confirmPasswordError)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Konfirmasi Kata Sandi</label>
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi kata sandi Anda"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                aria-invalid={Boolean(confirmPasswordError)}
              />
              {confirmPasswordError && (
                <p className="text-sm text-destructive">{confirmPasswordError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || Boolean(confirmPasswordError)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
