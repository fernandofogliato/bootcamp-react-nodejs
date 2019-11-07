import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  Filter,
  ButtonStatus,
  Pagination,
} from './styles';
import Container from '../../components/Container';

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default class Repository extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repoName: '',
      repository: {},
      issues: [],
      loading: true,
      filters: [
        { state: 'all', label: 'All' },
        { state: 'open', label: 'Open' },
        { state: 'closed', label: 'Closed' },
      ],
      filterIndex: 0,
      page: 1,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const { statusIssues } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: statusIssues,
          per_page: 5,
          page: 1,
        },
      }),
    ]);

    this.setState({
      repoName,
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilterClick = filterIndex => {
    this.setState({ filterIndex });
    this.loadIssues();
  };

  loadIssues = async () => {
    const { repoName, filters, page, filterIndex } = this.state;
    const { state } = filters[filterIndex];

    try {
      this.setState({ loading: true });
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
          page,
        },
      });

      this.setState({
        issues: issues.data,
        loading: false,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        loading: false,
      });
    }
  };

  handleNextPage = async e => {
    e.preventDefault();
    const { page } = this.state;
    this.setState({ page: page + 1 });
    this.loadIssues();
  };

  handlePreviousPage = async e => {
    e.preventDefault();
    const { page } = this.state;
    this.setState({ page: page - 1 });
    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      page,
      filterIndex,
    } = this.state;

    if (loading) {
      return <Loading>Loading data...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Back to repositories</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Filter>
          {filters.map((filter, index) => (
            <ButtonStatus
              key={filter.label}
              selected={index === filterIndex}
              onClick={() => this.handleFilterClick(index)}
            >
              {filter.label}
            </ButtonStatus>
          ))}
        </Filter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Pagination>
          <button
            type="button"
            onClick={this.handlePreviousPage}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Showing 5 results for page {page}</span>
          <button type="button" onClick={this.handleNextPage}>
            Next
          </button>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = propTypes;
