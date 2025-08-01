import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  TextField,
  Divider,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import HelpIcon from '@mui/icons-material/Help';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InnovationIcon from '@mui/icons-material/AutoAwesome';
import CommunityIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ToolIcon from '@mui/icons-material/Build';
import NewsIcon from '@mui/icons-material/Article';
import NetworkIcon from '@mui/icons-material/Share';
import RocketIcon from '@mui/icons-material/RocketLaunch';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ bgcolor: '#eaf1fb', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      
      {/* 1. Header con navegación futurista */}
      <Box sx={{ 
        bgcolor: '#0a2342', 
        color: 'white', 
        py: { xs: 1, md: 2 }, 
        px: { xs: 2, md: 4 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
        background: 'linear-gradient(135deg, #0a2342 0%, #1a365d 100%)'
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Leanmaker
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 } }}>
          <IconButton color="inherit" onClick={() => scrollToSection('crecimiento-estudiantil')} sx={{ p: { xs: 1, md: 1.5 } }}><SchoolIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('impacto-empresas')} sx={{ p: { xs: 1, md: 1.5 } }}><BusinessIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('innovacion')} sx={{ p: { xs: 1, md: 1.5 } }}><InnovationIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('contacto')} sx={{ p: { xs: 1, md: 1.5 } }}><ContactSupportIcon /></IconButton>
        </Box>
      </Box>

      {/* 2. Hero Section - Futurista con efectos iridiscentes */}
      <Box sx={{ 
        bgcolor: '#0a2342', 
        color: 'white', 
        py: { xs: 6, md: 12 }, 
        textAlign: 'center',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.1) 50%, rgba(255,193,7,0.1) 100%)',
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ 
            fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
            lineHeight: 1.1,
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Construyendo el Futuro de la Educación
          </Typography>
          <Typography variant="h5" sx={{ 
            mb: 4,
            fontSize: { xs: '1.1rem', md: '1.4rem' },
            lineHeight: 1.4,
            opacity: 0.9
          }}>
            Conectamos estudiantes con empresas para crear impacto social positivo y transformar comunidades
          </Typography>
          


          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, md: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 4, md: 6 },
                py: { xs: 2, md: 2.5 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                boxShadow: '0 8px 25px rgba(25,118,210,0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(25,118,210,0.4)'
                },
                transition: 'all 0.3s ease'
              }} 
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 4, md: 6 },
                py: { xs: 2, md: 2.5 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }} 
              onClick={() => navigate('/register')}
            >
            Regístrate
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 3. Sección de Crecimiento Estudiantil */}
      <Box id="crecimiento-estudiantil" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Historias de Transformación Estudiantil
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/practica.png" 
                alt="Crecimiento Estudiantil" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                De Estudiante a Profesional
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Desarrollo de habilidades técnicas y blandas',
                  'Experiencia en proyectos reales con empresas',
                  'Mentoría personalizada de expertos',
                  'Red de contactos profesionales'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 4. Sección de Impacto en Empresas */}
      <Box id="impacto-empresas" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Empresas que Transforman Comunidades
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Impacto Social Positivo
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Apoyo a empresas pequeñas y medianas',
                  'Innovación en procesos empresariales',
                  'Desarrollo de soluciones tecnológicas',
                  'Fortalecimiento de la economía local'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <BusinessIcon sx={{ color: '#ff9800', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/impacto.png" 
                alt="Impacto en Empresas" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 5. Sección de Innovación Tecnológica */}
      <Box id="innovacion" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Innovación al Servicio de la Comunidad
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/filosofia.png" 
                alt="Innovación Tecnológica" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Proyectos Tecnológicos Innovadores
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Desarrollo de aplicaciones móviles',
                  'Sistemas de gestión empresarial',
                  'Soluciones de automatización',
                  'Plataformas de e-commerce'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <InnovationIcon sx={{ color: '#9c27b0', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 6. Sección de Colaboración Académica */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Alianzas Estratégicas con INACAP y Más
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Colaboración Académica
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Programas de prácticas profesionales',
                  'Proyectos de investigación conjuntos',
                  'Eventos académicos y conferencias',
                  'Intercambio de conocimientos'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <SchoolIcon sx={{ color: '#2196f3', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/Colaboración Académica.png" 
                alt="Colaboración Académica" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 7. Sección de Proyectos Propios */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Proyectos Emblemáticos de Estudiantes Destacados
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/trabajando.png" 
                alt="Proyectos Propios" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Innovación Estudiantil
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Aplicaciones móviles innovadoras',
                  'Sistemas de gestión inteligentes',
                  'Plataformas educativas digitales',
                  'Soluciones de sostenibilidad'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <RocketIcon sx={{ color: '#f44336', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 8. Sección de Emprendimiento */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            De Estudiante a Emprendedor
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Historias de Éxito
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Startups tecnológicas exitosas',
                  'Empresas de consultoría',
                  'Plataformas digitales',
                  'Servicios innovadores'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/Historias de Éxito.png" 
                alt="Emprendimiento" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 9. Sección de Impacto Social */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Mejorando Comunidades a Través de la Tecnología
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/Mejorando Comunidades a Través de la Tecnología.png" 
                alt="Impacto Social" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Beneficios Comunitarios
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Fortalecimiento de la economía local',
                  'Creación de empleos sostenibles',
                  'Mejora de servicios comunitarios',
                  'Desarrollo de infraestructura digital'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CommunityIcon sx={{ color: '#ff9800', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 10. Sección de Eventos y Conferencias */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Conectando Mentes, Construyendo Futuros
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Eventos y Networking
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Conferencias de innovación tecnológica',
                  'Workshops de desarrollo profesional',
                  'Eventos de networking empresarial',
                  'Hackathons y competencias'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <EventIcon sx={{ color: '#9c27b0', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/filosofia.png" 
                alt="Eventos y Conferencias" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 11. Sección de Recursos y Herramientas */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Herramientas para el Crecimiento Profesional
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/Herramientas para el Crecimiento Profesional.png" 
                alt="Recursos y Herramientas" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Recursos Educativos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Tutoriales y guías prácticas',
                  'Plantillas de proyectos',
                  'Herramientas de desarrollo',
                  'Biblioteca de recursos digitales'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <ToolIcon sx={{ color: '#607d8b', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
          ))}
        </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 12. Sección de Noticias y Actualizaciones */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Últimas Noticias y Actualizaciones
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Novedades de la Plataforma
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Nuevas funcionalidades disponibles',
                  'Logros de estudiantes destacados',
                  'Colaboraciones con nuevas empresas',
                  'Eventos próximos en la agenda'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <NewsIcon sx={{ color: '#e91e63', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/vinculacion.png" 
                alt="Noticias y Actualizaciones" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 13. Sección de Comunidad y Networking */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Únete a Nuestra Comunidad de Innovadores
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/portada.png" 
                alt="Comunidad y Networking" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                Conecta y Colabora
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  'Grupos de interés especializados',
                  'Mentorías personalizadas',
                  'Redes de contactos profesionales',
                  'Oportunidades de colaboración'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <NetworkIcon sx={{ color: '#00bcd4', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 14. CTA Final */}
      <Box sx={{ 
        bgcolor: '#0a2342', 
        color: 'white', 
        py: { xs: 8, md: 12 }, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a2342 0%, #1a365d 100%)'
      }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
            fontSize: { xs: '2rem', md: '3rem' },
            mb: 3
          }}>
            ¿Listo para Transformar tu Futuro?
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 6,
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            lineHeight: 1.5,
            opacity: 0.9
          }}>
            Únete a Leanmaker y accede a oportunidades únicas de crecimiento profesional y desarrollo de proyectos innovadores.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              fontWeight: 700, 
              px: { xs: 6, md: 8 },
              py: { xs: 2.5, md: 3 },
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              boxShadow: '0 8px 25px rgba(25,118,210,0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(25,118,210,0.4)'
              },
              transition: 'all 0.3s ease'
            }} 
            onClick={() => navigate('/register')}
          >
            ¡Regístrate Ahora!
          </Button>
        </Container>
      </Box>

      {/* 15. Footer */}
      <Box sx={{ 
        bgcolor: '#0a2342', 
        color: 'white', 
        py: { xs: 4, md: 6 }, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a2342 0%, #1a365d 100%)'
      }} id="contacto">
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
            Leanmaker
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ 
            fontSize: { xs: '1rem', md: '1.1rem' },
            mb: 3
          }}>
            Plataforma de vinculación y gestión de proyectos para estudiantes y empresas.
          </Typography>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            © {new Date().getFullYear()} Leanmaker. Todos los derechos reservados 
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
