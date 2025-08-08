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
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

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
      
      {/* 1. Header estilo INACAP */}
      <Box sx={{ 
        bgcolor: '#1976d2', 
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
        boxShadow: '0 4px 30px rgba(25,118,210,0.3)',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ 
          fontSize: { xs: '1.3rem', md: '1.5rem' },
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          LEANMAKER
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 } }}>
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
        py: { xs: 8, md: 16 }, 
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
          background: 'linear-gradient(45deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.1) 50%, rgba(255,193,7,0.1) 100%)',
          zIndex: 1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #1976d2, transparent)',
          animation: 'glow 3s ease-in-out infinite alternate',
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Typography variant="h1" fontWeight={900} gutterBottom sx={{ 
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            lineHeight: 1.1,
            color: 'white',
            textShadow: '0 4px 8px rgba(0,0,0,0.5)',
            mb: 3
          }}>
            LEANMAKER
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ 
            mb: 6,
            fontSize: { xs: '1.5rem', md: '2rem' },
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Construyendo el Futuro de la Educación
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 6,
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            lineHeight: 1.6,
            opacity: 0.8,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Conectamos estudiantes con empresas para crear impacto social positivo y transformar comunidades
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 6, md: 8 },
                py: { xs: 2.5, md: 3 },
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                borderRadius: '50px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(25,118,210,0.5)'
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
                px: { xs: 6, md: 8 },
                py: { xs: 2.5, md: 3 },
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                borderColor: 'white',
                borderWidth: '2px',
                color: 'white',
                borderRadius: '50px',
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
              Regístrate
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 3. Sección de Noticias - Estilo INACAP */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 6,
            pl: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              width: '4px', 
              height: '40px', 
              bgcolor: '#1976d2', 
              mr: 3,
              borderRadius: '2px'
            }} />
            <Typography variant="h3" fontWeight={700} sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#0a2342'
            }}>
              Noticias
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {/* Noticia 1 */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image="/imagenes/practica.png"
                alt="Tecnológica 2023"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  TECNOLÓGICA 2023
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Un encuentro que impulsa la innovación y el futuro de la educación técnica.
                </Typography>
              </CardContent>
            </Card>

            {/* Noticia 2 */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image="/imagenes/filosofia.png"
                alt="Colaboración Académica"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  COLABORACIÓN ACADÉMICA
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Leanmaker y empresas líderes firman convenios de colaboración estratégica.
                </Typography>
              </CardContent>
            </Card>

            {/* Noticia 3 */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image="/imagenes/trabajando.png"
                alt="Crecimiento Profesional"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  CRECIMIENTO PROFESIONAL
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Formando profesionales para el futuro del mercado laboral tecnológico.
                </Typography>
              </CardContent>
            </Card>

            {/* Noticia 4 */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image="/imagenes/Historias de Éxito.png"
                alt="Historias de Éxito"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  HISTORIAS DE ÉXITO
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Conoce a nuestros estudiantes que están transformando la industria.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* 4. Banner Leanmaker Sostenible */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        bgcolor: '#f8f9fa',
        color: '#0a2342',
        textAlign: 'center'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4
          }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3
              }}>
                <VolunteerActivismIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                LEANMAKER SOSTENIBLE
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Nuestro compromiso con el desarrollo sustentable y la responsabilidad social.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  fontWeight: 700, 
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                  boxShadow: '0 8px 25px rgba(76,175,80,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(76,175,80,0.4)'
                  },
                  transition: 'all 0.3s ease'
                }} 
                onClick={() => navigate('/register')}
              >
                Conoce más
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 5. Sección Por qué Estudiar en Leanmaker */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 6,
            pl: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              width: '4px', 
              height: '40px', 
              bgcolor: '#1976d2', 
              mr: 3,
              borderRadius: '2px'
            }} />
            <Typography variant="h3" fontWeight={700} sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#0a2342'
            }}>
              Por qué estudiar en Leanmaker?
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src="/imagenes/practica.png" 
                alt="Alta Empleabilidad" 
                style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  height: 'auto',
                  borderRadius: 12,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }} 
              />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, color: '#0a2342' }}>
                ALTA EMPLEABILIDAD
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src="/imagenes/trabajando.png" 
                alt="Crecimiento Profesional" 
                style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  height: 'auto',
                  borderRadius: 12,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }} 
              />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, color: '#0a2342' }}>
                CRECIMIENTO PROFESIONAL
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 6. Banner Qué Buscamos */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        bgcolor: '#e3f2fd',
        color: '#0a2342'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            pl: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              width: '4px', 
              height: '40px', 
              bgcolor: '#1976d2', 
              mr: 3,
              borderRadius: '2px'
            }} />
            <Typography variant="h3" fontWeight={700} sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#0a2342'
            }}>
              Qué buscamos?
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.8, textAlign: 'center', color: '#0a2342' }}>
            En Leanmaker, buscamos personas con pasión por aprender y crecer, comprometidas con la innovación y el impacto social.
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: 6,
                py: 2.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(25,118,210,0.5)'
                },
                transition: 'all 0.3s ease'
              }} 
              onClick={() => navigate('/register')}
            >
              Postula aquí
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 7. Sección de Impacto Leanmaker - Estilo INACAP */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 6,
            pl: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              width: '4px', 
              height: '40px', 
              bgcolor: '#1976d2', 
              mr: 3,
              borderRadius: '2px'
            }} />
            <Typography variant="h3" fontWeight={700} sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#0a2342'
            }}>
              Impacto Leanmaker
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {/* Impacto 1 - Mujeres STEM */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(255,107,157,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(255,107,157,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <PsychologyIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  MUJERES STEM
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Impulsando la participación femenina en áreas de ciencia y tecnología.
                </Typography>
              </CardContent>
            </Card>

            {/* Impacto 2 - Impacta Leanmaker */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(102,126,234,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(102,126,234,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <EmojiEventsIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  IMPACTA LEANMAKER
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Proyectos que generan un impacto positivo en la sociedad.
                </Typography>
              </CardContent>
            </Card>

            {/* Impacto 3 - Observatorio */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(79,172,254,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(79,172,254,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <TrendingUpIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  OBSERVATORIO
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Datos y análisis sobre el mercado laboral tecnológico.
                </Typography>
              </CardContent>
            </Card>

            {/* Impacto 4 - Emplea Leanmaker */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(67,233,123,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(67,233,123,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <WorkIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  EMPLEA LEANMAKER
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Conectando a nuestros estudiantes con oportunidades laborales.
                </Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{ 
                    mt: 2,
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }} 
                  onClick={() => navigate('/register')}
                >
                  Ver ofertas
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* 8. Sección de Crecimiento Estudiantil */}
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
            Empresas que Transforman{' '}
            <span style={{ color: '#e91e63' }}>Comunidades</span>
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mt: 4
          }}>
            {/* Tarjeta 1 */}
            <Card sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  APOYO A PYMES
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fortalecemos empresas pequeñas y medianas
                </Typography>
              </CardContent>
            </Card>

            {/* Tarjeta 2 */}
            <Card sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <InnovationIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  INNOVACIÓN DIGITAL
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modernizamos procesos empresariales
                </Typography>
              </CardContent>
            </Card>

            {/* Tarjeta 3 - Destacada */}
            <Card sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              border: '2px solid #ff9800',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #fff3e0 100%)',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <ToolIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#ff9800' }}>
                  SOLUCIONES TECNOLÓGICAS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Desarrollamos herramientas a medida
                </Typography>
              </CardContent>
            </Card>

            {/* Tarjeta 4 */}
            <Card sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <CommunityIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0a2342' }}>
                  ECONOMÍA LOCAL
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fortalecemos la economía de la comunidad
                </Typography>
              </CardContent>
            </Card>
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

      {/* 6. Sección de Agenda de Habilidades - Estilo INACAP */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 6,
            pl: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              width: '4px', 
              height: '40px', 
              bgcolor: '#1976d2', 
              mr: 3,
              borderRadius: '2px'
            }} />
            <Typography variant="h3" fontWeight={700} sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#0a2342'
            }}>
              Agenda de Habilidades
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {/* Habilidad 1 - Formación Profesional */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              boxShadow: '0 8px 25px rgba(168,237,234,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(168,237,234,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <SchoolIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0a2342' }}>
                  ENCUENTRO DE FORMACIÓN PROFESIONAL
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Desafíos de la educación técnica y profesional en la era digital.
                </Typography>
              </CardContent>
            </Card>

            {/* Habilidad 2 - Formación Continua */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              boxShadow: '0 8px 25px rgba(255,236,210,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(255,236,210,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <TrendingUpIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0a2342' }}>
                  INICIATIVA DE FORMACIÓN CONTINUA
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Actualizando conocimientos para el mundo laboral del futuro.
                </Typography>
              </CardContent>
            </Card>

            {/* Habilidad 3 - Fondos Concursables */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)',
              boxShadow: '0 8px 25px rgba(168,202,186,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(168,202,186,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #43e97b, #38f9d7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <EmojiEventsIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0a2342' }}>
                  FONDOS CONCURSABLES
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Apoyando proyectos innovadores de nuestros estudiantes.
                </Typography>
                <Box sx={{ 
                  mt: 2,
                  p: 1,
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  display: 'inline-block'
                }}>
                  <Typography variant="caption" sx={{ color: '#0a2342', fontWeight: 600 }}>
                    QR Code
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Habilidad 4 - Historia de Leanmaker */}
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              boxShadow: '0 8px 25px rgba(240,147,251,0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(240,147,251,0.4)'
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <EventIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0a2342' }}>
                  LEANMAKER EN LA HISTORIA
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Un recorrido por nuestra trayectoria de innovación y crecimiento.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* 7. Sección de Colaboración Académica */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={700} align="center" sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: '#0a2342'
          }}>
            Alianzas Estratégicas con{' '}
            <span style={{ color: '#e91e63' }}>INACAP y Más</span>
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Tarjeta 1 - Top Left */}
            <Card sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#9c27b0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <SchoolIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                  Prácticas Profesionales
                </Typography>
              </CardContent>
            </Card>

            {/* Tarjeta 2 - Top Right */}
            <Card sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '2px solid #2196f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <InnovationIcon sx={{ fontSize: 30, color: '#2196f3' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                  Investigación Conjunta
                </Typography>
              </CardContent>
            </Card>

            {/* Tarjeta 3 - Bottom Left */}
            <Card sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '2px solid #ff9800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <EventIcon sx={{ fontSize: 30, color: '#ff9800' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                  Eventos Académicos
                </Typography>
              </CardContent>
            </Card>

            {/* Tarjeta 4 - Bottom Right */}
            <Card sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '2px solid #4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <NetworkIcon sx={{ fontSize: 30, color: '#4caf50' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ color: '#0a2342' }}>
                  Intercambio de Conocimientos
                </Typography>
              </CardContent>
            </Card>
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
          <Box sx={{ 
            mb: 6, 
            display: 'flex', 
            alignItems: 'center',
            pl: { xs: 2, md: 4 }
          }}>
            <Typography variant="h3" fontWeight={700} sx={{ 
              fontSize: { xs: '2.5rem', md: '3rem' },
              color: '#0a2342',
              lineHeight: 1.2
            }}>
              De Estudiante a{' '}
              <span style={{ color: '#e91e63' }}>Emprendedor</span>
            </Typography>
          </Box>
          
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
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
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
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
          pointerEvents: 'none'
        }} />
        
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} align="center" sx={{ 
            mb: 2, 
            fontSize: { xs: '2.2rem', md: '3rem' },
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
              <Box sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '10px',
                  bottom: '10px',
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
                  borderRadius: 20,
                  zIndex: -1,
                  opacity: 0.3
                }
              }}>
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
<Box sx={{ 
  py: { xs: 6, md: 8 }, 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  overflow: 'hidden'
}}>
  <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
    <Typography variant="h3" fontWeight={700} align="center" sx={{ 
      mb: 6, 
      fontSize: { xs: '2rem', md: '2.5rem' },
      color: 'white',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    }}>
      📰 Últimas{' '}
      <span style={{ color: '#FFD700' }}>Noticias</span>{' '}
      y Actualizaciones
    </Typography>
    
    {/* Grid de Noticias */}
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
      gap: 4,
      mb: 6
    }}>
      {/* Noticia 1 */}
      <Card sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: 3,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}>
        <CardContent>
          <Box sx={{ 
            mb: 3,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <NewsIcon sx={{ fontSize: 35, color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#667eea' }}>
            Nuevas Funcionalidades
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Descubre las últimas herramientas disponibles
          </Typography>
          <Chip 
            label="¡Nuevo!" 
            sx={{ 
              backgroundColor: '#667eea', 
              color: 'white',
              fontWeight: 600
            }} 
          />
        </CardContent>
      </Card>

      {/* Noticia 2 */}
      <Card sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: 3,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}>
        <CardContent>
          <Box sx={{ 
            mb: 3,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #f093fb, #f5576c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <TrendingUpIcon sx={{ fontSize: 35, color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#f093fb' }}>
            Estudiantes Destacados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Conoce los logros de nuestros estudiantes
          </Typography>
          <Chip 
            label="¡Éxito!" 
            sx={{ 
              backgroundColor: '#f093fb', 
              color: 'white',
              fontWeight: 600
            }} 
          />
        </CardContent>
      </Card>

      {/* Noticia 3 */}
      <Card sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: 3,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}>
        <CardContent>
          <Box sx={{ 
            mb: 3,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <BusinessIcon sx={{ fontSize: 35, color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#4facfe' }}>
            Nuevas Colaboraciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Empresas que se unen a nuestro proyecto
          </Typography>
          <Chip 
            label="¡Colaboración!" 
            sx={{ 
              backgroundColor: '#4facfe', 
              color: 'white',
              fontWeight: 600
            }} 
          />
        </CardContent>
      </Card>

      {/* Noticia 4 */}
      <Card sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: 3,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}>
        <CardContent>
          <Box sx={{ 
            mb: 3,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #43e97b, #38f9d7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <EventIcon sx={{ fontSize: 35, color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#43e97b' }}>
            Eventos Próximos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No te pierdas nuestros próximos eventos
          </Typography>
          <Chip 
            label="¡Próximo!" 
            sx={{ 
              backgroundColor: '#43e97b', 
              color: 'white',
              fontWeight: 600
            }} 
          />
        </CardContent>
      </Card>
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