import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

export default function Home() {
  const navigate = useNavigate();
  const [showEmpresasInfo, setShowEmpresasInfo] = useState(false);
  const [showEstudiantesInfo, setShowEstudiantesInfo] = useState(false);

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
    <Box sx={{ bgcolor: '#eaf1fb', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Header estilo INACAP */}
      <Box sx={{ 
        bgcolor: '#1976d2', 
        color: 'white', 
        py: { xs: 1, md: 2 }, 
        px: { xs: 1, sm: 2, md: 4 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxShadow: '0 4px 30px rgba(25,118,210,0.3)',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ 
          fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '-0.01em',
          fontFamily: '"Roboto", "Arial", sans-serif'
        }}>
          LEANMAKER
        </Typography>
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, 
          gap: { xs: 1, md: 2 } 
        }}>
          <IconButton color="inherit" onClick={() => scrollToSection('crecimiento-estudiantil')} sx={{ p: { xs: 1, md: 1.5 } }}><SchoolIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('impacto-empresas')} sx={{ p: { xs: 1, md: 1.5 } }}><BusinessIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('innovacion')} sx={{ p: { xs: 1, md: 1.5 } }}><InnovationIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('contacto')} sx={{ p: { xs: 1, md: 1.5 } }}><ContactSupportIcon /></IconButton>
        </Box>
      </Box>

      {/* 2. Hero Section - Estilo INACAP */}
      <Box sx={{ 
        bgcolor: '#0d47a1', 
        color: 'white',
        py: { xs: 6, sm: 8, md: 12 },
        minHeight: { xs: '70vh', sm: '75vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Typography variant="h1" fontWeight={900} gutterBottom sx={{ 
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '6rem' },
            lineHeight: { xs: 1, sm: 0.9 },
            color: 'white',
            textShadow: '0 4px 12px rgba(0,0,0,0.6)',
            mb: 2,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            fontFamily: '"Roboto", "Arial", sans-serif'
          }}>
            LEANMAKER
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ 
            mb: 1,
            fontSize: { xs: '1.6rem', md: '2.2rem' },
            lineHeight: 1.3,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
            textAlign: 'center',
            letterSpacing: '0.01em'
          }}>
            Construyendo el Futuro de la Educación
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 4,
            fontSize: { xs: '1.2rem', md: '1.4rem' },
            lineHeight: 1.5,
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            letterSpacing: '0.02em',
            fontWeight: 400
          }}>
            Conectamos estudiantes con empresas para crear impacto social positivo y transformar comunidades
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, sm: 3, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            mt: { xs: 3, md: 4 }
          }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 4, sm: 6, md: 8 },
                py: { xs: 2, sm: 2.5, md: 3 },
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                borderRadius: '50px',
                letterSpacing: '0.02em',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(25,118,210,0.5)'
                },
                transition: 'all 0.3s ease'
              }} 
              onClick={() => navigate('/login')}
            >
              INICIAR SESIÓN
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 4, sm: 6, md: 8 },
                py: { xs: 2, sm: 2.5, md: 3 },
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                borderColor: 'white',
                borderWidth: '2px',
                color: 'white',
                borderRadius: '50px',
                letterSpacing: '0.02em',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                },
                transition: 'all 0.3s ease'
              }} 
              onClick={() => navigate('/register')}
            >
              REGÍSTRATE
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 3. Sección de Dos Columnas - EMPRESAS y ESTUDIANTES */}
      <Box sx={{ py: { xs: 6, sm: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 3, sm: 4, md: 8 },
            alignItems: 'start'
          }}>
                         {/* Columna Izquierda - EMPRESAS */}
             <Box sx={{ 
               textAlign: 'center',
               display: 'flex',
               flexDirection: 'column',
               height: 'fit-content'
             }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}>
                                 <Box sx={{ 
                   width: '100%', 
                   maxWidth: { xs: '300px', sm: '350px', md: '400px' },
                   mx: 'auto'
                 }}>
                   <img 
                     src="/imagenes/Colaboración Académica.png" 
                     alt="Empresas" 
                     style={{ 
                       width: '100%', 
                       height: 'auto',
                       borderRadius: 16,
                       boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                       marginBottom: '1rem'
                     }} 
                   />
                 </Box>
                <Typography variant="h4" fontWeight={700} sx={{ 
                  mb: 2, 
                  color: '#0a2342',
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}>
                  EMPRESAS
                </Typography>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#0a2342',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  lineHeight: 1.4,
                  fontWeight: 500
                }}>
                  ¿Tienes un problema que un estudiante brillante podría ayudarte a resolver?
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 4, 
                  color: '#666',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                  Accede a talento joven, ágil y motivado, con el respaldo académico y metodológico de{' '}
                  <strong style={{ color: '#1976d2' }}>LEAN MAKER</strong>
                </Typography>
              </Box>
              
              {/* Botón Ver Más para Empresas */}
              <Box sx={{ mt: 'auto', pt: 2, width: '100%' }}>
                <Button 
                  variant="outlined" 
                  size="large" 
                  sx={{ 
                    fontWeight: 600, 
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    borderRadius: '25px',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(25,118,210,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }} 
                  onClick={() => setShowEmpresasInfo(!showEmpresasInfo)}
                >
                  {showEmpresasInfo ? 'Ocultar' : 'ver más...'}
                </Button>
              </Box>

              {/* Información Expandida para Empresas */}
              {showEmpresasInfo && (
                <Box sx={{ 
                  mt: 4, 
                  p: 4, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 3,
                  border: '2px solid #e3f2fd',
                  textAlign: 'left',
                  width: '100%'
                }}>
                  <Typography variant="h5" fontWeight={700} sx={{ 
                    mb: 3, 
                    color: '#1976d2',
                    textAlign: 'center'
                  }}>
                    ¿Cómo funciona?
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {[
                      'Propones un desafío real (Ej: "Reducir el tiempo de atención al cliente en un 30%", "Diseñar un modelo de economía circular para nuestros residuos").',
                      'Seleccionamos estudiantes ideales Por perfil, carrera, habilidades y motivación.',
                      'Trabajan con mentoría académica Durante 6–8 semanas, con metodología LEAN (ágil, iterativa, centrada en resultados).',
                      'Recibes soluciones aplicables Con presentación final, informe ejecutivo y prototipo (si aplica).',
                      'Tienes prioridad en contratación Y el estudiante gana experiencia real para su portafolio.'
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#1976d2', 
                          mt: 1.5, 
                          flexShrink: 0 
                        }} />
                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#0a2342' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: '#0a2342',
                    lineHeight: 1.5,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 500,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid #e3f2fd',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    "No necesitas un gran equipo para innovar. Solo necesitas el talento correcto, en el momento adecuado. Regístrate y descubre cómo los estudiantes pueden ayudarte a crecer."
                  </Typography>
                  
                  {/* Botón de Registro para Empresas */}
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                        fontWeight: 700, 
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                        borderRadius: '50px',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(25,118,210,0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }} 
                      onClick={() => navigate('/register?type=company')}
                    >
                      REGÍSTRATE AQUÍ
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

                         {/* Columna Derecha - ESTUDIANTES */}
             <Box sx={{ 
               textAlign: 'center',
               display: 'flex',
               flexDirection: 'column',
               height: 'fit-content'
             }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}>
                                 <Box sx={{ 
                   width: '100%', 
                   maxWidth: { xs: '300px', sm: '350px', md: '400px' },
                   mx: 'auto'
                 }}>
                   <img 
                     src="/imagenes/Herramientas para el Crecimiento Profesional.png" 
                     alt="Estudiantes" 
                     style={{ 
                       width: '100%', 
                       height: 'auto',
                       borderRadius: 16,
                       boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                       marginBottom: '1rem'
                     }} 
                   />
                 </Box>
                <Typography variant="h4" fontWeight={700} sx={{ 
                  mb: 2, 
                  color: '#0a2342',
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}>
                  ESTUDIANTES
                </Typography>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#0a2342',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  lineHeight: 1.4,
                  fontWeight: 500
                }}>
                  Tu portafolio no empieza al graduarte. Empieza{' '}
                  <span style={{ color: '#e91e63', fontWeight: 700 }}>hoy</span>, con un desafío real.
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 4, 
                  color: '#666',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                  Aprende haciendo. Resuelve problemas. Destaca antes de egresar.
                </Typography>
              </Box>
              
              {/* Botón Ver Más para Estudiantes */}
              <Box sx={{ mt: 'auto', pt: 2, width: '100%' }}>
                <Button 
                  variant="outlined" 
                  size="large" 
                  sx={{ 
                    fontWeight: 600, 
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    borderRadius: '25px',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(25,118,210,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }} 
                  onClick={() => setShowEstudiantesInfo(!showEstudiantesInfo)}
                >
                  {showEstudiantesInfo ? 'Ocultar' : 'ver más...'}
                </Button>
              </Box>

              {/* Información Expandida para Estudiantes */}
              {showEstudiantesInfo && (
                <Box sx={{ 
                  mt: 4, 
                  p: 4, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 3,
                  border: '2px solid #e3f2fd',
                  textAlign: 'left',
                  width: '100%'
                }}>
                  <Typography variant="h5" fontWeight={700} sx={{ 
                    mb: 3, 
                    color: '#1976d2',
                    textAlign: 'center'
                  }}>
                    ¿Cómo funciona?
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {[
                      'Tu portafolio comienza antes de egresar.',
                      '🔄 Paso a paso: De estudiante a solucionador',
                      'Regístrate en LEAN MAKER: Crea tu perfil con tus datos, carrera, habilidades, intereses y portafolio (si tienes). → Es rápido, gratuito y te abre puertas.',
                      'Explora desafíos reales de empresas: Navega por oportunidades en tu área: innovación, marketing, ingeniería, diseño, sostenibilidad, tecnología, finanzas, y más. → Cada desafío tiene una descripción clara, duración y requisitos.',
                      'Postúlate al desafío que te apasiona: Elige uno (o varios) y envía tu postulación con simple CLIC. → Puedes postularte y trabajar hasta en dos desafíos en paralelo, según el caso.',
                      'Forma parte de un equipo + mentoría académica: Si eres seleccionado, podrás apoyarte en los espacios multidisciplinario en FABLAB, COWORK, Fábrica 4.0. → Aprendes haciendo, con estructura y apoyo.',
                      'Trabaja 6–8 semanas con metodología LEAN: Enfócate en soluciones ágiles, iterativas y centradas en el impacto real. → Usa herramientas de innovación, prototipado, análisis de datos o diseño UX, según el tipo de proyecto.',
                      'Presenta tu solución y gana experiencia comprobable: Entrega tu proyecto final a la empresa y recibe retroalimentación. → Tu trabajo se incluye automáticamente en tu portafolio profesional en LEAN MAKER.',
                      'Destaca ante empleadores: Muchas empresas contratan a estudiantes que destacaron en sus desafíos. → Además, ganas certificados, referencias y conexiones reales.'
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#1976d2', 
                          mt: 1.5, 
                          flexShrink: 0 
                        }} />
                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#0a2342' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Mensaje Motivacional para Estudiantes */}
                  <Typography variant="h6" sx={{ 
                    color: '#0a2342',
                    lineHeight: 1.5,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 500,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid #e3f2fd',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    "Tu futuro profesional no espera. Con LEAN MAKER, lo construyes hoy. Regístrate y transforma tu carrera."
                  </Typography>
                  
                  {/* Botón de Registro para Estudiantes */}
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                        fontWeight: 700, 
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                        borderRadius: '50px',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(25,118,210,0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => navigate('/register?type=student')}
                    >
                      REGÍSTRATE AQUÍ
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 4. Sección Unificada - Proyectos Estudiantiles y Emprendimiento */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 4, md: 6 },
            alignItems: 'stretch'
          }}>
            {/* Columna Izquierda - Proyectos Emblemáticos */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* Título arriba */}
              <Typography variant="h4" fontWeight={700} sx={{ 
                mb: 4, 
                fontSize: { xs: '1.6rem', md: '2rem' },
                color: '#0a2342'
              }}>
                Proyectos Emblemáticos de Estudiantes Destacados
              </Typography>
              
              {/* Contenido: imagen a la izquierda, texto a la derecha */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                alignItems: 'flex-start',
                width: '100%'
              }}>
                {/* Imagen a la izquierda */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <img 
                    src="/imagenes/trabajando.png" 
                    alt="Proyectos Propios" 
                    style={{ 
                      width: '200px',
                      height: 'auto',
                      borderRadius: 16,
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }} 
                  />
                </Box>
                
                {/* Texto a la derecha */}
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                    Innovación Estudiantil
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      'Aplicaciones móviles innovadoras',
                      'Sistemas de gestión inteligentes',
                      'Plataformas educativas digitales',
                      'Soluciones de sostenibilidad'
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          bgcolor: '#f44336', 
                          mt: 1.5, 
                          flexShrink: 0 
                        }} />
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Columna Derecha - De Estudiante a Emprendedor */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* Título arriba */}
              <Typography variant="h4" fontWeight={700} sx={{ 
                mb: 4, 
                fontSize: { xs: '1.6rem', md: '2rem' },
                color: '#0a2342'
              }}>
                De Estudiante a{' '}
                <span style={{ color: '#e91e63' }}>Emprendedor</span>
              </Typography>
              
              {/* Contenido: texto a la izquierda, imagen a la derecha */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                alignItems: 'flex-start',
                width: '100%'
              }}>
                {/* Texto a la izquierda */}
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                    Historias de Éxito
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      'Startups tecnológicas exitosas',
                      'Empresas de consultoría',
                      'Plataformas digitales',
                      'Servicios innovadores'
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          bgcolor: '#4caf50', 
                          mt: 1.5, 
                          flexShrink: 0 
                        }} />
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                {/* Imagen a la derecha */}
                <Box sx={{ flex: '0 0 auto' }}>
                  <img 
                    src="/imagenes/Historias de Éxito.png" 
                    alt="Emprendimiento" 
                    style={{ 
                      width: '200px',
                      height: 'auto',
                      borderRadius: 16,
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 5. Sección de Testimonios */}
      <Box sx={{ py: { xs: 6, sm: 8, md: 12 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 2, 
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Testimonios
          </Typography>
          
          <Typography variant="h6" align="center" sx={{ 
            mb: 6, 
            color: '#666',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
            fontWeight: 400
          }}>
            Historias reales de transformación y éxito
          </Typography>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, sm: 4, md: 6 },
            alignItems: 'stretch'
          }}>
            {/* Testimonio de Estudiante */}
            <Box sx={{ 
              bgcolor: 'white',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              border: '2px solid #e3f2fd',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3
              }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 2
              }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  bgcolor: '#1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  🎓
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                    Juan Pérez
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    juan.perez@inacapmail.cl
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ 
                lineHeight: 1.7, 
                color: '#0a2342',
                fontStyle: 'italic',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}>
                "Resolví un problema de logística y ahora tengo mi primer caso en mi portafolio. La experiencia fue increíble y me abrió puertas que nunca imaginé."
              </Typography>
              
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '1px solid #e3f2fd',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  bgcolor: '#4caf50' 
                }} />
                <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  Proyecto Completado
                </Typography>
              </Box>
            </Box>

            {/* Testimonio de Empresa */}
            <Box sx={{ 
              bgcolor: 'white',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              border: '2px solid #e8f5e8',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3
              }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 2
              }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  bgcolor: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  🏢
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                    Lucía Amaya
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    lucia.amaya@gmail.com
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    Directora de Innovación - TechFlow Solutions
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ 
                lineHeight: 1.7, 
                color: '#0a2342',
                fontStyle: 'italic',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}>
                "Contratamos a un estudiante que resolvió nuestro desafío. Ahora es parte de nuestro equipo. El talento joven trae ideas frescas y energía."
              </Typography>
              
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '1px solid #e8f5e8',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  bgcolor: '#1976d2' 
                }} />
                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  Contratación Exitosa
                </Typography>
              </Box>
            </Box>

            {/* Testimonio de Universidad */}
            <Box sx={{ 
              bgcolor: 'white',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              border: '2px solid #fff3e0',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3
              }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 2
              }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  bgcolor: '#ff9800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  🎯
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                    Área de Vinculación con el Medio
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    INACAP
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ 
                lineHeight: 1.7, 
                color: '#0a2342',
                fontStyle: 'italic',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}>
                "Nuestros egresados salen con experiencia real. Es un cambio de paradigma que transforma la educación técnica y profesional en Chile."
              </Typography>
              
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '1px solid #fff3e0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  bgcolor: '#ff9800' 
                }} />
                <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 600 }}>
                  Innovación Educativa
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Call to Action para Testimonios */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                fontWeight: 600, 
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderColor: '#1976d2',
                color: '#1976d2',
                borderRadius: '25px',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(25,118,210,0.3)'
                },
                transition: 'all 0.3s ease'
              }} 
              onClick={() => navigate('/register')}
            >
              ¡Comparte Tu Historia!
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 6. Sección de Innovación Tecnológica */}
      <Box id="innovacion" sx={{ py: { xs: 5, sm: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
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
                Voluntariado Profesional Multidisciplinario
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 4, 
                lineHeight: 1.8, 
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: '#0a2342',
                textAlign: 'justify'
              }}>
                Mejorar la calidad de vida de las personas y comunidades a través del voluntariado profesional multidisciplinario de INACAP, presente en todo Chile.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 6.5. Sección de Ecosistema de Innovación INACAP */}
      <Box sx={{ 
        py: { xs: 5, sm: 6, md: 8 }, 
        bgcolor: 'white',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Typography variant="h4" fontWeight={700} align="center" sx={{ 
            mb: 4, 
            fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
            color: '#0a2342'
          }}>
            🌟 Ecosistema de Innovación INACAP
          </Typography>
          
          <Typography variant="h6" align="center" sx={{ 
            mb: 6, 
            color: '#1976d2',
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            fontWeight: 500
          }}>
            Cómo funciona nuestro sistema de colaboración interdisciplinaria
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 4, md: 6 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ 
                mb: 3, 
                color: '#0a2342',
                fontSize: { xs: '1.3rem', md: '1.5rem' }
              }}>
                🔄 Flujo de Trabajo
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                {[
                  '👨‍💼 Director de Carrera (PM) coordina todo el ecosistema',
                  '👥 Líderes y Delegados (Alumnos Ayudantes) ejecutan proyectos',
                  '🏗️ 5 Áreas Académicas: Tecnología, Diseño, Construcción, Salud y Administración',
                  '🎯 Proyectos específicos con impacto comunitario real'
                ].map((item, i) => (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: '#f8f9fa',
                    border: '1px solid #e3f2fd'
                  }}>
                    <Typography variant="body1" sx={{ 
                      color: '#0a2342',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.5
                    }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, width: '100%' }}>
              <img 
                src="/imagenes/filosofia.png" 
                alt="Ecosistema de Innovación INACAP" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: 'auto',
                  borderRadius: 16, 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
          </Box>

          {/* Descripción simple del ecosistema */}
          <Box sx={{ 
            mb: 4,
            p: 3,
            borderRadius: 2,
            background: '#f8f9fa',
            border: '1px solid #e3f2fd',
            textAlign: 'center'
          }}>
            <Typography variant="body1" sx={{ 
              color: '#0a2342',
              fontSize: { xs: '0.95rem', md: '1rem' },
              lineHeight: 1.6
            }}>
              <strong>Descripción del Ecosistema:</strong> Esta sección debe mostrar el flujo de trabajo del Director de Carrera → Líderes → 5 Áreas Académicas → Proyectos específicos, 
              incluyendo ejemplos como "Posiciona tu Pyme", "Masetero Sustentable", "Enseñanza Inmersiva", etc. 
              También debe explicar las colaboraciones interdisciplinarias entre áreas y cómo LEAN MAKER se integra con este sistema.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* 7. Sección de Eventos y Conferencias */}
      <Box sx={{ 
        py: { xs: 6, sm: 8, md: 12 }, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos de fondo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: '200px', sm: '250px', md: '300px' },
          height: { xs: '200px', sm: '250px', md: '300px' },
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
          pointerEvents: 'none'
        }} />
        
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} align="center" sx={{ 
            mb: 2, 
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎉 Eventos y Conferencias
          </Typography>
          
          <Typography variant="h6" align="center" sx={{ 
            mb: 6, 
            color: 'rgba(255,255,255,0.9)',
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            fontWeight: 400
          }}>
            Conectando Mentes, Construyendo Futuros
          </Typography>

          {/* Estadísticas destacadas */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, md: 4 }, 
            mb: 6,
            flexWrap: 'wrap'
          }}>
            {[
              { number: '50+', label: 'Eventos Anuales' },
              { number: '1000+', label: 'Participantes' },
              { number: '95%', label: 'Satisfacción' }
            ].map((stat, i) => (
              <Box key={i} sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                minWidth: '120px'
              }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
                  {stat.number}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 6, md: 8 }, 
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight={600} sx={{ 
                mb: 4, 
                color: 'white',
                fontSize: { xs: '1.4rem', md: '1.6rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                ✨ Experiencias Únicas
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 3 }}>
                {[
                  { 
                    title: 'Conferencias de Innovación',
                    description: 'Tecnología de vanguardia y tendencias emergentes',
                    icon: '🚀',
                    color: '#ff6b6b'
                  },
                  { 
                    title: 'Workshops Profesionales',
                    description: 'Desarrollo de habilidades prácticas y networking',
                    icon: '💼',
                    color: '#4ecdc4'
                  },
                  { 
                    title: 'Networking Empresarial',
                    description: 'Conexiones con líderes de la industria',
                    icon: '🤝',
                    color: '#45b7d1'
                  },
                  { 
                    title: 'Hackathons y Competencias',
                    description: 'Desafíos creativos y premios atractivos',
                    icon: '🏆',
                    color: '#96ceb4'
                  }
                ].map((item, i) => (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3,
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <Box sx={{
                      fontSize: '2rem',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ 
                        color: 'white', 
                        mb: 0.5,
                        fontSize: { xs: '1.1rem', md: '1.2rem' }
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.5
                      }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Call to Action */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  sx={{ 
                    fontWeight: 700, 
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                    boxShadow: '0 8px 25px rgba(255,107,107,0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ff5252, #ff6b6b)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(255,107,107,0.5)'
                    },
                    transition: 'all 0.3s ease',
                    borderRadius: 3
                  }} 
                  onClick={() => navigate('/register')}
                >
                  🎫 ¡Inscríbete a Próximos Eventos!
                </Button>
              </Box>
            </Box>
            
                         <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
               <img 
                 src="/imagenes/filosofia.png" 
                 alt="Eventos y Conferencias" 
                 style={{ 
                   width: '100%', 
                   maxWidth: '500px',
                   height: 'auto',
                   borderRadius: 16, 
                   boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                   display: 'block',
                   margin: '0 auto',
                   transition: 'transform 0.3s ease',
                   cursor: 'pointer'
                 }} 
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'scale(1.02)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'scale(1)';
                 }}
               />
             </Box>
          </Box>
        </Container>
      </Box>



                           {/* 18. CTA Final */}
        <Box sx={{ 
          bgcolor: '#0a2342', 
          color: 'white', 
          py: { xs: 6, sm: 8, md: 12 }, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0a2342 0%, #1a365d 100%)'
        }}>
          <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
              fontSize: { xs: '1.6rem', sm: '2rem', md: '3rem' },
              mb: 3
            }}>
              ¿Listo para transformar la educación y el talento del futuro?
            </Typography>
           <Typography variant="h6" sx={{ 
             mb: 6,
             fontSize: { xs: '1.1rem', md: '1.3rem' },
             lineHeight: 1.5,
             opacity: 0.9
           }}>
             Únete a LEAN MAKER hoy.
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

             {/* 19. Footer */}
       <Box sx={{ 
         bgcolor: '#0a2342', 
         color: 'white', 
         py: { xs: 3, sm: 4, md: 6 }, 
         textAlign: 'center',
         background: 'linear-gradient(135deg, #0a2342 0%, #1a365d 100%)'
       }} id="contacto">
         <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
           <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}>
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
            © {new Date().getFullYear()} Leanmaker - INACAP. Todos los derechos reservados 
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}