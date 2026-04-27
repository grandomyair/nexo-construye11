import { Routes } from '@angular/router';
import { idCard } from 'ionicons/icons';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'nexo-home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro-usuario',
    loadComponent: () => import('./registro-usuario/registro-usuario.page').then( m => m.RegistroUsuarioPage)
  },
  {
    path: 'perfil-profesional/:id',
    loadComponent: () => import('./perfil-profesional/perfil-profesional.page').then( m => m.PerfilProfesionalPage)
  },
  {
    path: 'actualizar-perfil-profesional/:id',
    loadComponent: () => import('./actualizar-perfil-profesional/actualizar-perfil-profesional.page').then( m => m.ActualizarPerfilProfesionalPage)
  },
  {
    path: 'nexo-home',
    loadComponent: () => import('./nexo-home/nexo-home.page').then( m => m.NexoHomePage)
  },
  {
    path: 'perfil-usuario/:id',
    loadComponent: () => import('./perfil-usuario/perfil-usuario.page').then( m => m.PerfilUsuarioPage)
  },
  {
    path: 'actualizar-perfil',
    loadComponent: () => import('./actualizar-perfil/actualizar-perfil.page').then( m => m.ActualizarPerfilPage)
  },
  {
    path: 'crear-perfil-profecional/:id',
    loadComponent: () => import('./crear-perfil-profecional/crear-perfil-profecional.page').then( m => m.CrearPerfilProfecionalPage)
  },
  {
    path: 'agenda-de-disponibilidad/:id',
    loadComponent: () => import('./agenda-de-disponibilidad/agenda-de-disponibilidad.page').then( m => m.AgendaDeDisponibilidadPage)
  },
  {
    path: 'acerca-de-nosotros',
    loadComponent: () => import('./acerca-de-nosotros/acerca-de-nosotros.page').then( m => m.AcercaDeNosotrosPage)
  },
  {
    path: 'politica-de-reservacion',
    loadComponent: () => import('./politica-de-reservacion/politica-de-reservacion.page').then( m => m.PoliticaDeReservacionPage)
  },
  {
    path: 'politica-de-cancelacion',
    loadComponent: () => import('./politica-de-cancelacion/politica-de-cancelacion.page').then( m => m.PoliticaDeCancelacionPage)
  },
  {
    path: 'politica-de-privacidad',
    loadComponent: () => import('./politica-de-privacidad/politica-de-privacidad.page').then( m => m.PoliticaDePrivacidadPage)
  },
  {
    path: 'terminos-y-condiciones',
    loadComponent: () => import('./terminos-y-condiciones/terminos-y-condiciones.page').then( m => m.TerminosYCondicionesPage)
  },
  {
    path: 'explorar-servicio',
    loadComponent: () => import('./explorar-servicio/explorar-servicio.page').then( m => m.ExplorarServicioPage)
  },
  {
    path: 'chat/:conversacionId',
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'conversaciones',
    loadComponent: () => import('./conversaciones/conversaciones.page').then( m => m.ConversacionesPage)
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./notificaciones/notificaciones.page').then( m => m.NotificacionesPage)
  },
  {
    path: 'mis-reservaciones',
    loadComponent: () => import('./mis-reservaciones/mis-reservaciones.page').then( m => m.MisReservacionesPage)
  },
  {
    path: 'calificar/:id',
    loadComponent: () => import('./calificar/calificar.page').then( m => m.CalificarPage)
  },
  {
    path: 'subir-proyecto/:id',
    loadComponent: () => import('./subir-proyecto/subir-proyecto.page').then( m => m.SubirProyectoPage)
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./solicitudes/solicitudes.page').then( m => m.SolicitudesPage)
  },
  {
    path: 'resenas/:id',
    loadComponent: () => import('./resenas/resenas.page').then( m => m.ResenasPage)
  },
  {
    path: 'recuperar-password',
    loadComponent: () => import('./recuperar-password/recuperar-password.page').then( m => m.RecuperarPasswordPage)
  },
  {
    path: 'acerca-de',
    loadComponent: () => import('./acerca-de/acerca-de.page').then( m => m.AcercaDePage)
  },
]; 