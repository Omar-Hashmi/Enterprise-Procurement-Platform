import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart';

export const LineChart = ({
  title = '',
  subtitle = '',
  dataset = [],         // Array of objects, e.g. [{ month: 'Jan', spent: 1200, budget: 2000 }]
  xAxisKey = '',        // Key for X-axis categories (e.g., 'month')
  series = [],          // Array of { dataKey: 'spent', label: 'Total Spent', color: '#1976d2', area: false, curve: 'linear' }
  height = 300,
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
            <MuiLineChart
              dataset={dataset}
              xAxis={[
                {
                  scaleType: 'point',
                  dataKey: xAxisKey,
                },
              ]}
              series={series.map((item) => ({
                dataKey: item.dataKey,
                label: item.label,
                color: item.color,
                area: item.area || false,
                curve: item.curve || 'natural', // 'linear' | 'natural' | 'step'
                showMark: item.showMark ?? true,
              }))}
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

export default LineChart;