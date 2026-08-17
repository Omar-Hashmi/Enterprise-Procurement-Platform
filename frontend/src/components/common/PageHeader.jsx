import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';

export const PageHeader = ({ title, subtitle, action, breadcrumbs }) => {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}
    >
      <Box>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 1, fontSize: '0.75rem' }}>
            {breadcrumbs.map((crumb, idx) =>
              crumb.href ? (
                <Link key={idx} underline="hover" color="inherit" href={crumb.href}>
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={idx} color="text.primary" sx={{ fontSize: '0.75rem' }}>
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h2" component="h1" sx={{ color: 'text.primary', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default PageHeader;
