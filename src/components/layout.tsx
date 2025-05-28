import React from "react";
import { Box, Grid, Typography } from "@mui/material";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [editor, preview] = React.Children.toArray(children);

  return (
    <Box sx={{ height: "100vh", p: 2 }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h5" gutterBottom>
            Editor
          </Typography>
          {editor}
        </Grid>
        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h5" gutterBottom>
            Preview
          </Typography>
          {preview}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Layout;
