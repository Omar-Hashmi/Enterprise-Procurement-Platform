import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';

export const DonutChart = ({
  title = '',
  subtitle = '',
  data = [],            // Array of { id: 0, value: 10, label: 'Approved', color: '#4caf50' }
  height = 300,
  innerRadius = 60,     // Controls the donut hole size
  outerRadius = 100,
  isLoading = false,
  emptyMessage = 'No chart data available',
  centerLabel = '',     // Optional text inside the donut center
  centerSublabel = '',  // Optional subtext inside the donut center
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
          position: 'relative',
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
          <Box sx={{ width: '100%', height, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MuiPieChart
              series={[
                {
                  data,
                  innerRadius,
                  outerRadius,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -5, color: 'gray' },
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

            {/* Optional Overlay Text for Donut Center */}
            {(centerLabel || centerSublabel) && (
              <Box
                sx={{
                  position: 'absolute',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {centerLabel && (
                  <Typography variant="h5" fontWeight={700} color="text.primary">
                    {centerLabel}
                  </Typography>
                )}
                {centerSublabel && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {centerSublabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DonutChart;