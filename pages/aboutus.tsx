//*mui
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

function AboutUs() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{ display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          About Us
        </Typography>
        <Box>
          <Typography gutterBottom>
            With roots tracing back to 1973 as YS Color Foto Studio, Photoversal
            Studio has grown into a trusted name in professional photography.
            Over the decades, we’ve expanded our services to include school
            photography, portrait sessions, event photography, passport photos,
            printing services, corporate shoots, and photobooth experiences.
          </Typography>
          <Typography gutterBottom>
            What sets us apart is our commitment to personalised service. We
            understand that every client is unique, and our team of experienced
            photographers works closely with each one to bring their vision to
            life, capturing moments that matter with creativity and care.
          </Typography>
          <Typography gutterBottom>
            We’ve had the privilege of working closely with government schools
            and private kindergartens, especially within the SJKC community. To
            date, we’ve served more than 70 SJKC schools, a testament to the
            trust placed in us. These long-standing partnerships are built on
            consistency, reliability, and shared values. From individual student
            portraits to timeless graduation memories, we are honoured to play a
            part in preserving these important milestones.
          </Typography>
          <Typography gutterBottom>
            As we continue to grow, we look forward to bringing our services to
            even more schools across different states in Malaysia.
          </Typography>
          <Typography gutterBottom>
            At Photoversal Studio, we embrace the digital era, seamlessly
            blending traditional photography with modern technology. From online
            galleries to instant social media sharing, we help clients relive
            and share their happiest moments effortlessly. With a strong focus
            on quality, attention to detail, and the latest techniques, we
            ensure that every image we deliver is one to be cherished for a
            lifetime.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default AboutUs;
