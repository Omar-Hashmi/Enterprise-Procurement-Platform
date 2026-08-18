import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';

export const BarChart = ({
  title = '',
  subtitle = '',
  dataset = [],         // Array of objects, e.g. [{ month: 'Jan', requests: 40, orders: 24 }]
  xAxisKey = '',        // Key for X-axis categories (e.g., 'month')
  series = [],          // Array of { dataKey: 'requests', label: 'Requests', color: '#1976d2' }
  height = 300,
  layout = 'vertical',  // 'vertical' | 'horizontal'
  isLoading = false,
  emptyMessage = 'No chart data available',
  sx = {},
  ...props
}) => {
  const hasData = dataset && dataset.length > 0;

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

      <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        {isLoading ? (
          <Skeleton variant="rounded" width="100%" height={height} animation="wave" />
        ) : !hasData ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          <Box sx={{ width: '100%', height }}>
            <MuiBarChart
              dataset={dataset}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: xAxisKey,
                },
              ]}
              series={series.map((item) => ({
                dataKey: item.dataKey,
                label: item.label,
                color: item.color,
              }))}
              layout={layout}
              height={height}
              margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'right' },
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

export default BarChart;