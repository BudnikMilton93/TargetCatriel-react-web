/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de base de datos...');

  // Limpiar datos existentes (en orden de dependencias)
  await prisma.asistencia.deleteMany();
  await prisma.respuesta.deleteMany();
  await prisma.contenido.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.bloqueRecurso.deleteMany();
  await prisma.bloqueAlumno.deleteMany();
  await prisma.bloque.deleteMany();
  await prisma.alumnoTutor.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.alumnoPerfil.deleteMany();
  await prisma.sobreNosotros.deleteMany();
  await prisma.galeria.deleteMany();
  await prisma.viaje.deleteMany();
  await prisma.noticia.deleteMany();
  await prisma.usuarioRol.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();

  console.log('✓ Base de datos limpiada');

  // ============================================================================
  // CREAR ROLES
  // ============================================================================

  const rolAdmin = await prisma.rol.create({
    data: { nombre: 'administrador' },
  });

  const rolProfesor = await prisma.rol.create({
    data: { nombre: 'profesor' },
  });

  const rolAlumno = await prisma.rol.create({
    data: { nombre: 'alumno' },
  });

  const rolMarketing = await prisma.rol.create({
    data: { nombre: 'marketing' },
  });

  console.log('✓ Roles creados');

  // ============================================================================
  // CREAR USUARIOS DE PRUEBA
  // ============================================================================

  // Admin
  const usuarioAdmin = await prisma.usuario.create({
    data: {
      nombre: 'Admin Target',
      email: 'admin@target.com',
      passwordHash: 'hashed_password_admin', // En producción, usar bcrypt
      roles: {
        create: {
          rolId: rolAdmin.id,
        },
      },
    },
  });

  // Profesor
  const usuarioProfesor = await prisma.usuario.create({
    data: {
      nombre: 'Prof. María García',
      email: 'maria@target.com',
      passwordHash: 'hashed_password_profesor',
      roles: {
        create: {
          rolId: rolProfesor.id,
        },
      },
    },
  });

  // Alumno 1
  const usuarioAlumno1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan@student.com',
      passwordHash: 'hashed_password_alumno1',
      roles: {
        create: {
          rolId: rolAlumno.id,
        },
      },
      alumniPerfil: {
        create: {
          fechaNacimiento: new Date('2008-05-15'),
          telefono: '+54 11 1234-5678',
        },
      },
    },
  });

  // Alumno 2
  const usuarioAlumno2 = await prisma.usuario.create({
    data: {
      nombre: 'Sofia López',
      email: 'sofia@student.com',
      passwordHash: 'hashed_password_alumno2',
      roles: {
        create: {
          rolId: rolAlumno.id,
        },
      },
      alumniPerfil: {
        create: {
          fechaNacimiento: new Date('2009-08-22'),
          telefono: '+54 11 8765-4321',
        },
      },
    },
  });

  // Marketing
  const usuarioMarketing = await prisma.usuario.create({
    data: {
      nombre: 'Marketing Team',
      email: 'marketing@target.com',
      passwordHash: 'hashed_password_marketing',
      roles: {
        create: {
          rolId: rolMarketing.id,
        },
      },
    },
  });

  console.log('✓ Usuarios de prueba creados');

  // ============================================================================
  // CREAR TUTORES
  // ============================================================================

  const tutor1 = await prisma.tutor.create({
    data: {
      nombre: 'Carlos Pérez',
      email: 'carlos.perez@email.com',
      telefono: '+54 11 9999-8888',
      relacion: 'padre',
    },
  });

  const tutor2 = await prisma.tutor.create({
    data: {
      nombre: 'Analía López',
      email: 'analia.lopez@email.com',
      telefono: '+54 11 7777-6666',
      relacion: 'madre',
    },
  });

  console.log('✓ Tutores creados');

  // ============================================================================
  // VINCULAR TUTORES CON ALUMNOS
  // ============================================================================

  await prisma.alumnoTutor.create({
    data: {
      alumnoId: usuarioAlumno1.id,
      tutorId: tutor1.id,
    },
  });

  await prisma.alumnoTutor.create({
    data: {
      alumnoId: usuarioAlumno2.id,
      tutorId: tutor2.id,
    },
  });

  console.log('✓ Alumnos vinculados con tutores');

  // ============================================================================
  // CREAR BLOQUES (Clases)
  // ============================================================================

  const bloque1 = await prisma.bloque.create({
    data: {
      profesorId: usuarioProfesor.id,
      nivel: 'A1',
      dias: 'Lunes y Miércoles',
      horaInicio: new Date('2024-01-01T16:00:00Z'),
      horaFin: new Date('2024-01-01T17:00:00Z'),
      anio: 2024,
    },
  });

  const bloque2 = await prisma.bloque.create({
    data: {
      profesorId: usuarioProfesor.id,
      nivel: 'A2',
      dias: 'Martes y Jueves',
      horaInicio: new Date('2024-01-01T17:30:00Z'),
      horaFin: new Date('2024-01-01T18:30:00Z'),
      anio: 2024,
    },
  });

  console.log('✓ Bloques (clases) creados');

  // ============================================================================
  // VINCULAR ALUMNOS CON BLOQUES
  // ============================================================================

  await prisma.bloqueAlumno.create({
    data: {
      bloqueId: bloque1.id,
      alumnoId: usuarioAlumno1.id,
      fechaInvitacion: new Date(),
    },
  });

  await prisma.bloqueAlumno.create({
    data: {
      bloqueId: bloque2.id,
      alumnoId: usuarioAlumno2.id,
      fechaInvitacion: new Date(),
    },
  });

  console.log('✓ Alumnos vinculados con bloques');

  // ============================================================================
  // CREAR RECURSOS DE BLOQUE
  // ============================================================================

  await prisma.bloqueRecurso.create({
    data: {
      bloqueId: bloque1.id,
      tipo: 'pdf',
      contenido: 'https://ejemplo.com/libros/A1-grammar.pdf',
      orden: 1,
    },
  });

  await prisma.bloqueRecurso.create({
    data: {
      bloqueId: bloque1.id,
      tipo: 'link',
      contenido: 'https://ejemplo.com/ejercicios/A1',
      orden: 2,
    },
  });

  console.log('✓ Recursos de bloque creados');

  // ============================================================================
  // CREAR MÓDULOS
  // ============================================================================

  const modulo1 = await prisma.modulo.create({
    data: {
      bloqueId: bloque1.id,
      creadoPor: usuarioProfesor.id,
      fecha: new Date('2024-01-08'),
      estado: 'habilitado',
    },
  });

  const modulo2 = await prisma.modulo.create({
    data: {
      bloqueId: bloque1.id,
      creadoPor: usuarioProfesor.id,
      fecha: new Date('2024-01-10'),
      estado: 'habilitado',
    },
  });

  console.log('✓ Módulos creados');

  // ============================================================================
  // CREAR CONTENIDOS
  // ============================================================================

  const contenido1 = await prisma.contenido.create({
    data: {
      moduloId: modulo1.id,
      tipo: 'texto',
      contenido: 'Bienvenidos a la lección sobre Present Simple',
      orden: 1,
    },
  });

  const contenido2 = await prisma.contenido.create({
    data: {
      moduloId: modulo1.id,
      tipo: 'actividad',
      contenido: 'Completa las oraciones con el verbo correcto',
      orden: 2,
    },
  });

  const contenido3 = await prisma.contenido.create({
    data: {
      moduloId: modulo2.id,
      tipo: 'pregunta',
      contenido: '¿Cuál es la forma correcta del verbo "to be" en tercera persona?',
      orden: 1,
    },
  });

  console.log('✓ Contenidos creados');

  // ============================================================================
  // CREAR RESPUESTAS
  // ============================================================================

  await prisma.respuesta.create({
    data: {
      contenidoId: contenido2.id,
      alumnoId: usuarioAlumno1.id,
      respuesta: 'I study English every day. He studies in the afternoon.',
      visibilidad: 'privado',
    },
  });

  await prisma.respuesta.create({
    data: {
      contenidoId: contenido3.id,
      alumnoId: usuarioAlumno1.id,
      respuesta: 'The correct form is "is" for third person singular',
      visibilidad: 'compartido',
    },
  });

  console.log('✓ Respuestas creadas');

  // ============================================================================
  // CREAR ASISTENCIAS
  // ============================================================================

  await prisma.asistencia.create({
    data: {
      moduloId: modulo1.id,
      alumnoId: usuarioAlumno1.id,
      presente: true,
    },
  });

  await prisma.asistencia.create({
    data: {
      moduloId: modulo2.id,
      alumnoId: usuarioAlumno1.id,
      presente: true,
    },
  });

  console.log('✓ Asistencias registradas');

  // ============================================================================
  // CREAR CONTENIDO PÚBLICO (Marketing)
  // ============================================================================

  // Noticias
  await prisma.noticia.create({
    data: {
      autorId: usuarioMarketing.id,
      titulo: 'Nuevos cursos intensivos para verano 2024',
      cuerpo: 'Tenemos disponibles cursos intensivos de 2 semanas durante el mes de enero...',
      imagen: 'https://ejemplo.com/img/noticia-verano.jpg',
      fecha: new Date('2024-01-01'),
    },
  });

  await prisma.noticia.create({
    data: {
      autorId: usuarioMarketing.id,
      titulo: 'Viaje educativo a Londres confirmado',
      cuerpo: 'Les informamos que nuestro viaje a Londres para los estudiantes de B1 y B2 está confirmado...',
      imagen: 'https://ejemplo.com/img/londres.jpg',
      fecha: new Date('2024-01-05'),
    },
  });

  console.log('✓ Noticias creadas');

  // Viajes
  await prisma.viaje.create({
    data: {
      autorId: usuarioMarketing.id,
      destino: 'Londres',
      fechaInicio: new Date('2024-06-15'),
      fechaFin: new Date('2024-06-22'),
      nivelRecomendado: 'B1',
      incluyeClases: true,
      precio: 1500.0,
      cupos: 20,
      reservasConfirmadas: 8,
    },
  });

  await prisma.viaje.create({
    data: {
      autorId: usuarioMarketing.id,
      destino: 'New York',
      fechaInicio: new Date('2024-07-01'),
      fechaFin: new Date('2024-07-10'),
      nivelRecomendado: 'B2',
      incluyeClases: true,
      precio: 2000.0,
      cupos: 15,
      reservasConfirmadas: 5,
    },
  });

  console.log('✓ Viajes creados');

  // Galería
  await prisma.galeria.create({
    data: {
      autorId: usuarioMarketing.id,
      tipo: 'foto',
      url: 'https://ejemplo.com/galeria/estudiantes-graduacion.jpg',
      orden: 1,
    },
  });

  await prisma.galeria.create({
    data: {
      autorId: usuarioMarketing.id,
      tipo: 'foto',
      url: 'https://ejemplo.com/galeria/clase-presencial.jpg',
      orden: 2,
    },
  });

  console.log('✓ Galería creada');

  // Sobre nosotros
  await prisma.sobreNosotros.create({
    data: {
      autorId: usuarioMarketing.id,
      contenido:
        'Target es una escuela de inglés con 30 años de experiencia. Nuestro método combina enseñanza tradicional con tecnología moderna...',
      imagen: 'https://ejemplo.com/img/target-aula.jpg',
    },
  });

  console.log('✓ Sección "Sobre nosotros" creada');

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================

  console.log('✅ Seeding completado exitosamente!');
  console.log('\n📊 Datos de prueba creados:');
  console.log('  • 4 Roles');
  console.log('  • 5 Usuarios (Admin, Profesor, 2 Alumnos, Marketing)');
  console.log('  • 2 Tutores vinculados con alumnos');
  console.log('  • 2 Bloques (clases)');
  console.log('  • 2 Módulos');
  console.log('  • 3 Contenidos');
  console.log('  • 2 Respuestas de alumno');
  console.log('  • 2 Registros de asistencia');
  console.log('  • 2 Noticias');
  console.log('  • 2 Viajes');
  console.log('  • 2 Fotos en galería');
  console.log('  • 1 Página "Sobre nosotros"');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
