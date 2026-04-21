import React, { useState } from 'react';

const getInitials = (nombre, apellido) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();

export const UserAvatar = ({ src, nombre, apellido, imgClassName, placeholderClassName }) => {
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={`${nombre} ${apellido}`}
        className={imgClassName}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={placeholderClassName}>
      {getInitials(nombre, apellido)}
    </div>
  );
};
