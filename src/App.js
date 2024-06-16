import './App.css';
import React, { useState } from 'react';
import {Container, Typography } from '@mui/material';
import RepoList from './component/RepoList';

function App() {
  const [page, setPage] = useState(1);

  const loadMoreRepos = () => {
    setPage(page + 1);
  };
  return (
    <div className="App">
      <Container>
        <Typography variant="h4" sx={{ my: 4 }}>Most Starred Repos</Typography>
        <RepoList page={page} />
      </Container>
    </div>
  );
}

export default App;
