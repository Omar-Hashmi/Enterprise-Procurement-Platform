import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';

export const PieChart = ({
  title = '',
  subtitle = '',
  data = [],            // Array of { id: 0, value: 35, label: 'Approved', color: '#2e7d32' }
  height = 300,
  outerRadius = 100,
  isLoading = false,
  emptyMessage = 'No chart data available',
  sx = {},
  ...props
}) => {
  const hasData = data && data.length > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: 'divider',
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <Box sx={{ p: 2, pb: 0 }}>
          {title && (
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          p: 2,
        }}
      >
        {isLoading ? (
          <Skeleton variant="circular" width={outerRadius * 2} height={outerRadius * 2} animation="wave" />
        ) : !hasData ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MuiPieChart
              series={[
                {
                  data,
                  outerRadius,
                  paddingAngle: 1,
                  cornerRadius: 2,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { additionalRadius: -5, color: 'gray' },
                },
              ]}
              height={height}
              slotProps={{
                legend: {
                  direction: 'column',
                  position: { vertical: 'middle', horizontal: 'right' },
                  padding: 0,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChart;