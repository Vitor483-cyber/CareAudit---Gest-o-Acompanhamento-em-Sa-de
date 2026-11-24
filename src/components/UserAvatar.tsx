import React, { useEffect, useState } from 'react';
import { getInitials } from '../utils/formatters';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  sizeClass?: string;
  textSizeClass?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  photoURL,
  sizeClass = 'w-9 h-9',
  textSizeClass = 'text-xs',
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  const label = name?.trim() || email?.trim() || 'Profissional de Saúde';
  const initials = getInitials(label);

  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt={`Foto de ${label}`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0`}
      />
    );
  }

  return (
    <span
      aria-label={label}
      className={`${sizeClass} rounded-full bg-[#1E3A8A] text-white font-bold ${textSizeClass} flex items-center justify-center shrink-0 select-none`}
    >
      {initials}
    </span>
  );
};
