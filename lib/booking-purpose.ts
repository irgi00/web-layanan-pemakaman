export interface BookingDeceasedProfileSummary {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date | null;
  dateOfDeath?: string | Date | null;
  biography?: string | null;
}

export function getDeceasedFullName(
  profile: BookingDeceasedProfileSummary | null | undefined
) {
  if (!profile) {
    return '';
  }

  return [profile.firstName, profile.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ');
}

export function hasDeceasedProfile(
  profile: BookingDeceasedProfileSummary | null | undefined
) {
  return Boolean(getDeceasedFullName(profile));
}

export function getBookingPurposeLabel(
  profile: BookingDeceasedProfileSummary | null | undefined
) {
  return hasDeceasedProfile(profile)
    ? 'Untuk pemakaman saat ini'
    : 'Untuk persiapan masa depan';
}

export function getFuturePreparationBookingLabel() {
  return 'Booking persiapan masa depan';
}

export function getFuturePreparationDescription() {
  return 'Data almarhum/almarhumah belum diisi karena booking ini dapat digunakan untuk persiapan masa depan.';
}
