import api from '@gestep/shared/axios';

const mapActiveUser = (dto) => ({
  id: dto.idUsuario,
  nombre: dto.nombres?.trim() ?? '',
  apellido: dto.apellidos?.trim() ?? '',
  alias: dto.alias,
  email: dto.email,
  dni: dto.dni,
  matriculaRevista: dto.matriculaRevista ?? null,
  fechaNacimiento: dto.fechaNacimiento,
  rango: dto.nombreRango?.trim() ?? '',
  fuerza: dto.nombreFuerza?.trim() ?? '',
  agrupamiento: dto.nombreAgrupamiento ?? '',
  categoriaPersonal: dto.categoriaPersonal?.trim() ?? '',
  tipoUsuario: dto.tipoDeUsuario?.trim() || dto.tipoUsuario?.trim() || '',
  fechaAprobacion: dto.fechaAprobacion ?? null,
  fotoPerfil: dto.fotoPerfilUrl ?? null,
  ultimaEvaluacion: null,
});

const mapPendingUser = (dto) => ({
  id: dto.idUsuario,
  nombre: dto.nombres?.trim() ?? '',
  apellido: dto.apellidos?.trim() ?? '',
  alias: dto.alias,
  email: dto.email,
  dni: dto.dni,
  matriculaRevista: dto.matriculaRevista ?? null,
  fechaNacimiento: dto.fechaNacimiento,
  rango: dto.nombreRango?.trim() ?? '',
  fuerza: dto.nombreFuerza?.trim() ?? '',
  agrupamiento: dto.nombreAgrupamiento ?? '',
  categoriaPersonal: dto.categoriaPersonal?.trim() ?? '',
  tipoUsuario: dto.tipoDeUsuario?.trim() || dto.tipoUsuario?.trim() || '',
  fechaRegistro: dto.fechaRegistro ?? null,
  ultimoRechazo: dto.ultimoRechazo ?? null,
  fotoPerfil: dto.fotoPerfilUrl ?? null,
  ultimaEvaluacion: null,
});

export const usersService = {
  getActiveUsers: async () => {
    const { data } = await api.get('/api/user/active');
    return Array.isArray(data) ? data.map(mapActiveUser) : [];
  },
  getPendingUsers: async () => {
    const { data } = await api.get('/api/user/pending');
    return Array.isArray(data) ? data.map(mapPendingUser) : [];
  },
  approveUser: async (aliasUsuario) => {
    await api.post('/api/auth/approve', { aliasUsuario });
  },
  rejectUser: async (aliasUsuario, motivo) => {
    await api.post('/api/auth/reject', { aliasUsuario, motivo });
  },
};
