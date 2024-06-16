
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Avatar, Button, CircularProgress, Card, CardContent, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RepoDetails from './RepoDetails';

const RepoList = () => {
  const [repos, setRepos] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(false);
  // console.log(repos);

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      const response = await fetch(`https://api.github.com/search/repositories?q=created:>2023-05-15&sort=stars&order=desc&page=${page}`);
      const data = await response.json();
      // console.log(data);
      setRepos(prevRepos => [...prevRepos, ...data.items]);
      setLoading(false);
    };
    fetchRepos();
  }, [page]);

  const loadMoreRepos = () => {
    setPage(page + 1);
  };

  return (
    <Container>
      {repos.map(repo => (
        <Card key={repo.id} sx={{ mb: 2 }}>
          <CardContent onClick={() => setSelectedRepo(selectedRepo === repo ? null : repo)}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={repo.owner.avatar_url} alt={repo.owner.login} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{repo.name}</Typography>
                <Typography variant="body1">{repo.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">Stars: {repo.stargazers_count}</Typography>
                  <Typography variant="body2">Issues: {repo.open_issues_count}</Typography>
                  <Typography variant="body2">
                    Last pushed {new Date(repo.pushed_at).toLocaleDateString()} by {repo.owner.login}
                  </Typography>
                </Box>
              </Box>
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
          </CardContent>
          {selectedRepo === repo && (
            <CardContent>
              <RepoDetails repo={repo} />
            </CardContent>
          )}
        </Card>
      ))}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Button variant="contained" onClick={loadMoreRepos} sx={{ mt: 2 }}>Load more</Button>
      )}
    </Container>
  );
};

export default RepoList;
