import { useState, useEffect } from 'react';
import AuthWrapper from "../../components/AuthWrapper";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('views');
  const [order, setOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredAnalytics = analytics
    .filter(item => 
      item.postTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const isAsc = order === 'asc';
      if (orderBy === 'views') {
        return isAsc ? a.views - b.views : b.views - a.views;
      }
      return isAsc 
        ? a[orderBy] - b[orderBy] 
        : b[orderBy] - a[orderBy];
    });

  return (
    <AuthWrapper>
      <Box sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4, borderRadius: '12px' }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#1e293b',
                mb: 4
              }}
            >
              Post Analytics
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ py: 2 }}>
                {error}
              </Typography>
            ) : (
              <>
                {/* Search Box */}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={handleSearch}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Post Title</TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={orderBy === 'views'}
                            direction={orderBy === 'views' ? order : 'asc'}
                            onClick={() => handleRequestSort('views')}
                          >
                            Views
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={orderBy === 'googleCrawlerVisits'}
                            direction={orderBy === 'googleCrawlerVisits' ? order : 'asc'}
                            onClick={() => handleRequestSort('googleCrawlerVisits')}
                          >
                            Google Crawler Visits
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={orderBy === 'googlebotVisits'}
                            direction={orderBy === 'googlebotVisits' ? order : 'asc'}
                            onClick={() => handleRequestSort('googlebotVisits')}
                          >
                            Googlebot Visits
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={orderBy === 'adsenseBotVisits'}
                            direction={orderBy === 'adsenseBotVisits' ? order : 'asc'}
                            onClick={() => handleRequestSort('adsenseBotVisits')}
                          >
                            AdSense Bot Visits
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Last Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAnalytics
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow key={row._id}>
                            <TableCell>{row.postTitle}</TableCell>
                            <TableCell align="right">{row.views}</TableCell>
                            <TableCell align="right">{row.googleCrawlerVisits}</TableCell>
                            <TableCell align="right">{row.googlebotVisits}</TableCell>
                            <TableCell align="right">{row.adsenseBotVisits}</TableCell>
                            <TableCell align="right">
                              {new Date(row.lastUpdated).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredAnalytics.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </AuthWrapper>
  );
}