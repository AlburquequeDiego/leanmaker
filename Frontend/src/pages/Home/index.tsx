import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Card, CardContent, CardMedia } from '@mui/material';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        background: `url("/imagenes/fondo2.png") no-repeat center center/cover`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 0,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          maxWidth: 500,
          mx: 'auto',
          my: 8,
          p: 4,
          bgcolor: 'white',
          border: '2px solid #2196f3',
          borderRadius: 3,
          boxShadow: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Leanmaker
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Impulsando el Talento, Conectando Empresas y Estudiantes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Plataforma integral para la gestión de proyectos, prácticas y vinculación entre empresas y estudiantes universitarios.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ mr: 2, mb: { xs: 2, md: 0 }, borderRadius: 50 }}
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ borderRadius: 50 }}
          onClick={() => navigate('/register')}
        >
          Regístrate aquí
        </Button>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
          ¿Por qué Leanmaker?
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mt: 2,
          }}
        >
          <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
            <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardMedia
                component="img"
                image="/imagenes/insercion.png"
                alt="Inserción"
                sx={{ height: 120, objectFit: 'contain', mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={500} gutterBottom>
                  Inserción Laboral
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Facilita la inserción de estudiantes en el mundo laboral a través de proyectos reales y prácticas profesionales.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
            <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardMedia
                component="img"
                image="/imagenes/vinculacion.png"
                alt="Vinculación"
                sx={{ height: 120, objectFit: 'contain', mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={500} gutterBottom>
                  Vinculación Empresa-Universidad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conecta empresas con talento joven, promoviendo la innovación y el desarrollo de 
                  proyectos colaborativos.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardMedia
                component="img"
                image="/imagenes/filosofia.png"
                alt="Proyectos"
                sx={{ height: 120, objectFit: 'contain', mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={500} gutterBottom>
                  Proyectos Reales
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participa en proyectos reales, guiados por expertos, que potencian el aprendizaje 
                  y la experiencia profesional.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Blog/Noticias Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
          Actualidad y Comunidad
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mt: 2,
          }}
        >
          <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                image="/imagenes/portada.png"
                alt="Reunión con Expertos"
                sx={{ height: 200, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={500} gutterBottom>
                  Reunión con Expertos: Innovación en la Educación Superior
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Leanmaker organizó una mesa redonda con líderes de la industria y académicos para discutir el futuro de la formación profesional.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                image="/imagenes/fondo.png"
                alt="Blog Leanmaker"
                sx={{ height: 200, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={500} gutterBottom>
                  Lanzamiento de Leanmaker: Nueva Era de Vinculación
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Descubre cómo Leanmaker está transformando la relación entre empresas y universidades con tecnología y comunidad.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Sección extra 1: Imagen derecha */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Experiencia Práctica
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Participa en proyectos reales que te permitirán adquirir experiencia práctica 
            directamente en tu área profesional, enfrentando desafíos auténticos y aplicando 
            lo aprendido en situaciones del mundo laboral. Esta experiencia te brindará una 
            visión más clara de las dinámicas de trabajo y te ayudará a fortalecer tus 
            habilidades técnicas y de gestión.
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <img src="/imagenes/practica.png" alt="Experiencia Práctica" style={{ maxWidth: 350, width: '100%' }} />
          </Box>
        </Box>
      </Container>

      {/* Sección extra 2: Imagen izquierda */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          alignItems: 'center',
          gap: 4,
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Red de Contactos
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Conecta de manera activa con empresas, mentores y otros estudiantes, 
            creando una red de contactos que te permitirá potenciar tu desarrollo profesional.
             Estas conexiones no solo facilitarán el acceso a oportunidades laborales, 
             sino que también te brindarán valiosas perspectivas y consejos de expertos en el 
             campo, favoreciendo tu crecimiento personal y académico.
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <img src="/imagenes/red.png" alt="Red de Contactos" style={{ maxWidth: 350, width: '100%' }} />
          </Box>
        </Box>
      </Container>

      {/* Sección extra 3: Imagen derecha */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Crecimiento Profesional
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Desarrolla las habilidades clave que te prepararán para los retos del mundo laboral, 
            adquiriendo competencias técnicas, de comunicación y trabajo en equipo, esenciales 
            para destacar en el mercado. A través de experiencias prácticas y de aprendizaje, 
            estarás mejor preparado para afrontar los desafíos profesionales, con una sólida base 
            que te permitirá adaptarte y sobresalir en cualquier entorno de trabajo.
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <img src="/imagenes/Crecimiento Profesional.png" alt="Crecimiento Profesional" style={{ maxWidth: 350, width: '100%' }} />
          </Box>
        </Box>
      </Container>

      {/* Sección de Contacto */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 2,
          p: 4,
        }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Contáctanos
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            ¿Tienes dudas o quieres saber más? Escríbenos y te responderemos a la brevedad.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="mailto:contacto@leanmaker.com"
            sx={{ borderRadius: 50 }}
          >
            Enviar correo
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, mt: 'auto', borderTop: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Leanmaker. Todos los derechos reservados.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
