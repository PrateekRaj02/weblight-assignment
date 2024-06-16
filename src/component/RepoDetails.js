
import React, { useState, useEffect } from "react";
import { Box, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { commit_activity, contributor, code_frequency } from "../constant";

const REACT_APP_GITHUB_TOKEN = "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";

const RepoDetails = ({ repo }) => {
  const [commitActivity, setCommitActivity] = useState([]);
  const [codeFrequency, setCodeFrequency] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("commits");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [commitResponse, codeResponse, contributorResponse] = await Promise.all([
          axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/stats/commit_activity`, {
            headers: {
              'Authorization': `token ${REACT_APP_GITHUB_TOKEN}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }),
          axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/stats/code_frequency`, {
            headers: {
              'Authorization': `token ${REACT_APP_GITHUB_TOKEN}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }),
          axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/stats/contributors`, {
            headers: {
              'Authorization': `token ${REACT_APP_GITHUB_TOKEN}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }),
        ]);

        setCommitActivity(commitResponse.data.length ? commitResponse.data : commit_activity);
        setCodeFrequency(codeResponse.data.length ? codeResponse.data : code_frequency);
        setContributors(contributorResponse.data.length ? contributorResponse.data : contributor);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch repository stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [repo]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString();

  const metricData = {
    commits: commitActivity.map(week => ({ date: formatDate(week.week), count: week.total })),
    additions: codeFrequency.map(week => ({ date: formatDate(week[0]), count: week[1] })),
    deletions: codeFrequency.map(week => ({ date: formatDate(week[0]), count: week[2] })),
  };

  const contributorsData = contributors.flatMap(contributor => 
    contributor.weeks.map(week => ({
      date: formatDate(week.w),
      contributor: contributor.author.login,
      additions: week.a,
      deletions: week.d,
      commits: week.c,
    }))
  );

  const metricOptions = {
    title: { text: `Total ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}` },
    xAxis: {
      categories: metricData[selectedMetric].map(data => data.date),
      title: { text: 'Week' },
    },
    yAxis: {
      title: { text: 'Count' },
    },
    series: [{
      name: selectedMetric,
      data: metricData[selectedMetric].map(data => data.count),
    }],
    tooltip: {
      formatter: function () {
        return `Date: ${this.x}<br/>Count: ${this.y}`;
      }
    },
  };

  const contributorsOptions = {
    title: { text: 'Contributor Changes' },
    xAxis: {
      categories: contributorsData.map(data => data.date),
      title: { text: 'Week' },
    },
    yAxis: {
      title: { text: 'Count' },
    },
    series: contributors.map(contributor => ({
      name: contributor.author.login,
      data: contributorsData.filter(data => data.contributor === contributor.author.login).map(data => data.commits),
    })),
    tooltip: {
      formatter: function () {
        return `Date: ${this.x}<br/>Commits: ${this.y}`;
      }
    },
  };

  return (
    <Box>
      <Typography variant="h6">Total Changes</Typography>
      <FormControl variant="outlined" sx={{ mt: 2, mb: 4 }}>
        <InputLabel>Metric</InputLabel>
        <Select
          value={selectedMetric}
          onChange={handleMetricChange}
          label="Metric"
        >
          <MenuItem value="commits">Commits</MenuItem>
          <MenuItem value="additions">Additions</MenuItem>
          <MenuItem value="deletions">Deletions</MenuItem>
        </Select>
      </FormControl>
      <HighchartsReact highcharts={Highcharts} options={metricOptions} />

      <Typography variant="h6" sx={{ mt: 4 }}>
        Contributor Changes
      </Typography>
      <HighchartsReact highcharts={Highcharts} options={contributorsOptions} />
    </Box>
  );
};

export default RepoDetails;
