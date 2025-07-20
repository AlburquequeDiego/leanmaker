import { useNavigate } from 'react-router-dom';
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
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import HelpIcon from '@mui/icons-material/Help';

export default function Home() {
  const navigate = useNavigate();

  // Función para hacer scroll suave a una sección
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#eaf1fb',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* Header fijo ) */}
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
        width: '100%'
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Leanmaker</Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 } }}>
          <IconButton color="inherit" onClick={() => scrollToSection('contacto')} sx={{ p: { xs: 1, md: 1.5 } }}><ContactSupportIcon /></IconButton>
          <IconButton color="inherit" onClick={() => scrollToSection('por-que-leanmaker')} sx={{ p: { xs: 1, md: 1.5 } }}><HelpIcon /></IconButton>
        </Box>
      </Box>

      {/* Hero principal */}
      <Box sx={{ 
        bgcolor: '#0a2342', 
        color: 'white', 
        py: { xs: 4, md: 8 }, 
        textAlign: 'center',
        width: '100%'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.2
          }}>
            Conecta tu talento con el mundo real
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 3,
            fontSize: { xs: '1rem', md: '1.25rem' },
            lineHeight: 1.4
          }}>
           Facilitamos la gestión de proyectos, prácticas y procesos de vinculación
            entre estudiantes universitarios y empresas, promoviendo el 
            crecimiento conjunto y el aprendizaje con propósito.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1, md: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 3, md: 5 },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                minWidth: { xs: '200px', sm: 'auto' }
              }} 
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="large" 
              sx={{ 
                fontWeight: 700, 
                px: { xs: 3, md: 5 },
                py: { xs: 1.5, md: 2 },
                bgcolor: 'white', 
                color: 'primary.main', 
                borderColor: 'primary.main',
                minWidth: { xs: '200px', sm: 'auto' }
              }} 
              onClick={() => navigate('/register')}
            >
              Regístrate
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Bloque de 3 tarjetas grandes */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: { xs: 3, md: 4 }, 
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {[{
            title: 'Crecimiento Personal',
            desc: 'Participa en proyectos con empresas y adquiere experiencia práctica.Desarrolla tu confianza, autonomía y habilidades blandas mientras participas en proyectos reales.',
            img: '/imagenes/practica.png',
          }, {
            title: 'Experiencias Transformadoras',
            desc: 'Vive desafíos que potencian tu desarrollo profesional y personal en entornos colaborativos.',
            img: '/imagenes/filosofia.png',
          }, {
            title: 'Formación Integral',
            desc: 'Integra conocimientos técnicos, mentoría y experiencia real para convertirte en un profesional completo.',
            img: '/imagenes/vinculacion.png',
          }].map((item, i) => (
            <Card key={i} sx={{ 
              flex: 1, 
              minWidth: { xs: '100%', sm: 280, lg: 260 }, 
              textAlign: 'center', 
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardMedia 
                component="img" 
                height="120" 
                image={item.img} 
                alt={item.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>{item.desc}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Bloque: ¿Cómo funciona? (lista con íconos e imagen) */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          alignItems: 'center', 
          gap: { xs: 4, md: 6 }
        }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <img 
              src="/imagenes/filosofia.png" 
              alt="Cómo funciona Leanmaker" 
              style={{ 
                width: '100%', 
                maxWidth: '500px',
                height: 'auto',
                borderRadius: 12, 
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                display: 'block',
                margin: '0 auto'
              }} 
            />
          </Box>
          <Box sx={{ flex: 2, width: '100%' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              ¿Cómo funciona Leanmaker?
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {[{
                icon: <CheckCircleIcon color="primary" />, text: 'Regístrate y crea tu perfil profesional.'
              }, {
                icon: <SchoolIcon color="primary" />, text: 'Explora proyectos y oportunidades de empresas.'
              }, {
                icon: <BusinessIcon color="primary" />, text: 'Conecta con empresas y mentores.'
              }, {
                icon: <GroupIcon color="primary" />, text: 'Participa en proyectos reales y crece profesionalmente.'
              }].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ mt: 0.5, flexShrink: 0 }}>{item.icon}</Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' } }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Bloque de 2 recuadros independientes con imagen y texto (proyectos destacados) */}
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: { xs: 3, md: 4 },
          alignItems: 'stretch'
        }}>
          {/* Card 1 */}
          <Card sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 280, lg: 260 }, 
            boxShadow: 2, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardMedia
              component="img"
              height="180"
              image="/imagenes/portada.png"
              alt="Red de Contactos"
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Red de Contactos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                Conecta de manera activa con empresas, mentores y otros estudiantes, 
                creando una red de contactos que te permitirá potenciar tu desarrollo profesional.
                Estas conexiones no solo facilitarán el acceso a oportunidades laborales, 
                sino que también te brindarán valiosas perspectivas y consejos de expertos en el 
                campo, favoreciendo tu crecimiento personal y académico.
              </Typography>
            </CardContent>
          </Card>
          {/* Card 2 */}
          <Card sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 280, lg: 260 }, 
            boxShadow: 2, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardMedia
              component="img"
              height="180"
              image="/imagenes/portada.png"
              alt="Crecimiento Profesional"
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Crecimiento Profesional
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                Desarrolla las habilidades clave que te prepararán para los retos del mundo laboral, 
                adquiriendo competencias técnicas, de comunicación y trabajo en equipo, esenciales 
                para destacar en el mercado. A través de experiencias prácticas y de aprendizaje, 
                estarás mejor preparado para afrontar los desafíos profesionales, con una sólida base 
                que te permitirá adaptarte y sobresalir en cualquier entorno de trabajo.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Bloque: ¿Por qué Leanmaker? (tres cuadros independientes) */}
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }} id="por-que-leanmaker">
        <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          ¿Por qué Leanmaker?
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: { xs: 3, md: 3 }, 
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {/* Card 1 */}
          <Card sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 220 }, 
            boxShadow: 2, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Inserción Laboral Temprana
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Facilita la inserción de estudiantes en el mundo laboral a través de proyectos reales y prácticas profesionales.
              </Typography>
            </CardContent>
          </Card>
          {/* Card 2 */}
          <Card sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 220 }, 
            boxShadow: 2, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Vinculación Empresa-Universidad
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Conecta empresas con talento joven, promoviendo la innovación y el desarrollo de proyectos colaborativos.
              </Typography>
            </CardContent>
          </Card>
          {/* Card 3 */}
          <Card sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 220 }, 
            boxShadow: 2, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Proyectos Reales
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Participa en proyectos reales, guiados por expertos, que potencian el aprendizaje y la experiencia profesional.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Bloque de 3 tarjetas grandes */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: { xs: 3, md: 4 }, 
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {[{
            title: 'Impacto Social Positivo',
            desc: 'El apoyo a empresas pequeñas fortalece la economía local y contribuye a la creación de empleos, lo que a su vez beneficia a la comunidad y la sociedad en general.',
            img: '/imagenes/impacto.png',
          }, {
            title: 'Experiencia en Proyectos Reales',
            desc: 'Los estudiantes pueden aplicar sus conocimientos en proyectos prácticos de empresas pequeñas, obteniendo horas de experiencia real que suman a su formación académica y profesional.',
            img: '/imagenes/trabajando.png',
          }, {
            title: 'Fortalecimiento de Redes Locales',
            desc: 'El trabajo con pequeñas empresas facilita la creación de una red de contactos y colaboraciones que favorece tanto a los estudiantes como a las empresas, contribuyendo al crecimiento de la comunidad empresarial local.',
            img: '/imagenes/redes1.png',
          }].map((item, i) => (
            <Card key={i} sx={{ 
              flex: 1, 
              minWidth: { xs: '100%', sm: 280, lg: 260 }, 
              textAlign: 'center', 
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardMedia 
                component="img" 
                height="120" 
                image={item.img} 
                alt={item.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>{item.desc}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Bloque: Te acompañamos en cada paso (solo texto) */}
      <Box sx={{ bgcolor: '#dbeafe', py: { xs: 4, md: 8 }, width: '100%' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h4" fontWeight={700} align="center" gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Te acompañamos en cada paso
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.5 }}>
            En Leanmaker, nuestro equipo y comunidad están siempre listos para apoyarte, resolver tus dudas y ayudarte a alcanzar tus metas profesionales.
          </Typography>
        </Container>
      </Box>

      {/* Bloque: ¿Listo para registrarte? (CTA grande) */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 4, md: 8 }, textAlign: 'center', width: '100%' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            ¿Listo para registrarte y transformar tu futuro?
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 4,
            fontSize: { xs: '1rem', md: '1.25rem' },
            lineHeight: 1.5
          }}>
            Únete a Leanmaker y accede a oportunidades únicas de crecimiento profesional personalizadas para ti.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            sx={{ 
              fontWeight: 700, 
              px: { xs: 3, md: 5 },
              py: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.9rem', md: '1rem' }
            }} 
            onClick={() => navigate('/register')}
          >
            Regístrate!
          </Button>
        </Container>
      </Box>

      {/* Bloque de filosofía de Leanmaker */}
      <Box sx={{ 
        bgcolor: '#eaf1fb', 
        py: { xs: 4, md: 8 }, 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%'
      }} id="contacto">
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 3, md: 6 }, 
            flexDirection: { xs: 'column', lg: 'row' }
          }}>
            <Box sx={{ flex: 1, width: '100%', textAlign: 'center' }}>
              <img 
                src="/imagenes/filosofia.png" 
                alt="Filosofía de Leanmaker" 
                style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  height: 'auto',
                  borderRadius: 12, 
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ 
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                color: '#0a2342',
                mb: 3
              }}>
                Nuestra Filosofía
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: '#1976d2',
                    mb: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}>
                    Misión
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.6,
                    color: '#333',
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    Conectar el talento universitario con las necesidades reales del mercado laboral, 
                    facilitando la inserción profesional de estudiantes a través de proyectos prácticos 
                    y experiencias significativas con empresas.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: '#1976d2',
                    mb: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}>
                    Visión
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.6,
                    color: '#333',
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    Ser la plataforma líder en CHILE que transforme la educación superior 
                    mediante la vinculación efectiva entre universidades, estudiantes y empresas, 
                    creando un ecosistema de aprendizaje y crecimiento profesional sostenible.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: '#1976d2',
                    mb: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}>
                    Valores Fundamentales
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.6,
                    color: '#333',
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    <strong>Excelencia:</strong> Buscamos la calidad en cada proyecto y experiencia.<br/>
                    <strong>Innovación:</strong> Fomentamos la creatividad y el pensamiento disruptivo.<br/>
                    <strong>Colaboración:</strong> Creemos en el poder del trabajo en equipo.<br/>
                    <strong>Impacto Social:</strong> Contribuimos al desarrollo de nuestra comunidad.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        bgcolor: '#0a2342', 
        color: 'white', 
        py: { xs: 3, md: 4 }, 
        mt: 6, 
        textAlign: 'center',
        width: '100%'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Leanmaker
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Plataforma de vinculación y gestión de proyectos para estudiantes y empresas.
          </Typography>
          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
            © {new Date().getFullYear()} Leanmaker. Todos los derechos reservados 
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
